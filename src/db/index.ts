/**
 * Инициализация подключения к базе данных Neon с помощью Drizzle ORM
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config";
import { logger, LogType } from "../utils/logger";
import * as schema from "./schema";

// Проверяем наличие URL для подключения к базе данных
if (!config.DATABASE_URL && process.env.NODE_ENV !== "test") {
  logger.warn(
    "DATABASE_URL не указан. База данных не будет подключена. Используйте MemoryAdapter для тестирования.",
    { type: LogType.SYSTEM }
  );
}

// Создаем пул соединений, если URL базы данных указан
const pool = config.DATABASE_URL
  ? new Pool({
      connectionString: config.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Для Neon Database
      },
    })
  : null;

// Инициализируем Drizzle ORM
export const db = pool ? drizzle(pool, { schema }) : null;

/**
 * Функция для проверки соединения с базой данных
 * @returns Promise<boolean> - true, если соединение успешно, иначе false
 */
export async function testConnection(): Promise<boolean> {
  if (!db || !pool) return false;

  try {
    // Пробуем выполнить простой запрос
    await pool.query("SELECT 1");
    logger.info("Соединение с базой данных успешно установлено", {
      type: LogType.SYSTEM,
    });
    return true;
  } catch (error) {
    logger.error("Ошибка при подключении к базе данных", {
      error: error instanceof Error ? error : new Error(String(error)),
      type: LogType.ERROR,
    });
    return false;
  }
}

/**
 * Функция для закрытия соединения с базой данных
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info("Соединение с базой данных закрыто", {
      type: LogType.SYSTEM,
    });
  }
}
