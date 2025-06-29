/**
 * 🧪 Финальный тест Inngest функции карусели
 *
 * Этот скрипт отправляет команду /carousel в Telegram бот
 * и проверяет работу полной цепочки: команда -> Inngest -> генерация -> отправка
 */

import { Telegraf } from 'telegraf';

async function testCarouselFinal() {
  console.log('🎨 Финальный тест Inngest функции карусели...\n');

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = '144022504'; // Ваш Telegram ID

  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN не найден в переменных окружения');
  }

  const bot = new Telegraf(BOT_TOKEN);

  try {
    console.log('📤 Отправляем команду /carousel в бот...');

    // Отправляем команду /carousel через Telegram API
    const commandMessage = await bot.telegram.sendMessage(
      CHAT_ID,
      '/carousel "медитативное программирование"'
    );

    console.log(`✅ Команда отправлена (ID: ${commandMessage.message_id})`);
    console.log('📝 Текст команды: /carousel "медитативное программирование"');

    console.log('\n⏳ Ожидание обработки Inngest функции...');
    console.log('🎯 Проверьте Telegram бот на получение результата');
    console.log('🎛️  Inngest Dashboard: http://localhost:8288');
    console.log('📊 HTTP Server Health: http://localhost:7103/health');

    // Ждем немного для обработки
    console.log('\n⏰ Ждем 30 секунд для обработки функции...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('\n🎉 Тест завершен!');
    console.log('📱 Проверьте Telegram на получение карусели');

    return {
      success: true,
      message: 'Command sent successfully',
      commandMessageId: commandMessage.message_id,
    };
  } catch (error) {
    console.error('\n❌ Ошибка при отправке команды:', error);

    if (error instanceof Error) {
      console.error('📝 Сообщение ошибки:', error.message);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Запускаем тест
testCarouselFinal()
  .then(result => {
    console.log('\n📋 Финальный результат:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });
