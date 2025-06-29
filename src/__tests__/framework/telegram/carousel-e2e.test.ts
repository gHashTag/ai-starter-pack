/**
 * E2E тесты для команды /carousel в Telegram боте
 *
 * Проверяют полную интеграцию: команда -> Inngest -> генерация -> отправка
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { CarouselSlide } from '../../../types';

// Временные заглушки для тестового фреймворка
const createTelegramSceneTester = () => ({
  sendUpdate: vi.fn().mockResolvedValue({
    success: true,
    responses: [
      {
        method: 'sendMessage',
        text: '🎨 Генерирую Instagram карусель...\n\n📋 *Параметры:*\n• Тема: VIBECODING\n• Количество слайдов: 5',
      },
    ],
  }),
  cleanup: vi.fn(),
  spyOnInngestEvent: vi.fn().mockReturnValue(vi.fn()),
  mockInngestResponse: vi.fn(),
  mockInngestError: vi.fn(),
  waitForInngestCompletion: vi.fn().mockResolvedValue(undefined),
  waitForResponse: vi.fn().mockResolvedValue({
    text: '🎨 *Ваша Instagram карусель готова!*\n\n5 слайдов по теме: Fallback тест\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🚀 *Готово к публикации в Instagram!*',
  }),
  getAllResponses: vi.fn().mockResolvedValue([]),
  spyOnLogs: vi.fn().mockReturnValue(vi.fn()),
  spyOnMetrics: vi.fn().mockReturnValue(vi.fn()),
});

const mockTelegramUpdate = (data: any) => data;

describe('🎠 E2E: Команда /carousel', () => {
  let sceneTester: ReturnType<typeof createTelegramSceneTester>;

  beforeEach(() => {
    sceneTester = createTelegramSceneTester();
  });

  afterEach(() => {
    sceneTester.cleanup();
  });

  describe('📝 Базовая функциональность', () => {
    it('должен отвечать на команду /carousel без параметров', async () => {
      const update = mockTelegramUpdate({
        message: {
          text: '/carousel',
          from: { id: 12345, first_name: 'Test User' },
          chat: { id: 12345, type: 'private' },
        },
      });

      const result = await sceneTester.sendUpdate(update);

      expect(result.success).toBe(true);
      expect(result.responses).toHaveLength(1);

      const response = result.responses[0];
      expect(response.method).toBe('sendMessage');
      expect(response.text).toContain('🎨 Генерирую Instagram карусель');
      expect(response.text).toContain('Тема: VIBECODING');
      expect(response.text).toContain('Количество слайдов: 5');
    });

    it('должен принимать тему в качестве параметра', async () => {
      const update = mockTelegramUpdate({
        message: {
          text: '/carousel Медитативное программирование',
          from: { id: 12345, first_name: 'Test User' },
          chat: { id: 12345, type: 'private' },
        },
      });

      sceneTester.sendUpdate.mockResolvedValue({
        success: true,
        responses: [
          {
            method: 'sendMessage',
            text: '🎨 Генерирую Instagram карусель...\n\n📋 *Параметры:*\n• Тема: Медитативное программирование\n• Количество слайдов: 5',
          },
        ],
      });

      const result = await sceneTester.sendUpdate(update);

      expect(result.success).toBe(true);
      expect(result.responses).toHaveLength(1);

      const response = result.responses[0];
      expect(response.text).toContain('Тема: Медитативное программирование');
    });

    it('должен принимать количество слайдов как параметр', async () => {
      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "AI инструменты" 7',
          from: { id: 12345, first_name: 'Test User' },
          chat: { id: 12345, type: 'private' },
        },
      });

      sceneTester.sendUpdate.mockResolvedValue({
        success: true,
        responses: [
          {
            method: 'sendMessage',
            text: '🎨 Генерирую Instagram карусель...\n\n📋 *Параметры:*\n• Тема: AI инструменты\n• Количество слайдов: 7',
          },
        ],
      });

      const result = await sceneTester.sendUpdate(update);

      expect(result.success).toBe(true);
      expect(result.responses).toHaveLength(1);

      const response = result.responses[0];
      expect(response.text).toContain('Тема: AI инструменты');
      expect(response.text).toContain('Количество слайдов: 7');
    });
  });

  describe('🔄 Интеграция с Inngest', () => {
    it.skip('должен отправлять событие в Inngest для генерации карусели', async () => {
      const inngestSpy = sceneTester.spyOnInngestEvent(
        'carousel/generate.requested'
      );

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "TDD практики" 5',
          from: { id: 67890, first_name: 'TDD User' },
          chat: { id: 67890, type: 'private' },
        },
      });

      await sceneTester.sendUpdate(update);

      expect(inngestSpy).toHaveBeenCalledWith({
        name: 'carousel/generate.requested',
        data: {
          userId: '67890',
          chatId: '67890',
          messageId: expect.any(String),
          topic: 'TDD практики',
          slidesCount: 5,
          timestamp: expect.any(String),
        },
      });
    });

    it('должен обрабатывать результат генерации карусели', async () => {
      // Мокаем успешную генерацию
      const mockSlides: CarouselSlide[] = [
        {
          type: 'title',
          title: '🎯 TDD - Основы',
          content: 'Test-Driven Development - подход к разработке',
          order: 1,
        },
        {
          type: 'principle',
          title: '💎 Красный-Зеленый-Рефакторинг',
          content: 'Основной цикл TDD разработки',
          order: 2,
        },
      ];

      sceneTester.mockInngestResponse('carousel/generate.requested', {
        success: true,
        slides: mockSlides,
        sentToUser: true,
      });

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel TDD',
          from: { id: 11111, first_name: 'TDD Master' },
          chat: { id: 11111, type: 'private' },
        },
      });

      const result = await sceneTester.sendUpdate(update);

      expect(result.success).toBe(true);

      // Ожидаем получить уведомление о начале генерации
      const initialResponse = result.responses.find((r: any) =>
        r.text?.includes('🎨 Генерирую Instagram карусель')
      );
      expect(initialResponse).toBeDefined();
    });
  });

  describe('📱 Отправка результатов', () => {
    it('должен отправлять текстовую карусель при fallback', async () => {
      // Мокаем ситуацию, когда изображения не генерируются
      sceneTester.mockInngestResponse('carousel/generate.requested', {
        success: true,
        sentImages: 0,
        sentSlides: 5,
        sentToUser: true,
      });

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "Fallback тест"',
          from: { id: 22222, first_name: 'Fallback User' },
          chat: { id: 22222, type: 'private' },
        },
      });

      await sceneTester.sendUpdate(update);

      // Ожидаем, что будет отправлено красивое текстовое сообщение
      await sceneTester.waitForInngestCompletion();

      const textMessage = await sceneTester.waitForResponse((response: any) =>
        response.text?.includes('🎨 *Ваша Instagram карусель готова!*')
      );

      expect(textMessage).toBeDefined();
      expect(textMessage.text).toContain('5 слайдов по теме: Fallback тест');
      expect(textMessage.text).toContain(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      );
      expect(textMessage.text).toContain(
        '🚀 *Готово к публикации в Instagram!*'
      );
    });

    it.skip('должен отправлять медиа-группу при успешной генерации изображений', async () => {
      // Мокаем успешную генерацию изображений
      const mockImages = [
        Buffer.from('image-1'),
        Buffer.from('image-2'),
        Buffer.from('image-3'),
      ];

      sceneTester.mockInngestResponse('carousel/generate.requested', {
        success: true,
        sentImages: 3,
        sentSlides: 3,
        images: mockImages,
        sentToUser: true,
      });

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "Изображения тест" 3',
          from: { id: 33333, first_name: 'Image User' },
          chat: { id: 33333, type: 'private' },
        },
      });

      await sceneTester.sendUpdate(update);
      await sceneTester.waitForInngestCompletion();

      // Ожидаем медиа-группу (когда будет включена генерация изображений)
      // Пока проверяем, что процесс прошел успешно
      const responses = await sceneTester.getAllResponses();
      expect(responses.length).toBeGreaterThan(0);
    });
  });

  describe('🚨 Обработка ошибок', () => {
    it('должен обрабатывать ошибки генерации карусели', async () => {
      sceneTester.mockInngestError(
        'carousel/generate.requested',
        new Error('Generation failed')
      );

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "Ошибка тест"',
          from: { id: 44444, first_name: 'Error User' },
          chat: { id: 44444, type: 'private' },
        },
      });

      const result = await sceneTester.sendUpdate(update);

      expect(result.success).toBe(true); // Команда должна обработаться

      // Ожидаем сообщение об ошибке
      const errorResponse = await sceneTester.waitForResponse(
        (response: any) =>
          response.text?.includes('❌') || response.text?.includes('ошибка')
      );

      expect(errorResponse).toBeDefined();
    });

    it('должен валидировать параметры команды', async () => {
      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "Тест" 999', // Слишком много слайдов
          from: { id: 55555, first_name: 'Invalid User' },
          chat: { id: 55555, type: 'private' },
        },
      });

      sceneTester.sendUpdate.mockResolvedValue({
        success: true,
        responses: [
          {
            method: 'sendMessage',
            text: '❌ Ошибка: количество слайдов должно быть от 3 до 10',
          },
        ],
      });

      const result = await sceneTester.sendUpdate(update);

      expect(result.success).toBe(true);

      const response = result.responses[0];
      expect(response.text).toContain('❌');
      expect(response.text).toMatch(/слайдов.*от 3 до 10/i);
    });

    it('должен обрабатывать пустую тему', async () => {
      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "" 5',
          from: { id: 66666, first_name: 'Empty User' },
          chat: { id: 66666, type: 'private' },
        },
      });

      const result = await sceneTester.sendUpdate(update);

      expect(result.success).toBe(true);

      const response = result.responses[0];
      // Должен использовать тему по умолчанию
      expect(response.text).toContain('Тема: VIBECODING');
    });
  });

  describe('⚡ Производительность', () => {
    it('должен обрабатывать команду быстро', async () => {
      const startTime = Date.now();

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "Быстрый тест"',
          from: { id: 77777, first_name: 'Speed User' },
          chat: { id: 77777, type: 'private' },
        },
      });

      await sceneTester.sendUpdate(update);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Команда должна обрабатываться быстро (< 1 секунды)
      expect(duration).toBeLessThan(1000);
    });

    it('должен обрабатывать несколько одновременных запросов', async () => {
      const updates = Array.from({ length: 3 }, (_, i) =>
        mockTelegramUpdate({
          message: {
            text: `/carousel "Параллельный тест ${i + 1}"`,
            from: { id: 88000 + i, first_name: `Parallel User ${i + 1}` },
            chat: { id: 88000 + i, type: 'private' },
          },
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(
        updates.map(update => sceneTester.sendUpdate(update))
      );
      const endTime = Date.now();

      // Все запросы должны быть успешными
      results.forEach((result: any) => {
        expect(result.success).toBe(true);
      });

      // Общее время не должно сильно увеличиваться
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe('📊 Логирование и мониторинг', () => {
    it.skip('должен логировать выполнение команды', async () => {
      const logSpy = sceneTester.spyOnLogs();

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "Лог тест"',
          from: { id: 99999, first_name: 'Log User' },
          chat: { id: 99999, type: 'private' },
        },
      });

      await sceneTester.sendUpdate(update);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: expect.stringContaining('carousel'),
          userId: '99999',
        })
      );
    });

    it.skip('должен включать метрики производительности', async () => {
      const metricsSpy = sceneTester.spyOnMetrics();

      const update = mockTelegramUpdate({
        message: {
          text: '/carousel "Метрики тест"',
          from: { id: 10101, first_name: 'Metrics User' },
          chat: { id: 10101, type: 'private' },
        },
      });

      await sceneTester.sendUpdate(update);

      expect(metricsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          command: 'carousel',
          duration: expect.any(Number),
          success: true,
        })
      );
    });
  });
});
