const { Inngest } = require('inngest');

// Создаем Inngest клиент для тестирования
const inngest = new Inngest({
  id: 'test-client',
  isDev: true,
});

async function testCarousel() {
  console.log('🧪 Тестирование генерации карусели...');

  try {
    // Отправляем событие карусели
    const result = await inngest.send({
      name: 'carousel/generate.requested',
      data: {
        userId: 'test_user_123',
        chatId: 'test_chat_123',
        messageId: 'test_msg_123',
        topic: 'VIBECODING принципы',
        slidesCount: 5,
        timestamp: new Date(),
      },
    });

    console.log('✅ Событие отправлено успешно:', result);
    console.log('🔄 Проверьте логи Inngest для обработки события');
  } catch (error) {
    console.error('❌ Ошибка при отправке события:', error.message);
  }
}

testCarousel();
