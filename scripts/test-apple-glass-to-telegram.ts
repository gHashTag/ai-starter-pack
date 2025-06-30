#!/usr/bin/env bun

import { vibeCodingCommands } from '../src/commands/vibecoding-commands';
import { ColorTemplate } from '../src/services/instagram-canvas.service';

async function testAppleGlassToTelegram() {
  const telegramUserId = 144022504; // Ваш Telegram ID

  console.log('🍎 Создаем и отправляем Apple Glass карусель...');

  try {
    const result = await vibeCodingCommands.generateAndSendCarousel({
      topic: 'инструменты редакторы кода для вайб-кодинга',
      telegramUserId,
      slideCount: 4,
      colorTemplate: ColorTemplate.APPLE_GLASS_BLUE, // Тестируем голубой Apple Glass
    });

    if (result.success) {
      console.log('✅ Apple Glass карусель успешно отправлена!');
      console.log(`📱 Отправлено ${result.imageCount} слайдов`);
      console.log(`🎨 Шаблон: Apple Glass Blue`);
      console.log(`💾 Размеры: ${result.imageSizes?.join(', ') || 'N/A'}`);
    } else {
      console.error('❌ Ошибка:', result.error);
    }
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

testAppleGlassToTelegram().catch(console.error);
