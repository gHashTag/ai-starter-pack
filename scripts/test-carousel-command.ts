import { Telegraf } from 'telegraf';

// Настройки
const BOT_TOKEN = process.env.BOT_TOKEN!;

async function testCarouselCommand() {
  console.log(
    '🎨 Тестируем команду /carousel с новыми яркими изображениями...'
  );

  try {
    const bot = new Telegraf(BOT_TOKEN);

    // Получаем информацию о боте
    const botInfo = await bot.telegram.getMe();
    console.log(`🤖 Бот: @${botInfo.username} (${botInfo.first_name})`);
    console.log(`📱 ID: ${botInfo.id}`);

    console.log('\n🎯 Инструкции для тестирования:');
    console.log('1. Откройте Telegram');
    console.log(`2. Найдите бота @${botInfo.username}`);
    console.log('3. Отправьте команду: /start');
    console.log('4. Затем отправьте: /carousel AI инструменты 2025');
    console.log('5. Ожидайте получения 5 ярких цветных изображений!');

    console.log('\n🌈 Что вы должны увидеть:');
    console.log('• 5 ярких изображений с градиентными фонами');
    console.log('• Эмодзи в заголовках: 🌸💎⚡🚀🙏');
    console.log('• Белый текст с тенями на цветном фоне');
    console.log('• Размер: 1080x1350 (Instagram Portrait)');
    console.log('• Цветные декоративные элементы');

    console.log('\n✅ Бот готов к тестированию!');
  } catch (error) {
    console.error('❌ Ошибка при подключении к боту:', error);
  }
}

testCarouselCommand();
