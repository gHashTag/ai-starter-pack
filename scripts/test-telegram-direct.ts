/**
 * 🧪 Прямое тестирование отправки в Telegram
 *
 * Этот скрипт тестирует отправку сообщений и файлов в Telegram
 */

import { Telegraf } from 'telegraf';
import { createReadStream } from 'fs';
import path from 'path';

async function testTelegramDirect() {
  console.log('🤖 Прямое тестирование Telegram API...\n');

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = '144022504'; // Ваш Telegram ID

  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN не найден в переменных окружения');
  }

  const bot = new Telegraf(BOT_TOKEN);

  try {
    // Тест 1: Простое сообщение
    console.log('📝 Тест 1: Отправка простого сообщения...');
    const message1 = await bot.telegram.sendMessage(
      CHAT_ID,
      '🧪 **Тестовое сообщение**\n\nПроверяем работу Telegram API',
      { parse_mode: 'Markdown' }
    );
    console.log(`✅ Сообщение отправлено (ID: ${message1.message_id})`);

    // Тест 2: Проверка существования файлов
    console.log('\n📁 Тест 2: Проверка файлов карусели...');
    const carouselDir = path.join(process.cwd(), 'carousel-output');
    const fs = await import('fs/promises');

    let imageFiles: string[] = [];
    try {
      const files = await fs.readdir(carouselDir);
      imageFiles = files
        .filter(file => file.endsWith('.png'))
        .slice(0, 3) // Берем только первые 3 файла для теста
        .map(file => path.join(carouselDir, file));

      console.log(`✅ Найдено ${imageFiles.length} PNG файлов для теста`);
      imageFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
      });
    } catch (error) {
      console.log('❌ Папка carousel-output не найдена или пуста');
      return { success: false, error: 'No carousel files found' };
    }

    if (imageFiles.length === 0) {
      console.log('❌ Нет PNG файлов для отправки');
      return { success: false, error: 'No PNG files found' };
    }

    // Тест 3: Отправка одного изображения
    console.log('\n🖼️ Тест 3: Отправка одного изображения...');
    const singleImage = await bot.telegram.sendPhoto(
      CHAT_ID,
      { source: createReadStream(imageFiles[0]) },
      {
        caption: '🎨 Тестовое изображение из карусели',
        reply_parameters: { message_id: message1.message_id },
      }
    );
    console.log(`✅ Изображение отправлено (ID: ${singleImage.message_id})`);

    // Тест 4: Отправка медиа-группы (если есть несколько файлов)
    if (imageFiles.length > 1) {
      console.log('\n📸 Тест 4: Отправка медиа-группы...');

      const mediaGroup = imageFiles
        .slice(0, Math.min(3, imageFiles.length))
        .map((file, index) => ({
          type: 'photo' as const,
          media: { source: createReadStream(file) },
          caption:
            index === 0
              ? '🎨 **Тестовая карусель**\n\nПроверяем отправку медиа-группы'
              : undefined,
          parse_mode: index === 0 ? ('Markdown' as const) : undefined,
        }));

      const mediaResult = await bot.telegram.sendMediaGroup(
        CHAT_ID,
        mediaGroup,
        {
          reply_parameters: { message_id: message1.message_id },
        }
      );

      console.log(
        `✅ Медиа-группа отправлена (${mediaResult.length} изображений)`
      );
    }

    console.log('\n🎉 Все тесты Telegram API прошли успешно!');
    return {
      success: true,
      message: 'All Telegram tests passed',
      filesCount: imageFiles.length,
    };
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании Telegram API:', error);

    if (error instanceof Error) {
      console.error('📝 Сообщение ошибки:', error.message);

      // Специальная обработка ошибок Telegram
      if (error.message.includes('invalid file HTTP URL')) {
        console.error(
          '🔍 Проблема с путями к файлам - проверьте createReadStream'
        );
      } else if (error.message.includes('chat not found')) {
        console.error('🔍 Чат не найден - проверьте CHAT_ID');
      } else if (error.message.includes('bot token')) {
        console.error('🔍 Проблема с токеном бота - проверьте BOT_TOKEN');
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Запускаем тест
testTelegramDirect()
  .then(result => {
    console.log('\n📋 Финальный результат:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });
