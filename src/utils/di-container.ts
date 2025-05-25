import { Telegraf } from "telegraf";
import { CustomContext } from "../bot"; // Предполагается, что CustomContext будет экспортирован из bot.ts
import { logger } from "./logger"; // Предполагается, что logger существует
import { I18n } from "telegraf-i18n"; // Если используется

// Определяем интерфейс для зависимостей, чтобы обеспечить типобезопасность
export interface AppDependencies {
  bot: Telegraf<CustomContext>;
  logger: typeof logger;
  config: AppConfig; // Будет определен в config.ts
  i18n?: I18n; // Опционально, если i18n используется
  // Другие сервисы и зависимости можно добавить сюда
  // storage: StorageAdapter; // Если будем регистрировать через DI
}

// Простая заглушка для конфигурации, чтобы избежать ошибок импорта
export interface AppConfig {
  BOT_TOKEN: string;
  NODE_ENV?: string;
  LOG_LEVEL?: string;
  // другие параметры конфигурации
}

// Простая реализация DI контейнера (можно заменить на inversify, tsyringe и т.д.)
class SimpleDIContainer {
  private dependencies: Map<keyof AppDependencies, any> = new Map();

  public bind<K extends keyof AppDependencies>(
    key: K
  ): { toConstantValue: (value: AppDependencies[K]) => void } {
    return {
      toConstantValue: (value: AppDependencies[K]): void => {
        this.dependencies.set(key, value);
      },
    };
  }

  public get<K extends keyof AppDependencies>(key: K): AppDependencies[K] {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependency not found for key: ${String(key)}`);
    }
    return dependency;
  }

  public getAll(): AppDependencies {
    // Это упрощенный метод, в реальности может потребоваться более сложная логика
    // или явное указание всех ключей для сборки объекта.
    // Здесь мы просто преобразуем Map в объект, что не гарантирует полноту AppDependencies.
    const allDeps: Partial<AppDependencies> = {};
    this.dependencies.forEach((value, key) => {
      (allDeps as any)[key] = value;
    });
    return allDeps as AppDependencies; // Рискованное приведение типа
  }
}

export const container = new SimpleDIContainer();
