#!/usr/bin/env bun

import { Pool } from 'pg';

const DATABASE_URL =
  'postgresql://neondb_owner:npg_CnbBv0JF3NfE@ep-old-snow-a9fqfoj1-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

async function createUsersTables() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('🚀 Создание таблиц пользователей в main базе данных...');

    // Создаем таблицу users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id TEXT NOT NULL UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        language_code VARCHAR(10) DEFAULT 'ru',
        subscription_level TEXT DEFAULT 'free',
        is_bot BOOLEAN DEFAULT false,
        is_premium BOOLEAN DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_active_at TIMESTAMP DEFAULT NOW(),
        subscription_expires_at TIMESTAMP
      );
    `);
    console.log('✅ Таблица users создана');

    // Создаем таблицу user_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        notifications_enabled BOOLEAN DEFAULT true,
        preferred_language TEXT DEFAULT 'ru',
        theme TEXT DEFAULT 'light',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица user_settings создана');

    // Добавляем тестовых пользователей (вас)
    await client.query(`
      INSERT INTO users (telegram_id, username, first_name, language_code)
      VALUES 
        ('144022504', 'neuro_sage', 'Dmitrii', 'ru'),
        ('737300586', 'Ekateruna_off', 'Екатерина', 'ru'),
        ('123456789', 'test_user', 'Тестовый Пользователь', 'ru')
      ON CONFLICT (telegram_id) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        updated_at = NOW();
    `);
    console.log('✅ Пользователи добавлены');

    // Создаем настройки для пользователей
    await client.query(`
      INSERT INTO user_settings (user_id, notifications_enabled)
      SELECT id, true FROM users
      WHERE id NOT IN (SELECT user_id FROM user_settings WHERE user_id IS NOT NULL);
    `);
    console.log('✅ Настройки пользователей созданы');

    // Проверяем результат
    const result = await client.query(`
      SELECT u.id, u.username, u.first_name, u.telegram_id, us.notifications_enabled
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      ORDER BY u.id;
    `);

    console.log('\n📊 Созданные пользователи:');
    result.rows.forEach(user => {
      console.log(
        `   ${user.id}. ${user.first_name} (@${user.username}) - ${user.telegram_id} - уведомления: ${user.notifications_enabled}`
      );
    });

    console.log(
      '\n🎉 Таблицы пользователей успешно созданы в main базе данных!'
    );
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.main) {
  createUsersTables();
}
