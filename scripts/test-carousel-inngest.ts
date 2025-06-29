/**
 * 🧪 Тестовый скрипт для Inngest функции генерации карусели
 *
 * Этот скрипт отправляет событие в Inngest и проверяет работу функции
 */

import { inngest } from '../src/inngest/client';

async function testCarouselGeneration() {
  console.log('🎨 Тестируем Inngest функцию генерации карусели...\n');

  try {
    // Отправляем событие
    const eventData = {
      topic: 'медитативное программирование',
      telegramUserId: '144022504', // ID пользователя из памяти
      messageId: 999, // Тестовый ID сообщения
    };

    console.log('📤 Отправляем событие:', eventData);

    const result = await inngest.send({
      name: 'app/carousel.generate.request',
      data: eventData,
    });

    console.log('✅ Событие успешно отправлено:');
    console.log('📋 Результат:', JSON.stringify(result, null, 2));

    console.log('\n🎯 Проверьте Inngest Dashboard: http://localhost:8288');
    console.log('📱 Проверьте Telegram бот на получение сообщений');
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);

    if (error instanceof Error) {
      console.error('📝 Сообщение ошибки:', error.message);
      console.error('🔍 Стек ошибки:', error.stack);
    }
  }
}

// Запускаем тест
testCarouselGeneration()
  .then(() => {
    console.log('\n🎉 Тест завершен!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });
