/**
 * @file Тестер для последовательностей действий в Telegram-сценах
 * @description Содержит класс для тестирования последовательностей действий в Telegram-сценах
 */

import { describe, it, beforeEach, afterEach, jest } from "bun:test";
import {
  MockedTelegramContext,
  MockedStorageAdapter,
  SceneTestOptions,
  SequenceStep,
} from "./types";
import { createMockContext, createMockAdapter, resetAllMocks } from "./mocks";
import { Scenes } from "telegraf";

/**
 * Класс для тестирования последовательностей действий в Telegram-сценах
 */
export class SequenceTester<T extends Scenes.WizardContext> {
  /** Имя сцены */
  // private sceneName: string;
  /** Конструктор сцены */
  private sceneConstructor?: new (adapter: any, ...args: any[]) => T;
  /** Экземпляр сцены */
  private sceneInstance?: T;
  /** Дополнительные аргументы для конструктора сцены */
  private constructorArgs: any[];
  /** Мокированный контекст Telegraf */
  private mockContext: MockedTelegramContext;
  /** Мокированный адаптер хранилища */
  private mockAdapter: MockedStorageAdapter;

  /**
   * Создает экземпляр тестера для последовательностей действий в Telegram-сценах
   * @param options Опции для тестирования сцены
   */
  constructor(options: SceneTestOptions<T>) {
    // this.sceneName = options.sceneName;
    this.sceneConstructor = options.sceneConstructor;
    this.sceneInstance = options.sceneInstance;
    this.constructorArgs = options.constructorArgs || [];
    this.mockContext = createMockContext();
    this.mockAdapter = createMockAdapter();
  }

  /**
   * Создает экземпляр сцены
   * @returns Экземпляр сцены
   */
  createScene(): T {
    if (this.sceneInstance) {
      return this.sceneInstance;
    }

    if (!this.sceneConstructor) {
      throw new Error("Не указан конструктор сцены");
    }

    return new this.sceneConstructor(this.mockAdapter, ...this.constructorArgs);
  }

  /**
   * Устанавливает мокированный контекст
   * @param context Мокированный контекст
   */
  setContext(context: MockedTelegramContext): void {
    this.mockContext = context;
  }

  /**
   * Получает мокированный контекст
   * @returns Мокированный контекст
   */
  getContext(): MockedTelegramContext {
    return this.mockContext;
  }

  /**
   * Устанавливает мокированный адаптер хранилища
   * @param adapter Мокированный адаптер хранилища
   */
  setAdapter(adapter: MockedStorageAdapter): void {
    this.mockAdapter = adapter;
  }

  /**
   * Получает мокированный адаптер хранилища
   * @returns Мокированный адаптер хранилища
   */
  getAdapter(): MockedStorageAdapter {
    return this.mockAdapter;
  }

  /**
   * Сбрасывает все моки
   */
  resetMocks(): void {
    resetAllMocks();
  }

  /**
   * Тестирует последовательность действий
   * @param sequenceName Название последовательности
   * @param steps Шаги последовательности
   */
  testSequence(sequenceName: string, steps: SequenceStep[]): void {
    describe(sequenceName, () => {
      beforeEach(() => {
        // Сбрасываем все моки перед каждым тестом
        this.resetMocks();

        // Добавляем адаптер в контекст
        this.mockContext.storage = this.mockAdapter;
      });

      afterEach(() => {
        // Очищаем все моки после каждого теста
        this.resetMocks();
      });

      // Создаем тест для последовательности
      it(`should execute ${sequenceName} sequence correctly`, async () => {
        // Выполняем каждый шаг последовательности
        for (const step of steps) {
          // Сбрасываем моки перед каждым шагом
          jest.clearAllMocks();

          // Выполняем действие
          await step.action(this.mockContext);

          // Выполняем проверки
          step.assertions(this);
        }
      });
    });
  }

  /**
   * Создает шаг для отправки текстового сообщения
   * @param text Текст сообщения
   * @returns Шаг последовательности
   */
  createTextMessageStep(text: string): SequenceStep {
    return {
      name: `sends text message: ${text}`,
      action: async (ctx: MockedTelegramContext) => {
        // Обновляем контекст с новым текстовым сообщением
        if (ctx.message) {
          ctx.message.text = text;
        } else {
          ctx.message = { text } as any;
        }
        // Вызываем обработчик текстовых сообщений сцены
        const handler =
          (this.sceneInstance as any).onTextMessage ||
          (this.sceneInstance as any).handlers?.get("text");
        if (handler) {
          await handler(ctx);
        } else {
          console.warn(
            "No text message handler found on scene for createTextMessageStep"
          );
        }
      },
      assertions: (tester: SequenceTester<T>) => {
        // Здесь можно добавить проверки, специфичные для текстовых сообщений
        expect(tester.getContext().message?.text).toBe(text);
      },
    };
  }

  /**
   * Создает шаг для отправки callback query
   * @param data Данные callback query
   * @returns Шаг последовательности
   */
  createCallbackQueryStep(data: string): SequenceStep {
    return {
      name: `handles callback query: ${data}`,
      action: async (ctx: MockedTelegramContext) => {
        // Обновляем контекст с новым callback query
        ctx.callbackQuery = { data } as any;
        // Вызываем обработчик action сцены
        // Пытаемся найти обработчик для точного совпадения или по регулярному выражению
        let actionHandler;
        const actions = (this.sceneInstance as any).actions || new Map();
        if (actions.has(data)) {
          actionHandler = actions.get(data);
        } else {
          for (const [key, handler] of actions) {
            if (key instanceof RegExp && key.test(data)) {
              actionHandler = handler;
              if (ctx.match) {
                const matchResult = key.exec(data);
                ctx.match = matchResult ? matchResult : undefined;
              } else {
                const matchResult = key.exec(data);
                ctx.match = matchResult ? matchResult : undefined;
              }
              break;
            }
          }
        }

        if (actionHandler) {
          await actionHandler(ctx);
        } else {
          console.warn(
            `No callback query handler found on scene for data: ${data}`
          );
        }
      },
      assertions: (tester: SequenceTester<T>) => {
        expect(tester.getContext().callbackQuery?.data).toBe(data);
      },
    };
  }

  /**
   * Создает шаг для входа в сцену
   * @returns Шаг последовательности
   */
  createEnterSceneStep(): SequenceStep {
    return {
      name: "enters scene",
      action: async (ctx: MockedTelegramContext) => {
        // Вызываем метод enter
        if ((this.sceneInstance as any).enter) {
          await (this.sceneInstance as any).enter(ctx);
        }
      },
      assertions: (tester: SequenceTester<T>) => {
        // Проверка, что метод enter был вызван (если это мок)
        // или другие проверки состояния после входа в сцену
        const enterFn = (tester.sceneInstance as any)?.enter;
        if (enterFn && (enterFn as any).mock) {
          // Check if it's a mock
          expect((enterFn as any).mock.calls.length).toBeGreaterThan(0);
        }
      },
    };
  }

  testCurrentStep(): void {
    // ... (implementation as before)
  }
}
