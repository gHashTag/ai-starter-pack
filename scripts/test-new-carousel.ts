import { Telegraf } from 'telegraf';
import { readFileSync } from 'fs';
import { join } from 'path';

// Настройки
const BOT_TOKEN = process.env.BOT_TOKEN!;
const TEST_CHAT_ID = '144022504'; // Ваш Telegram ID

async function testNewCarousel() {
  console.log('🎨 Тестируем новые ЯРКИЕ ЦВЕТНЫЕ изображения...');

  try {
    const bot = new Telegraf(BOT_TOKEN);

    // Читаем новые цветные изображения
    const imagePaths = [
      'carousel-output/vibecoding-colorful-slide-1-title.png',
      'carousel-output/vibecoding-colorful-slide-2-principle.png',
      'carousel-output/vibecoding-colorful-slide-3-quote.png',
      'carousel-output/vibecoding-colorful-slide-4-practice.png',
      'carousel-output/vibecoding-colorful-slide-5-summary.png',
    ];

    const imageBuffers = imagePaths.map(path => {
      const fullPath = join(process.cwd(), path);
      console.log(`📖 Читаем: ${path}`);
      return readFileSync(fullPath);
    });

    console.log(`✅ Загружено ${imageBuffers.length} ярких изображений`);

    // Создаем медиа-группу
    const mediaGroup = imageBuffers.map((buffer, index) => ({
      type: 'photo' as const,
      media: { source: buffer },
      caption:
        index === 0
          ? `🌈 НОВЫЙ ЯРКИЙ ДИЗАЙН КАРУСЕЛИ!\n\n` +
            `🎨 Особенности:\n` +
            `• Градиентные фоны\n` +
            `• Поддержка эмодзи 🌸💎⚡🚀🙏\n` +
            `• Белый текст с тенями\n` +
            `• Цветные декорации\n` +
            `• @napi-rs/canvas\n\n` +
            `📊 ${imageBuffers.length} слайдов | 1080x1350`
          : undefined,
    }));

    // Отправляем
    console.log(`📤 Отправляем в чат ${TEST_CHAT_ID}...`);
    await bot.telegram.sendMediaGroup(TEST_CHAT_ID, mediaGroup);

    console.log('🎉 УСПЕШНО! Новые яркие изображения отправлены!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testNewCarousel();
