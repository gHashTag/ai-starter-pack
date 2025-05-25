/**
 * Схема базы данных Drizzle ORM
 * Этот файл содержит определения таблиц и отношений между ними
 */

import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

/**
 * Пример таблицы для тестирования подключения
 */
export const testTable = pgTable("test_table", {
  id: serial("id").primaryKey(),
  name: text("name"),
});

/**
 * Таблица пользователей
 * Хранит основную информацию о пользователях Telegram
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull().unique(),
  username: text("username"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  language_code: text("language_code"),
  is_bot: boolean("is_bot").default(false),
  is_premium: boolean("is_premium").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

/**
 * Таблица настроек пользователей
 * Хранит настройки и предпочтения пользователей
 */
export const userSettings = pgTable(
  "user_settings",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    notifications_enabled: boolean("notifications_enabled").default(true),
    preferred_language: text("preferred_language").default("ru"),
    theme: text("theme").default("light"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      user_fk: foreignKey({
        columns: [table.user_id],
        foreignColumns: [users.id],
        name: "user_settings_user_id_fk",
      }),
    };
  }
);

/**
 * Таблица сообщений
 * Хранит историю сообщений пользователей
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  chat_id: text("chat_id").notNull(),
  message_text: text("message_text"),
  message_type: text("message_type").notNull(),
  telegram_message_id: integer("telegram_message_id"),
  sent_at: timestamp("sent_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

/**
 * Таблица сессий Wizard
 * Хранит состояние wizard-сцен для восстановления при перезапуске бота
 */
export const wizardSessions = pgTable("wizard_sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  scene_id: text("scene_id").notNull(),
  step: integer("step").notNull(),
  state: jsonb("state").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"),
});

/**
 * Соединительная таблица для пользователей и их ролей
 */
export const userRoles = pgTable(
  "user_roles",
  {
    user_id: integer("user_id").notNull(),
    role_id: integer("role_id").notNull(),
    assigned_at: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.role_id] }),
  })
);

/**
 * Таблица ролей пользователей
 */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Типы на основе схемы

// Тип для пользователя из базы данных
export type User = typeof users.$inferSelect;

// Тип для создания нового пользователя
export type NewUser = typeof users.$inferInsert;

// Тип для настроек пользователя
export type UserSettings = typeof userSettings.$inferSelect;

// Тип для сообщения
export type Message = typeof messages.$inferSelect;

// Тип для сессии wizard
export type WizardSession = typeof wizardSessions.$inferSelect;
