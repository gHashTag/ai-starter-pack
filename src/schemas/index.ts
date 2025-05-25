import { z } from "zod";

/**
 * Схема для пользователя.
 * Соответствует usersTable из src/db/schema.ts
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  telegram_id: z.number().int(),
  username: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  language_code: z.string().optional().nullable(),
  is_bot: z.boolean().optional(),
  subscription_level: z.string().default("free"),
  subscription_expires_at: z.date().nullable().optional(),
  last_active_at: z
    .date()
    .optional()
    .default(() => new Date()),
  created_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  updated_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
});

/**
 * Тип пользователя, выведенный из схемы Zod
 */
export type User = z.infer<typeof UserSchema>;

/**
 * Схема для настроек пользователя
 */
export const UserSettingsSchema = z.object({
  id: z.number().optional(),
  user_id: z.string().uuid(), // Связь с User.id
  setting_key: z.string(),
  setting_value: z.any(),
  created_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  updated_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
});

/**
 * Тип настроек пользователя, выведенный из схемы Zod
 */
export type UserSettings = z.infer<typeof UserSettingsSchema>;

/**
 * Схема для данных сессии сцены
 */
export const BotSceneSessionDataSchema = z.object({
  step: z.string().optional(), // Текущий шаг сцены
  cursor: z.number(), // Курсор для пагинации или состояния
  messageIdToEdit: z.number().optional(), // ID сообщения для редактирования
  user: z.lazy(() => UserSchema.optional()), // Пользователь в сессии
  data: z.record(z.any()).optional(), // Произвольные данные для сцены
});

/**
 * Тип данных сессии сцены, выведенный из схемы Zod
 */
export type BotSceneSessionData = z.infer<typeof BotSceneSessionDataSchema>;

/**
 * Схема для состояния сцены в БД
 */
export const SceneStateSchema = z.object({
  id: z.number().optional(),
  user_id: z.string().uuid(), // Связь с User.id
  scene_id: z.string(),
  state_data: z.any(), // Данные состояния
  created_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  updated_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
});

/**
 * Тип состояния сцены, выведенный из схемы Zod
 */
export type SceneState = z.infer<typeof SceneStateSchema>;

/**
 * Схема для лога активности
 */
export const ActivityLogSchema = z.object({
  id: z.number().optional(),
  user_id: z.string().uuid().optional(), // Связь с User.id (опционально)
  action_type: z.string(),
  action_details: z.any().optional(),
  performed_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  ip_address: z.string().optional(),
  created_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
});

/**
 * Тип лога активности, выведенный из схемы Zod
 */
export type ActivityLog = z.infer<typeof ActivityLogSchema>;

/**
 * Схема для настроек уведомлений пользователя
 */
export const NotificationSettingsSchema = z.object({
  user_id: z.string().uuid(), // Связь с User.id
  enabled: z.boolean().default(true),
  daily_summary: z.boolean().default(false),
  language: z.string().default("ru"), // язык уведомлений
  custom_settings: z.record(z.any()).optional(), // Дополнительные настройки
});

/**
 * Тип настроек уведомлений, выведенный из схемы Zod
 */
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

// Экспорт всех схем и типов
// В будущем можно добавить другие схемы в соответствии с потребностями бота
