#!/usr/bin/env bun

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, extname, basename } from 'path';
import { createHash } from 'crypto';
import { Pool } from 'pg';
import OpenAI from 'openai';

// 🕉️ Улучшенная конфигурация для качественной векторизации
const CONFIG = {
  VIBECODING_PATH: './vibecoding',
  CHUNK_SIZE: 800, // Оптимальный размер для семантики
  CHUNK_OVERLAP: 100, // Уменьшенное перекрытие для избежания дублирования
  MIN_CHUNK_SIZE: 200, // Минимальный размер чанка
  OPENAI_MODEL: 'text-embedding-3-small', // 1536 dimensions
  BATCH_SIZE: 5, // Уменьшенный батч для стабильности
};

// Инициализация клиентов
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface ImprovedChunk {
  sourcePath: string;
  sourceFile: string;
  chunkIndex: number;
  title?: string;
  content: string;
  cleanContent: string; // Очищенный контент для эмбеддинга
  tokenCount: number;
  chunkHash: string;
  metadata: {
    file_category: string;
    section_type: string;
    semantic_level: number; // Глубина вложенности заголовков
    has_code: boolean;
    has_philosophy: boolean;
    content_quality: 'high' | 'medium' | 'low';
    keywords: string[];
  };
}

/**
 * 🎯 Точная токенизация с использованием approximation для русского текста
 */
function accurateTokenCount(text: string): number {
  // Более точная оценка для русского/английского смешанного текста
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const characters = text.length;
  
  // Формула учитывающая особенности русского языка
  const byWords = words.length * 1.3; // Русские слова длиннее
  const byChars = characters / 3.5; // Более точная оценка для кириллицы
  
  return Math.ceil((byWords + byChars) / 2);
}

/**
 * 🧹 Очистка текста для лучшего качества эмбеддингов
 */
