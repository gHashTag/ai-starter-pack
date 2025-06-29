/**
 * Inngest Test Utilities
 *
 * Утилиты для тестирования Inngest функций в соответствии с лучшими практиками.
 * Включает моки, хелперы и вспомогательные функции для тестирования.
 */

import { vi, type MockedFunction } from 'vitest';
import type { Inngest } from 'inngest';
import type {
  HelloWorldEventData,
  HelloWorldResult,
} from '../../inngest/functions/hello-world';

/**
 * Мок для Inngest клиента
 */
export const createMockInngest = () => {
  const mockSend = vi.fn();
  const mockCreateFunction = vi.fn();

  const mockInngest = {
    send: mockSend,
    createFunction: mockCreateFunction,
    id: 'test-inngest-client',
    name: 'Test Inngest Client',
  } as unknown as Inngest & {
    send: MockedFunction<typeof mockSend>;
    createFunction: MockedFunction<typeof mockCreateFunction>;
  };

  return {
    inngest: mockInngest,
    mockSend,
    mockCreateFunction,
  };
};

/**
 * Мок для Inngest event context
 */
export const createMockEventContext = <T = any>(eventData: T) => {
  const mockStep = {
    run: vi.fn().mockImplementation(async (_name: string, fn: Function) => {
      return await fn();
    }),
    sleep: vi.fn().mockResolvedValue(undefined),
    waitForEvent: vi.fn(),
    sendEvent: vi.fn(),
  };

  const mockEvent = {
    id: `test-event-${Date.now()}`,
    name: 'test/event',
    data: eventData,
    timestamp: new Date().toISOString(),
    user: {},
    version: '2023-05-15',
  };

  return {
    event: mockEvent,
    step: mockStep,
    mockStep,
  };
};

/**
 * Фабрика тестовых данных для Hello World функции
 */
export const createHelloWorldTestData = {
  /**
   * Базовые тестовые данные
   */
  basic: (): HelloWorldEventData => ({
    name: 'Test User',
    language: 'en',
    timestamp: '2024-01-01T00:00:00.000Z',
  }),

  /**
   * Данные с русским языком
   */
  russian: (): HelloWorldEventData => ({
    name: 'Тестовый Пользователь',
    language: 'ru',
    timestamp: '2024-01-01T00:00:00.000Z',
  }),

  /**
   * Минимальные данные (только обязательные поля)
   */
  minimal: (): HelloWorldEventData => ({}),

  /**
   * Данные с неподдерживаемым языком
   */
  unsupportedLanguage: (): HelloWorldEventData => ({
    name: 'Test User',
    language: 'de' as any, // German - не поддерживается
    timestamp: '2024-01-01T00:00:00.000Z',
  }),
};

/**
 * Валидаторы для результатов функций
 */
export const validators = {
  /**
   * Проверка результата Hello World функции
   */
  helloWorldResult: (
    result: HelloWorldResult,
    _expectedData: Partial<HelloWorldEventData> = {}
  ) => {
    const expectations = {
      hasMessage: () => expect(result.message).toBeDefined(),
      hasProcessedAt: () => expect(result.processedAt).toBeDefined(),
      hasValidTimestamp: () =>
        expect(new Date(result.processedAt).getTime()).toBeGreaterThan(0),
      hasEnvironment: () => {
        expect(result.environment).toBeDefined();
        expect(result.environment.nodeEnv).toBeDefined();
        expect(result.environment.inngestPort).toBeTypeOf('number');
      },
      hasEventData: () => expect(result.eventData).toBeDefined(),
      messageContainsName: (name: string) =>
        expect(result.message).toContain(name),
      hasCorrectLanguage: (language: string) => {
        if (language === 'ru') {
          expect(result.message).toContain('Привет');
        } else if (language === 'es') {
          expect(result.message).toContain('Hola');
        } else if (language === 'fr') {
          expect(result.message).toContain('Bonjour');
        } else {
          expect(result.message).toContain('Hello');
        }
      },
    };

    return expectations;
  },
};

/**
 * Утилиты для тестирования портов
 */
export const portTestUtils = {
  /**
   * Создание мока для проверки доступности портов
   */
  createPortCheckMock: (availablePorts: number[] = [8288, 8289]) => {
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      const port = parseInt(url.match(/:(\d+)/)?.[1] || '0');

      if (availablePorts.includes(port)) {
        return { ok: true };
      } else {
        throw new Error('Connection refused');
      }
    });

    // Заменяем глобальный fetch
    global.fetch = mockFetch as any;

    return mockFetch;
  },

  /**
   * Восстановление оригинального fetch
   */
  restoreFetch: () => {
    vi.restoreAllMocks();
  },
};

/**
 * Хелперы для тестирования событий
 */
export const eventTestHelpers = {
  /**
   * Создание тестового события
   */
  createTestEvent: <T>(name: string, data: T) => ({
    name,
    data,
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    user: {},
    version: '2023-05-15',
  }),

  /**
   * Симуляция отправки события
   */
  simulateEventSend: async <T>(
    mockSend: MockedFunction<any>,
    eventName: string,
    eventData: T
  ) => {
    const event = eventTestHelpers.createTestEvent(eventName, eventData);
    mockSend.mockResolvedValueOnce({ id: event.id });

    const result = await mockSend({
      name: eventName,
      data: eventData,
    });

    return { event, result };
  },
};

/**
 * Конфигурация для тестового окружения
 */
export const testEnvironment = {
  /**
   * Настройка переменных окружения для тестов
   */
  setup: () => {
    process.env.NODE_ENV = 'test';
    process.env.INNGEST_DEV_PORT = '8288';
    process.env.INNGEST_CONNECT_PORT = '8289';
  },

  /**
   * Очистка после тестов
   */
  cleanup: () => {
    delete process.env.INNGEST_DEV_PORT;
    delete process.env.INNGEST_CONNECT_PORT;
    vi.clearAllMocks();
  },
};

/**
 * Экспорт всех утилит
 */
export default {
  createMockInngest,
  createMockEventContext,
  createHelloWorldTestData,
  validators,
  portTestUtils,
  eventTestHelpers,
  testEnvironment,
};
