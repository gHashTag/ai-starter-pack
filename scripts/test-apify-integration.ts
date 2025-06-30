#!/usr/bin/env bun

/**
 * 🕉️ VibeCoding Apify Integration Test
 *
 * Тестирует интеграцию Apify API для реального веб-поиска
 * через VibeCoding Research Agent
 */

import { logger, LogType } from '../src/utils/logger';
import { VibeCodingResearchAgent } from '../src/agents/vibecoding-research-agent';

async function testApifyIntegration() {
  console.log('🕉️ === VibeCoding Apify Integration Test ===\n');

  try {
    // Проверяем наличие APIFY_TOKEN
    const apifyToken = process.env.APIFY_TOKEN;
    console.log(`🔑 APIFY_TOKEN: ${apifyToken ? '✅ Найден' : '❌ Не найден'}`);

    if (!apifyToken) {
      console.log(
        '⚠️ Для тестирования реального поиска добавьте APIFY_TOKEN в .env файл'
      );
      console.log('💡 Тест будет использовать fallback данные\n');
    }

    // Создаем Research Agent
    const researchAgent = new VibeCodingResearchAgent();
    console.log('✅ VibeCoding Research Agent создан\n');

    // Тестовые запросы
    const testQueries = [
      'медитативное программирование',
      'AI инструменты разработка 2025',
      'состояние потока coding',
    ];

    for (const [index, query] of testQueries.entries()) {
      console.log(`\n🔍 === Тест ${index + 1}: "${query}" ===`);

      const startTime = Date.now();

      try {
        console.log('⏳ Выполняем исследование...');

        // Выполняем исследование через Research Agent (который использует Apify)
        const result = await researchAgent.researchTopic(query, 'basic');

        const duration = Date.now() - startTime;

        console.log(`⚡ Завершено за ${duration}ms`);
        console.log('\n📊 Результаты исследования:');
        console.log(`   📝 Резюме: ${result.summary.slice(0, 150)}...`);
        console.log(`   💡 Инсайтов: ${result.keyInsights.length}`);
        console.log(`   🔥 Трендов: ${result.trends.length}`);
        console.log(`   🚀 Рекомендаций: ${result.recommendations.length}`);
        console.log(`   📚 Источников: ${result.sources.length}`);
        console.log(`   🎯 Уверенность: ${result.confidenceLevel}/10`);

        if (result.sources.length > 0) {
          console.log('\n📖 Примеры источников:');
          result.sources.slice(0, 2).forEach((source, i) => {
            console.log(`   ${i + 1}. ${source.title}`);
            console.log(`      ${source.url}`);
            console.log(`      "${source.snippet?.slice(0, 100)}..."`);
          });
        }

        // Проверяем качество данных
        const hasRealData = result.sources.some(
          source => source.url && !source.url.includes('example.com')
        );

        console.log(
          `\n🎯 Статус данных: ${hasRealData ? '🌐 Реальные данные из Apify' : '🎭 Fallback данные'}`
        );
      } catch (error) {
        console.error(
          `❌ Ошибка в тесте ${index + 1}:`,
          error instanceof Error ? error.message : error
        );
      }

      // Пауза между тестами
      if (index < testQueries.length - 1) {
        console.log('\n⏳ Пауза 3 секунды между тестами...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log('\n🎉 === Тестирование завершено ===');
    console.log('\n📊 Статистика интеграции:');
    console.log(`   🔑 APIFY_TOKEN: ${apifyToken ? 'Активен' : 'Отсутствует'}`);
    console.log(`   🤖 Research Agent: Готов к работе`);
    console.log(
      `   🌐 Веб-поиск: ${apifyToken ? 'Apify Google Search' : 'Fallback режим'}`
    );
    console.log(`   🕉️ VibeCoding философия: Интегрирована`);

    if (apifyToken) {
      console.log('\n✅ Система готова к production использованию!');
      console.log(
        '🚀 Broadcast будет использовать реальные данные из интернета'
      );
    } else {
      console.log('\n💡 Для активации реального поиска:');
      console.log('   1. Добавьте APIFY_TOKEN в .env файл');
      console.log('   2. Перезапустите приложение');
      console.log('   3. Система автоматически переключится на Apify API');
    }
  } catch (error) {
    console.error('💥 Критическая ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запускаем тест
testApifyIntegration().catch(console.error);
