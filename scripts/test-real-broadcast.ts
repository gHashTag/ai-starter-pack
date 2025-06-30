#!/usr/bin/env bun

import { triggerVibeCodingBroadcast } from '../src/inngest/functions/vibecoding-broadcast';

console.log('🚀 Запускаем РЕАЛЬНЫЙ тест VibeCoding Broadcast...');

try {
  // Вызываем функцию напрямую с реальной отправкой сообщений
  const result = await triggerVibeCodingBroadcast();

  console.log('✅ Broadcast выполнен успешно!');
  console.log('📊 Результат:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('❌ Ошибка при выполнении broadcast:', error);
  process.exit(1);
}

console.log('�� Тест завершен');
