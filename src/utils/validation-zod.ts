import { z } from "zod";
import {
  UserSchema,
  UserSettingsSchema,
  SceneStateSchema,
  ActivityLogSchema,
  NotificationSettingsSchema,
} from "../schemas";

/**
 * Валидирует данные с помощью Zod схемы
 * @param schema Схема Zod для валидации
 * @param data Данные для валидации
 * @returns Валидированные данные или null в случае ошибки
 */
export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Валидирует данные пользователя с помощью Zod
 * @param data Данные пользователя для валидации
 * @returns Валидированные данные пользователя или null в случае ошибки
 */
export function validateUser(data: unknown) {
  return validateWithSchema(UserSchema, data);
}

/**
 * Валидирует данные настроек пользователя с помощью Zod
 * @param data Данные настроек пользователя для валидации
 * @returns Валидированные данные настроек пользователя или null в случае ошибки
 */
export function validateUserSettings(data: unknown) {
  return validateWithSchema(UserSettingsSchema, data);
}

/**
 * Валидирует данные состояния сцены с помощью Zod
 * @param data Данные состояния сцены для валидации
 * @returns Валидированные данные состояния сцены или null в случае ошибки
 */
export function validateSceneState(data: unknown) {
  return validateWithSchema(SceneStateSchema, data);
}

/**
 * Валидирует данные лога активности с помощью Zod
 * @param data Данные лога активности для валидации
 * @returns Валидированные данные лога активности или null в случае ошибки
 */
export function validateActivityLog(data: unknown) {
  return validateWithSchema(ActivityLogSchema, data);
}

/**
 * Валидирует данные настроек уведомлений с помощью Zod
 * @param data Данные настроек уведомлений для валидации
 * @returns Валидированные данные настроек уведомлений или null в случае ошибки
 */
export function validateNotificationSettings(data: unknown) {
  return validateWithSchema(NotificationSettingsSchema, data);
}

/**
 * Валидирует массив данных с помощью указанной схемы Zod
 * @param schema Схема Zod для валидации
 * @param data Массив данных для валидации
 * @returns Валидированный массив данных или пустой массив в случае ошибки
 */
export function validateArray<T>(schema: z.ZodType<T>, data: unknown): T[] {
  if (!Array.isArray(data)) {
    return [];
  }

  try {
    return z.array(schema).parse(data);
  } catch (error) {
    // Если валидация массива не удалась, пробуем валидировать каждый элемент отдельно
    if (Array.isArray(data)) {
      return data
        .map((item) => {
          try {
            return schema.parse(item);
          } catch {
            return null;
          }
        })
        .filter((item): item is T => item !== null);
    }
    return [];
  }
}

/**
 * Валидирует массив пользователей с помощью Zod
 * @param data Массив данных пользователей для валидации
 * @returns Валидированный массив пользователей или пустой массив в случае ошибки
 */
export function validateUsers(data: unknown) {
  return validateArray(UserSchema, data);
}

/**
 * Валидирует массив настроек пользователей с помощью Zod
 * @param data Массив данных настроек пользователей для валидации
 * @returns Валидированный массив настроек пользователей или пустой массив в случае ошибки
 */
export function validateUserSettingsArray(data: unknown) {
  return validateArray(UserSettingsSchema, data);
}

/**
 * Валидирует массив состояний сцен с помощью Zod
 * @param data Массив данных состояний сцен для валидации
 * @returns Валидированный массив состояний сцен или пустой массив в случае ошибки
 */
export function validateSceneStates(data: unknown) {
  return validateArray(SceneStateSchema, data);
}

/**
 * Валидирует массив логов активности с помощью Zod
 * @param data Массив данных логов активности для валидации
 * @returns Валидированный массив логов активности или пустой массив в случае ошибки
 */
export function validateActivityLogs(data: unknown) {
  return validateArray(ActivityLogSchema, data);
}

/**
 * Валидирует массив настроек уведомлений с помощью Zod
 * @param data Массив данных настроек уведомлений для валидации
 * @returns Валидированный массив настроек уведомлений или пустой массив в случае ошибки
 */
export function validateNotificationSettingsArray(data: unknown) {
  return validateArray(NotificationSettingsSchema, data);
}
