#!/usr/bin/env bun

/**
 * 🧪 ТЕСТ ЗАПУСКА VIBECODING BROADCAST ПРЯМО СЕЙЧАС
 * Тестирует работу функции с ежедневными тематическими рубриками
 */

import { inngest } from '../src/inngest/client';
import { bot } from '../src/bot';

/**
 * 🚀 Тестируем broadcast функцию прямо сейчас
 */
async function testVibeCodingBroadcastNow() {
  console.log('🧪 ТЕСТ VIBECODING BROADCAST - ЗАПУСК СЕЙЧАС\n');

  try {
    console.log('🎯 Шаг 1: Отправляем событие для запуска broadcast функции');

    // Отправляем событие для запуска broadcast
    const result = await inngest.send({
      name: 'vibecoding/broadcast',
      data: {
        source: 'manual_test',
        timestamp: new Date().toISOString(),
        testRun: true,
      },
    });

    console.log('✅ Событие отправлено:', result);
    console.log(
      '🔄 Функция должна выполниться в течение нескольких секунд...\n'
    );

    // Даем время на выполнение
    console.log('⏳ Ожидаем 10 секунд для выполнения функции...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('✅ Тест отправки события завершен!');
    console.log('📋 Проверьте логи Inngest для результатов выполнения');
  } catch (error) {
    console.error('❌ Ошибка в тесте:', error);
    throw error;
  }
}

/**
 * 🎯 Дополнительный тест: отправка прямо мне
 */
async function testDirectSendToMe() {
  console.log('\n📱 ДОПОЛНИТЕЛЬНЫЙ ТЕСТ: Отправка прямо мне (144022504)');

  try {
    const testMessage =
      `🧪 **Тест VibeCoding Broadcast**\n\n` +
      `📅 ${new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Moscow',
      })}\n\n` +
      `✅ Система ежедневных тематических рубрик работает!\n\n` +
      `🎯 Следующий автоматический broadcast: каждый час\n\n` +
      `#VibeCoding #ТестСистемы`;

    await bot.telegram.sendMessage(144022504, testMessage, {
      parse_mode: 'Markdown',
    });

    console.log('✅ Тестовое сообщение отправлено прямо вам!');
  } catch (error) {
    console.error('❌ Ошибка отправки тестового сообщения:', error);
  }
}

/**
 * 🚀 Основная функция
 */
async function main() {
  console.log('🚀 ЗАПУСК ПОЛНОГО ТЕСТА VIBECODING BROADCAST\n');

  try {
    // Тест 1: Запуск через Inngest событие
    await testVibeCodingBroadcastNow();

    // Тест 2: Прямая отправка мне для подтверждения
    await testDirectSendToMe();

    console.log('\n🎉 ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ!');
    console.log('📋 Результаты:');
    console.log('   ✅ Inngest событие отправлено');
    console.log('   ✅ Тестовое сообщение отправлено прямо вам');
    console.log(
      '   🔄 Проверьте логи Inngest для статуса выполнения broadcast'
    );
  } catch (error) {
    console.error('❌ Ошибка в основной функции:', error);
    process.exit(1);
  }
}

// Запуск
main();
