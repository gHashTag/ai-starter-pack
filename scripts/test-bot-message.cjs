const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7667727700:AAEJIvtBWxgy_cj_Le_dGMpqA_dz7Pwhj0c';
const YOUR_CHAT_ID = '6395088869'; // Твой Telegram ID

async function testBotMessage() {
  console.log('🧪 Тестирую отправку сообщения в чат...');

  try {
    const bot = new Telegraf(BOT_TOKEN);

    const testMessage =
      `🧪 **ТЕСТ СИСТЕМЫ УВЕДОМЛЕНИЙ**\n\n` +
      `✅ Бот активен и готов к работе!\n` +
      `🎨 Карусель функция обновлена\n` +
      `📊 Детальные логи добавлены\n\n` +
      `🚀 **Теперь попробуй команду:**\n` +
      `\`/carousel принципы VIBECODING\`\n\n` +
      `⏰ Время теста: ${new Date().toLocaleString('ru-RU')}`;

    await bot.telegram.sendMessage(YOUR_CHAT_ID, testMessage, {
      parse_mode: 'Markdown',
    });

    console.log('✅ Тестовое сообщение отправлено успешно!');
    console.log('📱 Проверь свой Telegram чат');
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error.message);
  }
}

testBotMessage();
