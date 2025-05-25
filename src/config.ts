import * as dotenv from "dotenv";
import { LogLevel } from "./utils/logger";

// Загружаем переменные из .env файла
dotenv.config();

export interface AppConfig {
  BOT_TOKEN: string;
  NODE_ENV: "development" | "production" | "test";
  LOG_LEVEL: LogLevel;
  // Настройки базы данных Neon
  DATABASE_URL?: string;
  // Опциональные параметры для использования веб-хуков вместо long polling
  WEBHOOK_DOMAIN?: string;
  PORT?: number;
  // Apollo Client конфигурация
  GRAPHQL_ENDPOINT?: string;
}

/**
 * Валидирует обязательные параметры конфигурации
 * @param config Объект конфигурации для проверки
 * @throws Ошибку с описанием отсутствующих параметров
 */
const validateRequiredConfig = (config: Partial<AppConfig>): void => {
  const missingVars: string[] = [];

  if (!config.BOT_TOKEN) {
    missingVars.push("BOT_TOKEN");
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}. ` +
        "Please check your .env file or environment variables."
    );
  }
};

/**
 * Создает объект конфигурации на основе переменных окружения
 * @returns Объект AppConfig с параметрами приложения
 */
const createConfig = (): AppConfig => {
  const partialConfig: Partial<AppConfig> = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    NODE_ENV: (process.env.NODE_ENV as AppConfig["NODE_ENV"]) || "development",
    LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    DATABASE_URL: process.env.DATABASE_URL,
    WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN,
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
  };

  // Проверяем обязательные параметры
  validateRequiredConfig(partialConfig);

  // Если мы дошли до этой точки, значит все обязательные параметры присутствуют
  return partialConfig as AppConfig;
};

// Создаем и экспортируем конфигурацию
export const config: AppConfig = (() => {
  try {
    return createConfig();
  } catch (error) {
    console.error(`FATAL CONFIG ERROR: ${(error as Error).message}`);
    process.exit(1);
  }
})();

// Экспортируем тип конфигурации для использования в context
export type BotConfig = Readonly<AppConfig>;
