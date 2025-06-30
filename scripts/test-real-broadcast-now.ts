#!/usr/bin/env bun

import { Telegraf } from 'telegraf';
import { Pool } from 'pg';

const bot = new Telegraf(process.env.BOT_TOKEN || '');
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

console.log('🚀 РЕАЛЬНЫЙ тест отправки VibeCoding сообщений...');

async function testRealBroadcast() {
  const client = await pool.connect();

  try {
    // 1️⃣ Получаем активных пользователей
    console.log('1️⃣ Получение активных пользователей...');

    const result = await client.query(`
      SELECT 
        u.id, 
        u.telegram_id, 
        u.username, 
        u.first_name,
        COALESCE(us.notifications_enabled, true) as notifications_enabled
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE u.telegram_id IS NOT NULL
        AND (us.notifications_enabled IS NULL OR us.notifications_enabled = true)
      ORDER BY u.created_at DESC;
    `);

    const activeUsers = result.rows;

    console.log(`   ✅ Найдено ${activeUsers.length} активных пользователей`);
    activeUsers.forEach((user, index) => {
      console.log(
        `      ${index + 1}. ${user.first_name || 'Без имени'} (@${user.username || 'без username'}) - ${user.telegram_id}`
      );
    });

    if (activeUsers.length === 0) {
      console.log('❌ Нет активных пользователей для отправки');
      return;
    }

    // 2️⃣ Создаем простое тестовое сообщение
    console.log('\n2️⃣ Подготовка тестового сообщения...');

    const testMessage = `🕉️ **Тест системы автоматической рассылки VibeCoding**

📚 Это тестовое сообщение для проверки работы системы автоматической рассылки.

🎯 **Сегодняшняя мудрость:** "Доверие ИИ - это не слепая вера, а осознанное партнерство в коде"

⏰ Время отправки: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}

#VibeCoding #ТестРассылки #МедитативноеКодирование`;

    console.log('   ✅ Тестовое сообщение подготовлено');

    // 3️⃣ РЕАЛЬНАЯ отправка сообщений
    console.log('\n3️⃣ 🚨 НАЧИНАЕМ РЕАЛЬНУЮ ОТПРАВКУ СООБЩЕНИЙ...');

    let successCount = 0;
    let errorCount = 0;

    // Отправляем сообщения порциями
    const BATCH_SIZE = 5;
    const batches = [];

    for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
      batches.push(activeUsers.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      console.log(`\n📤 Отправка батча из ${batch.length} пользователей...`);

      await Promise.allSettled(
        batch.map(async user => {
          try {
            await bot.telegram.sendMessage(user.telegram_id, testMessage, {
              parse_mode: 'Markdown',
              disable_web_page_preview: true,
            });

            successCount++;
            console.log(
              `   ✅ Отправлено ${user.first_name} (@${user.username || 'без username'})`
            );

            // Логируем успешную отправку
          } catch (error) {
            errorCount++;
            console.error(`   ❌ Ошибка отправки ${user.first_name}:`, error);

            // Логируем ошибку отправки
          }
        })
      );

      // Пауза между батчами для соблюдения rate limits
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('   ⏳ Пауза 2 сек между батчами...');
      }
    }

    // 4️⃣ Результаты
    console.log('\n4️⃣ 📊 РЕЗУЛЬТАТЫ РЕАЛЬНОЙ ОТПРАВКИ:');
    console.log(`   ✅ Успешно отправлено: ${successCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log(
      `   📈 Успешность: ${((successCount / activeUsers.length) * 100).toFixed(1)}%`
    );

    if (successCount > 0) {
      console.log('\n🎉 ОТЛИЧНО! Система отправки работает корректно!');
      console.log(
        '📱 Проверьте свой Telegram - должно прийти тестовое сообщение'
      );
    } else {
      console.log('\n⚠️ Ни одно сообщение не было отправлено успешно');
    }
  } catch (error) {
    console.error('\n💥 Критическая ошибка при тестировании:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск теста
if (import.meta.main) {
  testRealBroadcast()
    .then(() => {
      console.log('\n✨ РЕАЛЬНЫЙ тест завершен! Проверьте Telegram! 🕉️');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Критическая ошибка:', error);
      process.exit(1);
    });
}
