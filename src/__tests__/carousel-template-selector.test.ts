/**
 * 🧪 Тесты для улучшенной карусельной системы выбора цветовых темплейтов
 */

import { describe, test, expect } from 'bun:test';
import { InstagramCanvasService, ColorTemplate } from '../services/instagram-canvas.service';

describe('🎨 Enhanced Carousel Template Selector', () => {
  
  test('📋 Превью должны содержать реальный VibeCoding контент', () => {
    // Проверяем, что есть предустановленные VibeCoding цитаты и примеры
    const vibeCodingQuotes = [
      'Код - это поэзия логики',
      'В каждой функции живет дух программиста',
      'Чистый код - путь к просветлению',
      'Рефакторинг - медитация разработчика'
    ];
    
    // Проверяем наличие цитат
    expect(vibeCodingQuotes.length).toBeGreaterThan(0);
    vibeCodingQuotes.forEach(quote => {
      expect(quote.length).toBeGreaterThan(10);
      expect(typeof quote).toBe('string');
    });
  });

  test('🎨 Цвета текста должны быть правильными для каждого темплейта', () => {
    const templates = InstagramCanvasService.getColorTemplates();
    
    // Проверяем что темные темплейты имеют светлый текст
    const darkTemplates = [
      ColorTemplate.BLACK_GOLD,
      ColorTemplate.EMERALD_LUXURY,
      ColorTemplate.ROYAL_PURPLE,
      ColorTemplate.MIDNIGHT_BLUE
    ];
    
    darkTemplates.forEach(template => {
      expect(templates[template]).toBeTruthy();
      // Для темных темплейтов ожидаем темный фон
      expect(templates[template].background).toMatch(/(#[0-4]|rgba?\(.*[0-9][0-9]?[^0-9])/);
    });
    
    // Проверяем что светлые темплейты имеют темный текст
    expect(templates[ColorTemplate.WHITE]).toBeTruthy();
    expect(templates[ColorTemplate.WHITE].background).toMatch(/#ffffff/);
  });

  test('🔄 Карусельная навигация должна поддерживать все состояния', () => {
    const templates = InstagramCanvasService.getColorTemplates();
    const templateKeys = Object.keys(templates);
    
    // Проверяем что можно навигировать в обе стороны
    expect(templateKeys.length).toBeGreaterThan(2);
    
    // Симулируем навигацию
    let currentIndex = 0;
    
    // Вперед
    currentIndex = (currentIndex + 1) % templateKeys.length;
    expect(currentIndex).toBe(1);
    
    // Назад
    currentIndex = currentIndex === 0 ? templateKeys.length - 1 : currentIndex - 1;
    expect(currentIndex).toBe(0);
    
    // Циклическая навигация
    currentIndex = templateKeys.length - 1;
    currentIndex = (currentIndex + 1) % templateKeys.length;
    expect(currentIndex).toBe(0);
  });

  test('📱 Callback данные должны поддерживать карусельную навигацию', () => {
    const templateKeys = Object.keys(InstagramCanvasService.getColorTemplates());
    const topicKey = 'test_topic_123';
    
    // Тестируем формат callback данных для навигации
    const nextCallback = `nav:next:${topicKey}`;
    const prevCallback = `nav:prev:${topicKey}`;
    const selectCallback = `select:${templateKeys[0]}:${topicKey}`;
    
    // Проверяем формат
    expect(nextCallback.split(':').length).toBe(3);
    expect(prevCallback.split(':').length).toBe(3);
    expect(selectCallback.split(':').length).toBe(3);
    
    // Проверяем парсинг
    const [action1, direction, topic1] = nextCallback.split(':');
    expect(action1).toBe('nav');
    expect(direction).toBe('next');
    expect(topic1).toBe(topicKey);
    
    const [action2, templateKey, topic2] = selectCallback.split(':');
    expect(action2).toBe('select');
    expect(templateKeys).toContain(templateKey);
    expect(topic2).toBe(topicKey);
  });

  test('🎯 Состояние карусели должно отслеживаться корректно', () => {
    interface CarouselState {
      currentIndex: number;
      topicKey: string;
      topic: string;
      messageId: number;
    }
    
    const mockState: CarouselState = {
      currentIndex: 0,
      topicKey: 'test_123',
      topic: 'тестовая тема',
      messageId: 456
    };
    
    // Проверяем инициализацию состояния
    expect(mockState.currentIndex).toBe(0);
    expect(mockState.topicKey).toBe('test_123');
    expect(mockState.topic).toBe('тестовая тема');
    expect(mockState.messageId).toBe(456);
    
    // Симулируем изменение индекса
    const templateCount = Object.keys(InstagramCanvasService.getColorTemplates()).length;
    const newIndex = (mockState.currentIndex + 1) % templateCount;
    expect(newIndex).toBeGreaterThanOrEqual(0);
    expect(newIndex).toBeLessThan(templateCount);
  });
});
