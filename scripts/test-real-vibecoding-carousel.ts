#!/usr/bin/env bun

import { Telegraf } from 'telegraf';
import { Pool } from 'pg';
import { vibeCodingCommands } from '../src/commands/vibecoding-commands';

const bot = new Telegraf(process.env.BOT_TOKEN || '');

// ПРАВИЛЬНАЯ строка подключения к базе данных
const DATABASE_URL =
  'postgresql://neondb_owner:npg_CnbBv0JF3NfE@ep-old-snow-a9fqfoj1-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

console.log('🚀 ТЕСТ РЕАЛЬНОЙ VIBECODING КАРУСЕЛИ...');

async function testVibeCodingCarousel() {
  const client = await pool.connect();

  try {
    // 1️⃣ Проверяем данные в базе
    console.log('1️⃣ Проверка данных VibeCoding в базе...');

    const result = await client.query(`
      SELECT 
        COUNT(*) as total_chunks,
        COUNT(DISTINCT source_file) as total_files,
        COUNT(DISTINCT metadata->>'file_category') as categories
      FROM vibecoding_vectors.document_chunks;
    `);

    const stats = result.rows[0];
    console.log(`   ✅ Найдено ${stats.total_chunks} чанков`);
    console.log(`   📚 Из ${stats.total_files} файлов`);
    console.log(`   📂 ${stats.categories} категорий`);

    // 2️⃣ Получаем активных пользователей
    console.log('\n2️⃣ Получение активных пользователей...');

    const usersResult = await client.query(`
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

    const activeUsers = usersResult.rows;
    console.log(`   ✅ Найдено ${activeUsers.length} активных пользователей`);

    if (activeUsers.length === 0) {
      console.log('❌ Нет активных пользователей для отправки');
      return;
    }

    // 3️⃣ Генерируем РЕАЛЬНУЮ VibeCoding карусель
    console.log('\n3️⃣ 🎨 Генерация РЕАЛЬНОЙ VibeCoding карусели...');

    const themes = [
      'Философия интуитивного программирования',
      'Cursor AI техники и лучшие практики',
      'Медитативное программирование и состояние потока',
      'Принципы VIBECODING и доверие ИИ',
      'Инструменты и настройка рабочего пространства',
      'Аналитика и метрики разработки',
    ];

    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    const selectedStyle = ['minimalist', 'vibrant', 'dark', 'gradient'][
      Math.floor(Math.random() * 4)
    ];

    console.log(`   🎯 Тема: "${selectedTheme}"`);
    console.log(`   🎨 Стиль: "${selectedStyle}"`);

    // Генерируем карусель с реальными данными
    const carouselResult = await vibeCodingCommands.generateVibeCodingCarousel(
      selectedTheme,
      {
        maxCards: 5,
        style: selectedStyle as any,
        includeCodeExamples: true,
        categories: ['general', 'fundamentals', 'tools', 'practices'],
      }
    );

    if (!carouselResult.success) {
      console.log(`❌ Ошибка генерации карусели: ${carouselResult.error}`);
      return;
    }

    console.log(
      `   ✅ Создано ${carouselResult.carouselImages?.length || 0} карточек`
    );

    // 4️⃣ РЕАЛЬНАЯ отправка карусели
    console.log('\n4️⃣ 🚨 РЕАЛЬНАЯ ОТПРАВКА VIBECODING КАРУСЕЛИ...');

    if (
      !carouselResult.carouselImages ||
      carouselResult.carouselImages.length === 0
    ) {
      console.log('❌ Нет изображений для отправки');
      return;
    }

    // Подготавливаем медиа группу
    const mediaGroup = carouselResult.carouselImages.map(
      (imageData: string, index: number) => {
        // 🔧 Конвертируем Base64 в Buffer для Telegram API
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        return {
          type: 'photo' as const,
          media: { source: imageBuffer }, // ✅ Telegram-совместимый формат
          caption:
            index === 0
              ? `🕉️ **VibeCoding: ${selectedTheme}**\n\n` +
                `📚 Источник: Библия VibeCoding\n` +
                `🎨 Стиль: ${selectedStyle}\n` +
                `⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}\n\n` +
                `#VibeCoding #МедитативноеКодирование #ИИПрограммирование`
              : undefined,
          parse_mode: 'Markdown' as const,
        };
      }
    );

    let successCount = 0;
    let errorCount = 0;

    // Отправляем карусели пользователям
    for (const user of activeUsers) {
      try {
        await bot.telegram.sendMediaGroup(user.telegram_id, mediaGroup as any);
        successCount++;
        console.log(
          `   ✅ Карусель отправлена ${user.first_name} (@${user.username || 'без username'})`
        );

        // Пауза между отправками
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Ошибка отправки ${user.first_name}:`, error);
      }
    }

    // 5️⃣ Результаты
    console.log('\n5️⃣ 📊 РЕЗУЛЬТАТЫ ОТПРАВКИ VIBECODING КАРУСЕЛИ:');
    console.log(`   ✅ Успешно отправлено: ${successCount}`);
    console.log(`   ❌ Ошибок: ${errorCount}`);
    console.log(
      `   🎨 Карточек в карусели: ${carouselResult.carouselImages.length}`
    );
    console.log(`   🎯 Тема: ${selectedTheme}`);
    console.log(
      `   📈 Успешность: ${((successCount / activeUsers.length) * 100).toFixed(1)}%`
    );

    if (successCount > 0) {
      console.log('\n🎉 СИСТЕМА VIBECODING BROADCAST РАБОТАЕТ!');
      console.log('📱 Проверьте Telegram - должны прийти красивые карусели!');
    }
  } catch (error) {
    console.error('\n💥 Критическая ошибка:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск теста
if (import.meta.main) {
  testVibeCodingCarousel()
    .then(() => {
      console.log('\n✨ ТЕСТ VIBECODING КАРУСЕЛИ ЗАВЕРШЕН! 🕉️');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Критическая ошибка:', error);
      process.exit(1);
    });
}
