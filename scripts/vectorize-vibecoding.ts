#!/usr/bin/env bun

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, extname, basename } from 'path';
import { createHash } from 'crypto';
import { Pool } from 'pg';
import OpenAI from 'openai';

// 🕉️ Конфигурация
const CONFIG = {
  VIBECODING_PATH: './vibecoding',
  CHUNK_SIZE: 1000, // токенов
  CHUNK_OVERLAP: 200, // токенов перекрытия
  OPENAI_MODEL: 'text-embedding-3-small', // 1536 dimensions
  NEON_CONNECTION:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
  BATCH_SIZE: 10, // чанков за раз для эмбеддинга
};

// Инициализация клиентов
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const pool = new Pool({
  connectionString: CONFIG.NEON_CONNECTION,
});

interface VibeCodingChunk {
  sourcePath: string;
  sourceFile: string;
  chunkIndex: number;
  title?: string;
  content: string;
  tokenCount: number;
  chunkHash: string;
  metadata: Record<string, any>;
}

/**
 * 🧘‍♂️ Простая токенизация для подсчета токенов (приблизительно)
 */
function estimateTokenCount(text: string): number {
  // Примерная оценка: 1 токен ≈ 4 символа для русского текста
  return Math.ceil(text.length / 4);
}

/**
 * 🎯 Разбивка текста на семантические чанки
 */
