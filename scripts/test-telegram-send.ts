#!/usr/bin/env bun

/**
 * Тестовый скрипт для отправки сгенерированных изображений в Telegram
 */

import { readFileSync } from 'fs';
import { join } from 'path';

async function testTelegramSend() {
  console.log('📱 Тестирование отправки в Telegram...');

  try {
    // Импортируем bot
    const { bot } = await import('../src/bot');

    if (!bot) {
      throw new Error('Telegram bot не инициализирован');
    }

    // Получаем информацию о боте
    const botInfo = await bot.telegram.getMe();
    console.log(`🤖 Bot: @${botInfo.username} (ID: ${botInfo.id})`);

    // Читаем сгенерированные изображения
    const outputDir = join(process.cwd(), 'test-output');
    const imageFiles = [
      'slide_1_title.png',
      'slide_2_principle.png',
      'slide_3_quote.png',
      'slide_4_practice.png',
      'slide_5_summary.png',
    ];

    console.log('📁 Читаем изображения...');
    const imageBuffers: Buffer[] = [];

    for (const fileName of imageFiles) {
      const filePath = join(outputDir, fileName);
      try {
        const buffer = readFileSync(filePath);
        imageBuffers.push(buffer);
        console.log(`✅ Загружено: ${fileName} (${buffer.length} bytes)`);
      } catch (error) {
        console.error(`❌ Ошибка чтения ${fileName}:`, error);
        return;
      }
    }

    // Ваш Telegram ID (замените на свой)
    const yourTelegramId = 'YOUR_TELEGRAM_ID'; // Замените на ваш реальный ID

    if (yourTelegramId === 'YOUR_TELEGRAM_ID') {
      console.log('⚠️ Замените YOUR_TELEGRAM_ID на ваш реальный Telegram ID');
      console.log(
        '💡 Чтобы узнать свой ID, отправьте /start боту и посмотрите в логи'
      );
      return;
    }

    console.log(`📤 Отправляем карусель пользователю ${yourTelegramId}...`);

    // Правильный формат медиа-группы для Telegram
    const mediaGroup = imageBuffers.map((buffer, index) => ({
      type: 'photo' as const,
      media: { source: buffer },
      caption:
        index === 0
          ? `🎨 *Тестовая карусель: AI инструменты 2025*\n\n📊 ${imageBuffers.length} слайдов по VIBECODING\n\n🔗 Размер: 1080x1350 (идеально для Instagram)\n\n✨ Сгенерировано с белым фоном и черным текстом`
          : undefined,
    }));

    // Отправляем медиа-группу
    await bot.telegram.sendMediaGroup(yourTelegramId, mediaGroup);
    console.log('✅ Карусель успешно отправлена в Telegram!');
  } catch (error) {
    console.error('❌ Ошибка при отправке:', error);

    // Показываем детали ошибки
    if (error instanceof Error) {
      console.error('📝 Детали ошибки:', error.message);
      console.error('🔍 Stack trace:', error.stack);
    }
  }
}

// Запускаем тест
if (import.meta.main) {
  testTelegramSend();
}

export { testTelegramSend };
