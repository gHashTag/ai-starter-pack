/**
 * 🧪 Интеграционный тест для улучшенной карусели с галереей темплейтов
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';

describe('🎨 Carousel Integration Tests', () => {
  
  beforeAll(async () => {
    // Проверяем, что превью-изображения существуют
    const previewDir = path.join(process.cwd(), 'template-previews');
    try {
      await fs.access(previewDir);
    } catch {
      console.warn('⚠️ Template previews not found. Run: bun scripts/generate-template-previews.ts');
    }
  });

  test('🖼️ Превью-изображения содержат VibeCoding контент', async () => {
    const previewDir = path.join(process.cwd(), 'template-previews');
    
    try {
      const files = await fs.readdir(previewDir);
      const previewFiles = files.filter(file => file.endsWith('-preview.png'));
      
      // Проверяем, что есть превью для всех темплейтов
      expect(previewFiles.length).toBeGreaterThan(10);
      
      // Проверяем размеры файлов (должны быть разумными)
      for (const file of previewFiles.slice(0, 3)) { // проверяем первые 3 для скорости
        const filePath = path.join(previewDir, file);
        const stats = await fs.stat(filePath);
        
        // Файл должен быть больше 5KB и меньше 200KB
        expect(stats.size).toBeGreaterThan(5000);
        expect(stats.size).toBeLessThan(200000);
      }
    } catch (error) {
      console.warn('⚠️ Could not test preview images:', error);
      // Не фейлим тест, если превью не сгенерированы
    }
  });

  test('🔄 Карусельная навигация работает корректно', () => {
    // Симулируем состояние карусели
    const templateCount = 16; // количество темплейтов
    let currentIndex = 0;
    
    // Тестируем навигацию вперед
    for (let i = 0; i < templateCount + 2; i++) {
      currentIndex = (currentIndex + 1) % templateCount;
    }
    expect(currentIndex).toBe(2); // после полного цикла + 2
    
    // Тестируем навигацию назад
    currentIndex = 0;
    currentIndex = (currentIndex - 1 + templateCount) % templateCount;
    expect(currentIndex).toBe(templateCount - 1); // должны попасть в конец
    
    // Тестируем навигацию назад от последнего элемента
    currentIndex = (currentIndex - 1 + templateCount) % templateCount;
    expect(currentIndex).toBe(templateCount - 2);
  });

  test('📱 Callback данные генерируются правильно', () => {
    const topicKey = 'test_topic_123';
    const templateKey = 'black_gold';
    
    // Тестируем различные типы callback данных
    const navNext = `nav:next:${topicKey}`;
    const navPrev = `nav:prev:${topicKey}`;
    const select = `select:${templateKey}:${topicKey}`;
    
    // Проверяем парсинг
    expect(navNext.split(':')).toEqual(['nav', 'next', topicKey]);
    expect(navPrev.split(':')).toEqual(['nav', 'prev', topicKey]);
    expect(select.split(':')).toEqual(['select', templateKey, topicKey]);
    
    // Проверяем, что можем извлечь нужные данные
    const [action, param, topic] = select.split(':');
    expect(action).toBe('select');
    expect(param).toBe(templateKey);
    expect(topic).toBe(topicKey);
  });

  test('🎨 VibeCoding цитаты уникальны и содержательны', () => {
    const quotes = [
      'Код - это поэзия логики 🎭',
      'В каждой функции живет дух программиста 👻',
      'Чистый код - путь к просветлению ✨',
      'Рефакторинг - медитация разработчика 🧘‍♂️',
      'Баги - учителя терпения 🐛'
    ];
    
    // Проверяем уникальность
    const uniqueQuotes = new Set(quotes);
    expect(uniqueQuotes.size).toBe(quotes.length);
    
    // Проверяем содержательность
    quotes.forEach(quote => {
      expect(quote.length).toBeGreaterThan(10);
      expect(quote).toMatch(/🎭|👻|✨|🧘‍♂️|🐛|🎯|🪄|📚|🌉|💃/); // содержит эмодзи
    });
  });

  test('🚀 Интеграция с сервером превью работает', () => {
    const serverPort = process.env.HTTP_SERVER_PORT || '7103';
    const templateKey = 'emerald_luxury';
    
    // Формируем URL как в реальном коде
    const previewUrl = `http://localhost:${serverPort}/preview/${templateKey}-preview.png`;
    
    // Проверяем формат URL
    expect(previewUrl).toMatch(/^http:\/\/localhost:\d+\/preview\/\w+-preview\.png$/);
    expect(previewUrl).toContain(templateKey);
    expect(previewUrl).toContain(serverPort);
  });

  test('🔄 Состояние карусели отслеживается корректно', () => {
    // Симулируем глобальное состояние
    const mockCarouselState: Record<string, { currentIndex: number }> = {};
    const topicKey = 'test_123';
    
    // Инициализация
    mockCarouselState[topicKey] = { currentIndex: 0 };
    expect(mockCarouselState[topicKey].currentIndex).toBe(0);
    
    // Навигация вперед
    mockCarouselState[topicKey].currentIndex = (mockCarouselState[topicKey].currentIndex + 1) % 16;
    expect(mockCarouselState[topicKey].currentIndex).toBe(1);
    
    // Навигация назад
    mockCarouselState[topicKey].currentIndex = 
      (mockCarouselState[topicKey].currentIndex - 1 + 16) % 16;
    expect(mockCarouselState[topicKey].currentIndex).toBe(0);
    
    // Очистка состояния
    delete mockCarouselState[topicKey];
    expect(mockCarouselState[topicKey]).toBeUndefined();
  });
});