function chunkMarkdownText(
  content: string,
  filePath: string
): VibeCodingChunk[] {
  const chunks: VibeCodingChunk[] = [];

  // Разделяем по заголовкам для сохранения семантики
  const sections = content
    .split(/(?=^#{1,6}\s)/gm)
    .filter(section => section.trim());

  let currentChunk = '';
  let chunkIndex = 0;

  for (const section of sections) {
    const sectionTokens = estimateTokenCount(section);
    const currentTokens = estimateTokenCount(currentChunk);

    // Если добавление секции превышает лимит чанка
    if (
      currentTokens + sectionTokens > CONFIG.CHUNK_SIZE &&
      currentChunk.trim()
    ) {
      // Сохраняем текущий чанк
      chunks.push({
        sourcePath: filePath,
        sourceFile: basename(filePath),
        chunkIndex: chunkIndex++,
        title: extractTitle(currentChunk),
        content: currentChunk.trim(),
        tokenCount: currentTokens,
        chunkHash: createHash('sha256')
          .update(currentChunk.trim())
          .digest('hex'),
        metadata: {
          section_type: detectSectionType(currentChunk),
          file_category: detectFileCategory(filePath),
        },
      });

      // Начинаем новый чанк с перекрытием
      const overlap = getOverlapText(currentChunk, CONFIG.CHUNK_OVERLAP);
      currentChunk = overlap + section;
    } else {
      currentChunk += section;
    }
  }

  // Добавляем последний чанк
  if (currentChunk.trim()) {
    chunks.push({
      sourcePath: filePath,
      sourceFile: basename(filePath),
      chunkIndex: chunkIndex++,
      title: extractTitle(currentChunk),
      content: currentChunk.trim(),
      tokenCount: estimateTokenCount(currentChunk),
      chunkHash: createHash('sha256').update(currentChunk.trim()).digest('hex'),
      metadata: {
        section_type: detectSectionType(currentChunk),
        file_category: detectFileCategory(filePath),
      },
    });
  }

  return chunks;
}

/**
 * 📝 Извлечение заголовка из чанка
 */
function extractTitle(content: string): string | undefined {
  const titleMatch = content.match(/^#{1,6}\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : undefined;
}

/**
 * 🔍 Определение типа секции
 */
function detectSectionType(content: string): string {
  if (content.includes('```')) return 'code_example';
  if (content.match(/^#{1,2}\s/m)) return 'main_section';
  if (content.match(/^#{3,6}\s/m)) return 'subsection';
  if (content.includes('🕉️') || content.includes('🧘')) return 'philosophy';
  if (content.includes('### Пример') || content.includes('Example'))
    return 'example';
  return 'content';
}

/**
 * 📂 Определение категории файла по пути
 */
function detectFileCategory(filePath: string): string {
  if (filePath.includes('01-ОСНОВЫ')) return 'fundamentals';
  if (filePath.includes('02-ПРАКТИКИ')) return 'practices';
  if (filePath.includes('03-ИНСТРУМЕНТЫ')) return 'tools';
  if (filePath.includes('04-РАЗВИТИЕ')) return 'development';
  if (filePath.includes('05-АНАЛИТИКА')) return 'analytics';
  if (filePath.includes('06-АРХИВ')) return 'archive';
  if (filePath.includes('ГЛАВНАЯ КНИГА')) return 'main_book';
  return 'general';
}

/**
 * ✂️ Получение текста для перекрытия чанков
 */
function getOverlapText(content: string, overlapTokens: number): string {
  const words = content.split(/\s+/);
  const overlapWords = Math.floor((overlapTokens / 4) * 4); // приблизительно
  return words.slice(-overlapWords).join(' ') + '\n\n';
}

/**
 * 🤖 Генерация эмбеддингов через OpenAI
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    console.log(`🚀 Генерируем эмбеддинги для ${texts.length} чанков...`);

    const response = await openai.embeddings.create({
      model: CONFIG.OPENAI_MODEL,
      input: texts,
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('❌ Ошибка при генерации эмбеддингов:', error);
    throw error;
  }
}

/**
 * 💾 Сохранение чанков в базу данных
 */
async function saveChunksToDatabase(
  chunks: VibeCodingChunk[],
  embeddings: number[][]
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];

      await client.query(
        `
        INSERT INTO vibecoding_vectors.document_chunks 
        (source_file, source_path, chunk_index, title, content, embedding, metadata, token_count, content_hash, chunk_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (source_path, chunk_index) 
        DO UPDATE SET 
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          metadata = EXCLUDED.metadata,
          token_count = EXCLUDED.token_count,
          content_hash = EXCLUDED.content_hash,
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
          chunk.chunkHash, // content_hash
          chunk.chunkHash, // chunk_hash (тот же хеш)
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Сохранено ${chunks.length} чанков в базу данных`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка при сохранении в БД:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 📚 Рекурсивное сканирование markdown файлов
 */
async function scanMarkdownFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  async function scanDir(currentPath: string) {
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
  }

  await scanDir(dirPath);
  return files;
}

/**
 * 🎯 Основная функция векторизации
 */
async function vectorizeVibecoding(): Promise<void> {
  console.log('🕉️ Начинаем векторизацию Библии Vibecoding...\n');

  try {
    // 1. Сканируем markdown файлы
    console.log('📁 Сканируем markdown файлы...');
    const markdownFiles = await scanMarkdownFiles(CONFIG.VIBECODING_PATH);
    console.log(`Найдено ${markdownFiles.length} markdown файлов\n`);

    // 2. Обрабатываем каждый файл
    let totalChunks = 0;

    for (const filePath of markdownFiles) {
      console.log(`📄 Обрабатываем: ${relative('.', filePath)}`);

      const content = await readFile(filePath, 'utf-8');
      const chunks = chunkMarkdownText(content, relative('.', filePath));

      console.log(`  └─ Создано ${chunks.length} чанков`);

      // Обрабатываем чанки батчами для эмбеддингов
      for (let i = 0; i < chunks.length; i += CONFIG.BATCH_SIZE) {
        const batch = chunks.slice(i, i + CONFIG.BATCH_SIZE);
        const texts = batch.map(chunk => chunk.content);

        console.log(
          `  🤖 Генерируем эмбеддинги для чанков ${i + 1}-${Math.min(i + CONFIG.BATCH_SIZE, chunks.length)}...`
        );
        const embeddings = await generateEmbeddings(texts);

        console.log(`  💾 Сохраняем в базу данных...`);
        await saveChunksToDatabase(batch, embeddings);

        // Небольшая пауза между батчами чтобы не перегружать API
        if (i + CONFIG.BATCH_SIZE < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      totalChunks += chunks.length;
      console.log(`  ✅ Файл обработан\n`);
    }

    console.log(
      `🎉 Векторизация завершена! Обработано ${totalChunks} чанков из ${markdownFiles.length} файлов`
    );
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 🚀 Запуск если скрипт вызван напрямую
if (import.meta.main) {
  vectorizeVibecoding();
}

export { vectorizeVibecoding, CONFIG };
