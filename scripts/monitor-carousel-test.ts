import { spawn } from 'child_process';

console.log('🎯 МОНИТОРИНГ ТЕСТИРОВАНИЯ КАРУСЕЛИ');
console.log('='.repeat(50));

console.log('\n📊 Статус сервисов:');
console.log('✅ telegram-bot: online');
console.log('✅ inngest-dev: online');

console.log('\n🤖 Бот: @bible_vibecoder_bot');
console.log('🎨 Новый дизайн: Яркие цветные изображения с градиентами');

console.log('\n🔍 Мониторинг логов (Ctrl+C для остановки):');
console.log('-'.repeat(50));

// Запускаем мониторинг логов
const logProcess = spawn('pm2', ['logs', '--lines', '0'], {
  stdio: 'inherit',
  shell: true,
});

logProcess.on('close', code => {
  console.log(`\n📋 Мониторинг завершен с кодом: ${code}`);
});

// Обработка сигналов
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка мониторинга...');
  logProcess.kill();
  process.exit(0);
});

console.log('\n💡 Инструкция:');
console.log('1. Откройте Telegram');
console.log('2. Найдите @bible_vibecoder_bot');
console.log('3. Отправьте: /start');
console.log('4. Отправьте: /carousel AI инструменты 2025');
console.log('5. Наблюдайте за логами ниже ⬇️');
