#!/usr/bin/env bun

import { quickSetupVectors } from './quick-setup-vectors';
import { improvedVectorization } from './improved-vectorizer';

/**
 * 🚀 ПОЛНАЯ АВТОМАТИЧЕСКАЯ ВЕКТОРИЗАЦИЯ VIBECODING
 * 
 * Этот скрипт:
 * 1. Создает векторную структуру в базе данных
 * 2. Запускает улучшенную векторизацию
 * 3. Заполняет базу качественными данными
 */
async function fullAutoVectorization(connectionString: string): Promise<void> {
  console.log('🕉️ ================================================');
  console.log('🧘 ПОЛНАЯ АВТОМАТИЧЕСКАЯ ВЕКТОРИЗАЦИЯ VIBECODING');
  console.log('🕉️ ================================================\n');

  try {
    // Этап 1: Создание векторной структуры
    console.log('🏗️ ЭТАП 1: СОЗДАНИЕ ВЕКТОРНОЙ СТРУКТУРЫ');
    console.log('==========================================\n');
    
    await quickSetupVectors(connectionString);

    console.log('\n⏱️ Пауза 2 секунды...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Этап 2: Векторизация контента
    console.log('🤖 ЭТАП 2: ВЕКТОРИЗАЦИЯ КОНТЕНТА');
    console.log('==================================\n');
    
    await improvedVectorization(connectionString);

    // Финал
    console.log('\n🎉 ================================================');
    console.log('✅ ПОЛНАЯ ВЕКТОРИЗАЦИЯ ЗАВЕРШЕНА УСПЕШНО!');
    console.log('🎯 Векторная база данных готова к использованию');
    console.log('🕉️ ================================================');

  } catch (error) {
    console.error('\n💥 КРИТИЧЕСКАЯ ОШИБКА:');
    console.error('=======================');
    console.error(error);
    console.log('\n🔧 Возможные решения:');
    console.log('1. Проверьте connection string');
    console.log('2. Убедитесь, что установлен OPENAI_API_KEY');
    console.log('3. Проверьте наличие папки ./vibecoding с .md файлами');
    
    throw error;
  }
}

// Запуск из командной строки
if (import.meta.main) {
  console.log('🚀 Запуск полной автоматической векторизации...\n');

  const connectionString = process.argv[2];
  
  if (!connectionString) {
    console.error('❌ ОШИБКА: Необходимо указать строку подключения к базе данных');
    console.log('\n💡 ИСПОЛЬЗОВАНИЕ:');
    console.log('bun run scripts/full-auto-vectorization.ts "connection_string"');
    console.log('\n📝 ПРИМЕР:');
    console.log('bun run scripts/full-auto-vectorization.ts "postgresql://user:pass@host/db"');
    console.log('\n🔑 ТРЕБОВАНИЯ:');
    console.log('- Установите переменную OPENAI_API_KEY');
    console.log('- Убедитесь, что папка ./vibecoding содержит .md файлы');
    console.log('- Connection string должен быть для правильного проекта Neon');
    
    process.exit(1);
  }
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ОШИБКА: Необходимо установить переменную OPENAI_API_KEY');
    console.log('\n💡 Установите так:');
    console.log('export OPENAI_API_KEY="your_openai_api_key"');
    process.exit(1);
  }

  // Запуск
  const startTime = Date.now();
  
  fullAutoVectorization(connectionString)
    .then(() => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n⏱️ Общее время выполнения: ${duration} секунд`);
      console.log('\n🎊 ВСЁ ГОТОВО! Векторная база данных создана и заполнена!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💀 ПОЛНАЯ НЕУДАЧА:', error);
      process.exit(1);
    });
}

export { fullAutoVectorization };
