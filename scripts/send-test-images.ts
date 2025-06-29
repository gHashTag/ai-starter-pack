#!/usr/bin/env bun

/**
 * Скрипт для отправки тестовых изображений карусели в Telegram
 *
 * ИНСТРУКЦИЯ:
 * 1. Отправьте /start боту в Telegram
 * 2. Замените YOUR_TELEGRAM_ID ниже на ваш реальный ID
 * 3. Запустите: bun run scripts/send-test-images.ts
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { bot } from '../src/bot';

// ID пользователя из памяти.
const telegramUserId = '144022504';

async function sendTestImages() {
  if (!telegramUserId) {
    console.error('❌ Telegram ID пользователя не найден.');
    process.exit(1);
  }

  console.log(
    `📱 Отправка тестовых изображений карусели пользователю ${telegramUserId}...`
  );

  try {
    if (!bot) {
      throw new Error('Telegram bot не инициализирован');
    }

    console.log('🤖 Bot подключен');

    const outputDir = join(process.cwd(), 'carousel-output');

    console.log(`📁 Читаем изображения из ${outputDir}...`);
    const imageFiles = (await fs.readdir(outputDir))
      .filter(file => file.endsWith('.png'))
      .sort();

    if (imageFiles.length === 0) {
      console.error(`❌ В директории ${outputDir} не найдено изображений .png`);
      return;
    }

    const mediaGroup = await Promise.all(
      imageFiles.map(async (fileName, index) => {
        const filePath = join(outputDir, fileName);
        const buffer = await fs.readFile(filePath);
        console.log(
          `✅ Прочитан ${fileName}: ${(buffer.length / 1024).toFixed(1)}KB`
        );

        return {
          type: 'photo' as const,
          media: { source: buffer },
          caption:
            index === 0
              ? `🎨 *Тестовая карусель Vibecoding*\n\nШрифты: Lora & Golos Text\nФон: Белый`
              : undefined,
        };
      })
    );

    console.log(`📤 Отправляем ${mediaGroup.length} изображений...`);

    await bot.telegram.sendMediaGroup(telegramUserId, mediaGroup);

    console.log('✅ Карусель успешно отправлена в Telegram!');
    console.log('🎉 Проверьте свой Telegram!');
  } catch (error) {
    console.error('❌ Ошибка при отправке:', error);
  }
}

// Запускаем
sendTestImages().finally(() => {
  // Даем время на отправку и завершаем процесс, чтобы избежать зависания
  setTimeout(() => process.exit(0), 2000);
});