function cleanTextForEmbedding(text: string): string {
  return text
    // Убираем лишние markdown символы, но сохраняем структуру
    .replace(/#{1,6}\s/g, '') // Убираем маркеры заголовков
    .replace(/\*\*(.*?)\*\*/g, '$1') // Убираем жирный текст, сохраняем содержимое
    .replace(/\*(.*?)\*/g, '$1') // Убираем курсив
    .replace(/`([^`]+)`/g, '$1') // Убираем inline код
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Убираем ссылки, сохраняем текст
    // Убираем лишние эмодзи (но сохраняем философские символы)
    .replace(/[📱💻🚀⚡🎯📊🔧🛠️]/g, '')
    // Очищаем проблемные символы для UTF-8
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Удаляем control characters
    .replace(/\uFEFF/g, '') // Удаляем BOM
    // Нормализуем пробелы
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * 🎨 Извлечение ключевых слов из текста
 */
function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();
  
  // Технические термины
  const techTerms = text.match(/\b(AI|ИИ|API|MVP|TDD|JavaScript|TypeScript|React|Node\.js|Cursor|VSCode|Git|Docker|PostgreSQL|Redis|Inngest|Telegram|OpenAI|Claude|GPT|LLM|модель|embedding|vector|векторный|БД|база данных|архитектура|микросервис|монолит|фронтенд|бэкенд|fullstack|devops|ci\/cd|тестирование|деплой|продакшн|staging|development|код|программирование|разработка|рефакторинг|дебаг|отладка|профилирование|оптимизация)\b/gi);
  
  if (techTerms) {
    techTerms.forEach(term => keywords.add(term.toLowerCase()));
  }
  
  // Философские концепции VibeCoding
  const philosophyTerms = text.match(/\b(медитац\w*|интуиц\w*|поток|осознанность|намерение|доверие|гармония|баланс|энергия|вибрация|частота|резонанс|синхронизация|трансформация|эволюция|сознание|духовность|просветление|мудрость|истина|дхарма|карма|атман|брахман|йога|тантра|веда|упанишада|мантра|чакра|прана|самадhi|випассана|дзен|будда|бодхисаттва|нирвана|сансара|мокша)\b/gi);
  
  if (philosophyTerms) {
    philosophyTerms.forEach(term => keywords.add(term.toLowerCase()));
  }
  
  // Практические навыки
  const skillTerms = text.match(/\b(практик\w*|метод\w*|техник\w*|подход|стратег\w*|тактик\w*|инструмент|способ|прием|алгоритм|паттерн|принцип|правило|закон|концепция|идея|теория|гипотеза|эксперимент|опыт|навык|умение|мастерство|экспертиза|компетенция)\b/gi);
  
  if (skillTerms) {
    skillTerms.forEach(term => keywords.add(term.toLowerCase()));
  }
  
  return Array.from(keywords).slice(0, 10); // Ограничиваем количество
}

/**
 * 📏 Оценка качества контента
 */
function assessContentQuality(text: string): 'high' | 'medium' | 'low' {
  const length = text.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10).length;
  const hasStructure = /#{1,6}|^\s*[-*+]|\d+\./m.test(text);
  const hasExamples = /пример|example|например|к примеру|допустим/i.test(text);
  const hasCode = /```|`[^`]+`/.test(text);
  
  let score = 0;
  
  if (length > 500) score += 2;
  else if (length > 200) score += 1;
  
  if (sentences > 3) score += 1;
  if (hasStructure) score += 1;
  if (hasExamples) score += 1;
  if (hasCode) score += 1;
  
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * 🔍 Улучшенное определение типа секции
 */
function detectImprovedSectionType(content: string): string {
  // Анализируем контент более детально
  if (/```[\s\S]*?```/.test(content)) {
    if (content.split('```').length > 3) return 'code_heavy';
    return 'code_example';
  }
  
  if (/^#{1}\s/m.test(content)) return 'chapter';
  if (/^#{2}\s/m.test(content)) return 'main_section';
  if (/^#{3}\s/m.test(content)) return 'subsection';
  if (/^#{4,6}\s/m.test(content)) return 'detail_section';
  
  if (/🕉️|🧘|медитац|интуиц|осознанность|сознание|духовность/i.test(content)) {
    return 'philosophy';
  }
  
  if (/пример|example|демонстрац|показ|иллюстрац/i.test(content)) {
    return 'example';
  }
  
  if (/практик|упражнение|задание|воркшоп|мастер-класс/i.test(content)) {
    return 'practice';
  }
  
  if (/определение|что такое|термин|понятие|концепция/i.test(content)) {
    return 'definition';
  }
  
  if (/список|перечень|шаг|этап|алгоритм|инструкция/i.test(content)) {
    return 'instruction';
  }
  
  return 'general_content';
}

/**
 * 📂 Улучшенная категоризация файлов
 */
function detectImprovedFileCategory(filePath: string): string {
  const path = filePath.toLowerCase();
  
  // Основные категории по структуре VibeCoding
  if (path.includes('основы') || path.includes('fundamentals')) return 'fundamentals';
  if (path.includes('практики') || path.includes('practices')) return 'practices';
  if (path.includes('инструменты') || path.includes('tools')) return 'tools';
  if (path.includes('развитие') || path.includes('development')) return 'development';
  if (path.includes('аналитика') || path.includes('analytics')) return 'analytics';
  if (path.includes('архив') || path.includes('archive')) return 'archive';
  if (path.includes('главная') || path.includes('main')) return 'main_book';
  
  // По содержимому файла
  if (path.includes('philosophy') || path.includes('философия')) return 'philosophy';
  if (path.includes('workshop') || path.includes('воркшоп')) return 'workshop';
  if (path.includes('tutorial') || path.includes('туториал')) return 'tutorial';
  if (path.includes('guide') || path.includes('гайд')) return 'guide';
  if (path.includes('reference') || path.includes('справочник')) return 'reference';
  
  return 'general';
}

/**
 * 🧩 Умное разбиение текста на семантические чанки
 */
function semanticChunking(content: string, filePath: string): ImprovedChunk[] {
  const chunks: ImprovedChunk[] = [];
  
  // Разделяем на секции по заголовкам разного уровня
  const sections = content.split(/(?=^#{1,6}\s)/gm).filter(s => s.trim());
  
  let globalChunkIndex = 0;
  
  for (const section of sections) {
    const sectionTokens = accurateTokenCount(section);
    
    // Если секция умещается в один чанк
    if (sectionTokens <= CONFIG.CHUNK_SIZE) {
      if (sectionTokens >= CONFIG.MIN_CHUNK_SIZE) {
        chunks.push(createChunk(section, filePath, globalChunkIndex++));
      }
    } else {
      // Разбиваем большую секцию на подчанки
      const subChunks = splitLargeSection(section, filePath, globalChunkIndex);
      chunks.push(...subChunks);
      globalChunkIndex += subChunks.length;
    }
  }
  
  return chunks;
}

/**
 * ✂️ Разбиение больших секций с сохранением семантики
 */
function splitLargeSection(section: string, filePath: string, startIndex: number): ImprovedChunk[] {
  const chunks: ImprovedChunk[] = [];
  
  // Пытаемся разбить по параграфам (двойные переносы)
  const paragraphs = section.split(/\n\s*\n/).filter(p => p.trim());
  
  let currentChunk = '';
  let chunkIndex = startIndex;
  
  for (const paragraph of paragraphs) {
    const currentTokens = accurateTokenCount(currentChunk);
    const paragraphTokens = accurateTokenCount(paragraph);
    
    if (currentTokens + paragraphTokens > CONFIG.CHUNK_SIZE && currentChunk.trim()) {
      // Сохраняем текущий чанк
      chunks.push(createChunk(currentChunk.trim(), filePath, chunkIndex++));
      
      // Начинаем новый с небольшим перекрытием
      const overlap = getSemanticOverlap(currentChunk);
      currentChunk = overlap + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Добавляем последний чанк
  if (currentChunk.trim() && accurateTokenCount(currentChunk) >= CONFIG.MIN_CHUNK_SIZE) {
    chunks.push(createChunk(currentChunk.trim(), filePath, chunkIndex++));
  }
  
  return chunks;
}

/**
 * 🔗 Семантическое перекрытие для сохранения контекста
 */
function getSemanticOverlap(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  // Берем последние 1-2 предложения для контекста
  const overlapSentences = sentences.slice(-2);
  const overlap = overlapSentences.join('. ') + (overlapSentences.length > 0 ? '. ' : '');
  
  // Ограничиваем размер перекрытия
  if (accurateTokenCount(overlap) > CONFIG.CHUNK_OVERLAP) {
    return overlap.substring(0, CONFIG.CHUNK_OVERLAP * 4) + '...';
  }
  
  return overlap;
}

/**
 * 🎯 Создание улучшенного чанка
 */
function createChunk(content: string, filePath: string, index: number): ImprovedChunk {
  const cleanContent = cleanTextForEmbedding(content);
  const keywords = extractKeywords(content);
  
  return {
    sourcePath: filePath,
    sourceFile: basename(filePath),
    chunkIndex: index,
    title: extractTitle(content),
    content: content.trim(),
    cleanContent,
    tokenCount: accurateTokenCount(content),
    chunkHash: createHash('sha256').update(content.trim()).digest('hex'),
    metadata: {
      file_category: detectImprovedFileCategory(filePath),
      section_type: detectImprovedSectionType(content),
      semantic_level: getSemanticLevel(content),
      has_code: /```|`[^`]+`/.test(content),
      has_philosophy: /🕉️|🧘|медитац|интуиц|осознанность|сознание|духовность/i.test(content),
      content_quality: assessContentQuality(content),
      keywords,
    },
  };
}

/**
 * 📏 Определение семантического уровня (глубина заголовков)
 */
function getSemanticLevel(content: string): number {
  const headerMatch = content.match(/^(#{1,6})\s/m);
  return headerMatch ? headerMatch[1].length : 0;
}

/**
 * 📝 Улучшенное извлечение заголовка
 */
function extractTitle(content: string): string | undefined {
  // Ищем первый заголовок любого уровня
  const titleMatch = content.match(/^#{1,6}\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1]
      .replace(/[🔥⚡🎯📊🧘🕉️]/g, '') // Убираем эмодзи
      .trim();
  }
  
  // Если заголовка нет, берем первое предложение
  const firstSentence = content.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length > 10 && firstSentence.length < 100) {
    return firstSentence;
  }
  
  return undefined;
}

/**
 * 🤖 Улучшенная генерация эмбеддингов батчами
 */
async function generateImprovedEmbeddings(chunks: ImprovedChunk[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  // Обрабатываем батчами для стабильности
  for (let i = 0; i < chunks.length; i += CONFIG.BATCH_SIZE) {
    const batch = chunks.slice(i, i + CONFIG.BATCH_SIZE);
    const texts = batch.map(chunk => chunk.cleanContent);
    
    console.log(`🚀 Генерируем эмбеддинги для батча ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(chunks.length / CONFIG.BATCH_SIZE)} (${batch.length} чанков)`);
    
    try {
      const response = await openai.embeddings.create({
        model: CONFIG.OPENAI_MODEL,
        input: texts,
      });
      
      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
      
      // Небольшая пауза между батчами для соблюдения rate limits
      if (i + CONFIG.BATCH_SIZE < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Ошибка при генерации эмбеддингов для батча ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}:`, error);
      throw error;
    }
  }
  
  return embeddings;
}

/**
 * 💾 Сохранение улучшенных чанков в БД
 */
async function saveImprovedChunks(
  chunks: ImprovedChunk[],
  embeddings: number[][],
  connectionString: string
): Promise<void> {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`💾 Сохраняем ${chunks.length} улучшенных чанков в базу данных...`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      
      await client.query(
        `
        INSERT INTO vibecoding_vectors.document_chunks 
        (source_file, source_path, chunk_index, title, content, embedding, metadata, token_count, chunk_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (source_path, chunk_index) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          metadata = EXCLUDED.metadata,
          token_count = EXCLUDED.token_count,
          chunk_hash = EXCLUDED.chunk_hash,
          updated_at = NOW()
        `,
        [
          chunk.sourceFile,
          chunk.sourcePath,
          chunk.chunkIndex,
          chunk.title,
          chunk.content,
          `[${embedding.join(',')}]`,
          JSON.stringify(chunk.metadata),
          chunk.tokenCount,
          chunk.chunkHash,
        ]
      );
      
      if ((i + 1) % 10 === 0) {
        console.log(`   📝 Обработано ${i + 1}/${chunks.length} чанков`);
      }
    }
    
    await client.query('COMMIT');
    console.log(`✅ Все ${chunks.length} чанков успешно сохранены!`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка при сохранении в БД:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * 📚 Сканирование markdown файлов
 */
async function scanMarkdownFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scanDir(currentPath: string) {
    try {
      const items = await readdir(currentPath);
      
      for (const item of items) {
        const fullPath = join(currentPath, item);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await scanDir(fullPath);
        } else if (stats.isFile() && extname(item).toLowerCase() === '.md') {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Не удается прочитать директорию ${currentPath}:`, error);
    }
  }
  
  await scanDir(dirPath);
  return files;
}

/**
 * 🚀 Главная функция улучшенной векторизации
 */
export async function improvedVectorization(connectionString: string): Promise<void> {
  console.log('🕉️ =====================================');
  console.log('🧘 УЛУЧШЕННАЯ ВЕКТОРИЗАЦИЯ VIBECODING');
  console.log('🕉️ =====================================\n');
  
  try {
    // 1. Сканируем файлы
    console.log('📚 Сканируем markdown файлы...');
    const files = await scanMarkdownFiles(CONFIG.VIBECODING_PATH);
    console.log(`📄 Найдено ${files.length} файлов для обработки\n`);
    
    if (files.length === 0) {
      throw new Error(`Не найдено markdown файлов в директории ${CONFIG.VIBECODING_PATH}`);
    }
    
    // 2. Обрабатываем файлы
    const allChunks: ImprovedChunk[] = [];
    
    for (const filePath of files) {
      console.log(`📖 Обрабатываем: ${basename(filePath)}`);
      
      try {
        const content = await readFile(filePath, 'utf-8');
        // Нормализуем UTF-8 кодировку
        const normalizedContent = content.normalize('NFC');
        const chunks = semanticChunking(normalizedContent, filePath);
        
        console.log(`   ✨ Создано ${chunks.length} семантических чанков`);
        allChunks.push(...chunks);
        
      } catch (error) {
        console.error(`   ❌ Ошибка при обработке ${filePath}:`, error);
      }
    }
    
    console.log(`\n🎯 Всего подготовлено ${allChunks.length} чанков для векторизации\n`);
    
    // 3. Генерируем эмбеддинги
    console.log('🤖 Генерируем векторные эмбеддинги...');
    const embeddings = await generateImprovedEmbeddings(allChunks);
    
    // 4. Сохраняем в базу данных
    console.log('\n💾 Сохраняем в базу данных...');
    await saveImprovedChunks(allChunks, embeddings, connectionString);
    
    // 5. Выводим статистику
    console.log('\n📊 СТАТИСТИКА ВЕКТОРИЗАЦИИ:');
    console.log(`📄 Обработано файлов: ${files.length}`);
    console.log(`🧩 Создано чанков: ${allChunks.length}`);
    console.log(`📏 Средний размер чанка: ${Math.round(allChunks.reduce((sum, c) => sum + c.tokenCount, 0) / allChunks.length)} токенов`);
    
    const qualityStats = allChunks.reduce((acc, chunk) => {
      acc[chunk.metadata.content_quality]++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
    
    console.log(`🏆 Качество контента:`);
    console.log(`   ✨ Высокое: ${qualityStats.high} чанков`);
    console.log(`   📖 Среднее: ${qualityStats.medium} чанков`);
    console.log(`   📝 Базовое: ${qualityStats.low} чанков`);
    
    console.log('\n🎉 =====================================');
    console.log('✅ УЛУЧШЕННАЯ ВЕКТОРИЗАЦИЯ ЗАВЕРШЕНА!');
    console.log('🕉️ =====================================');
    
  } catch (error) {
    console.error('\n❌ Критическая ошибка при векторизации:', error);
    throw error;
  }
}

// Запуск из командной строки
if (import.meta.main) {
  const connectionString = process.argv[2] || process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ Необходимо указать строку подключения к базе данных');
    console.log('💡 Использование: bun run scripts/improved-vectorizer.ts "connection_string"');
    console.log('💡 Или установите переменную DATABASE_URL');
    process.exit(1);
  }
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Необходимо установить переменную OPENAI_API_KEY');
    process.exit(1);
  }
  
  improvedVectorization(connectionString);
}
