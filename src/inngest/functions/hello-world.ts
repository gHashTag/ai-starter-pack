/**
 * Hello World Inngest Function
 *
 * Базовая функция "Hello World" для демонстрации работы Inngest
 * с кастомными портами и лучшими практиками.
 */

import { inngest } from '../client';

/**
 * Событие для триггера Hello World функции
 */
export const HELLO_WORLD_EVENT = 'demo/hello.world' as const;

/**
 * Типы для Hello World функции
 */
export interface HelloWorldEventData {
  name?: string;
  language?: 'en' | 'ru' | 'es' | 'fr';
  timestamp?: string;
}

export interface HelloWorldResult {
  message: string;
  processedAt: string;
  eventData: HelloWorldEventData;
  environment: {
    nodeEnv: string;
    inngestPort: number;
  };
}

/**
 * Hello World Inngest Function
 *
 * Принимает событие с опциональными параметрами и возвращает приветствие.
 * Демонстрирует базовые возможности Inngest и работу с кастомными портами.
 *
 * @example
 * ```typescript
 * // Отправка события
 * await inngest.send({
 *   name: 'demo/hello.world',
 *   data: { name: 'Гуру', language: 'ru' }
 * });
 * ```
 */
export const helloWorldFunction = inngest.createFunction(
  {
    id: 'hello-world',
    name: 'Hello World Function',

    // Настройки retry и timeout для надежности
    retries: 3,

    // Настройки для обработки ошибок
    onFailure: async ({ error, event, runId }) => {
      console.error(`Hello World function failed for run ${runId}:`, {
        error: error.message,
        eventName: event.name,
        eventData: event.data,
      });
    },
  },

  // Событие-триггер
  { event: HELLO_WORLD_EVENT },

  // Основная логика функции
  async ({ event, step }): Promise<HelloWorldResult> => {
    const {
      name = 'World',
      language = 'en',
      timestamp,
    } = event.data as HelloWorldEventData;

    // Шаг 1: Логирование входящего события
    await step.run('log-incoming-event', async () => {
      console.log('Processing Hello World event:', {
        name,
        language,
        timestamp: timestamp || new Date().toISOString(),
        runId: event.id,
      });

      return { logged: true };
    });

    // Шаг 2: Генерация приветствия в зависимости от языка
    const greeting = await step.run('generate-greeting', async () => {
      const greetings = {
        en: `Hello, ${name}! 👋`,
        ru: `Привет, ${name}! 🕉️`,
        es: `¡Hola, ${name}! 🌟`,
        fr: `Bonjour, ${name}! ✨`,
      };

      return greetings[language] || greetings.en;
    });

    // Шаг 3: Подготовка финального результата
    const result = await step.run(
      'prepare-result',
      async (): Promise<HelloWorldResult> => {
        return {
          message: greeting,
          processedAt: new Date().toISOString(),
          eventData: { name, language, timestamp },
          environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            inngestPort: parseInt(process.env.INNGEST_DEV_PORT || '8288'),
          },
        };
      }
    );

    // Шаг 4: Финальное логирование
    await step.run('log-completion', async () => {
      console.log('Hello World function completed successfully:', {
        message: result.message,
        processedAt: result.processedAt,
      });

      return { completed: true };
    });

    return result;
  }
);

/**
 * Вспомогательная функция для отправки Hello World события
 */
export const sendHelloWorldEvent = async (data: HelloWorldEventData = {}) => {
  return await inngest.send({
    name: HELLO_WORLD_EVENT,
    data: {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    },
  });
};

/**
 * Экспорт для регистрации функции
 */
export const helloWorld = helloWorldFunction;
export default helloWorldFunction;
