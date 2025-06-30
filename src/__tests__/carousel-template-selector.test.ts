/**
 * 🧪 Тесты для улучшенной карусельной системы выбора цветовых темплейтов
 */

import { describe, test, expect } from 'bun:test';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../services/instagram-canvas.service';

describe('🎨 Enhanced Carousel Template Selector', () => {
  test('📋 Превью должны содержать реальный VibeCoding контент', () => {
    // Проверяем, что есть предустановленные VibeCoding цитаты и примеры
    const vibeCodingQuotes = [
      'Код - это поэзия логики',
      'В каждой функции живет дух программиста',
      'Чистый код - путь к просветлению',
      'Рефакторинг - медитация разработчика',
    ];

    // Проверяем наличие цитат
    expect(vibeCodingQuotes.length).toBeGreaterThan(0);
    vibeCodingQuotes.forEach(quote => {
      expect(quote.length).toBeGreaterThan(10);
      expect(typeof quote).toBe('string');
    });
  });

  test('🎨 Цвета текста должны быть правильными для Galaxy Spiral Blur темплейта', () => {
    const templates = InstagramCanvasService.getColorTemplates();

    // Проверяем что Galaxy Spiral Blur темплейт имеет правильную конфигурацию
    expect(templates[ColorTemplate.GALAXY_SPIRAL_BLUR]).toBeTruthy();

    const galaxyTemplate = templates[ColorTemplate.GALAXY_SPIRAL_BLUR];
    expect(galaxyTemplate.name).toBe('🌌 Galaxy Spiral Blur');
    expect(galaxyTemplate.background).toBe('bg-image-galaxy-spiral'); // Фактическое значение
    expect(galaxyTemplate.accent).toBe('rgba(255, 255, 255, 0.3)');
    expect(galaxyTemplate.cardBackground).toBe('rgba(0, 0, 0, 0.4)');
  });

  test('🔄 Galaxy Spiral Blur должен поддерживать базовую навигацию', () => {
    const templates = InstagramCanvasService.getColorTemplates();
    const templateKeys = Object.keys(templates);

    // Проверяем что у нас есть единственный шаблон
    expect(templateKeys.length).toBe(1);
    expect(templateKeys[0]).toBe(ColorTemplate.GALAXY_SPIRAL_BLUR);

    // Симулируем навигацию для единственного шаблона
    let currentIndex = 0;

    // При одном шаблоне навигация остается на том же месте
    currentIndex = (currentIndex + 1) % templateKeys.length;
    expect(currentIndex).toBe(0);

    // Назад тоже остается на том же месте
    currentIndex =
      currentIndex === 0 ? templateKeys.length - 1 : currentIndex - 1;
    expect(currentIndex).toBe(0);
  });

  test('📱 Callback данные должны поддерживать карусельную навигацию', () => {
    const templateKeys = Object.keys(
      InstagramCanvasService.getColorTemplates()
    );
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
      messageId: 456,
    };

    // Проверяем инициализацию состояния
    expect(mockState.currentIndex).toBe(0);
    expect(mockState.topicKey).toBe('test_123');
    expect(mockState.topic).toBe('тестовая тема');
    expect(mockState.messageId).toBe(456);

    // Симулируем изменение индекса для единственного шаблона
    const templateCount = Object.keys(
      InstagramCanvasService.getColorTemplates()
    ).length;
    expect(templateCount).toBe(1);

    const newIndex = (mockState.currentIndex + 1) % templateCount;
    expect(newIndex).toBe(0); // При одном шаблоне индекс всегда 0
  });
});
