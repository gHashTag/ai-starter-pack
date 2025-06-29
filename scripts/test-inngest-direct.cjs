const { Inngest } = require('inngest');

// Создаем Inngest клиент для тестирования
const inngest = new Inngest({
  id: 'test-client',
  isDev: true,
  baseUrl: 'http://localhost:8288', // Подключаемся к Inngest Dev Server
});

async function testCarouselEvent() {
  console.log('🧪 Тестирование события carousel/generate.requested...');

  try {
    // Отправляем событие карусели
    const result = await inngest.send({
      name: 'carousel/generate.requested',
      data: {
        userId: '6395088869', // Твой Telegram ID
        chatId: '6395088869', // Твой chat ID
        messageId: '123',
        topic: 'ТЕСТ СИСТЕМЫ',
        slidesCount: 3,
        timestamp: new Date(),
      },
    });

    console.log('✅ Событие отправлено успешно:', result);
    console.log('🔄 Проверь логи Inngest и Telegram для обработки события');
  } catch (error) {
    console.error('❌ Ошибка при отправке события:', error.message);
    console.error('Детали:', error);
  }
}

testCarouselEvent();
