#!/usr/bin/env bun

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { vibeCodingCommands } from '../src/commands/vibecoding-commands';

// 🕉️ Тестовые сценарии
const TEST_QUERIES = [
  {
    name: 'Основы Vibecoding',
    query: 'философия vibecoding медитация программирование',
    categories: ['fundamentals', 'philosophy'],
    style: 'gradient' as const,
  },
  {
    name: 'AI инструменты',
    query: 'искусственный интеллект GPT Claude Cursor',
    categories: ['tools'],
    style: 'dark' as const,
  },
  {
    name: 'Практики разработки',
    query: 'практики кодирования JavaScript TypeScript',
    categories: ['practices', 'development'],
    style: 'vibrant' as const,
  },
  {
    name: 'Аналитика и метрики',
    query: 'аналитика данные метрики измерения',
    categories: ['analytics'],
    style: 'minimalist' as const,
  },
];

/**
 * 🧪 Основная функция тестирования
 */
async function testVibeCodingSystem() {
  console.log('🕉️ ============================================');
  console.log('🧪 ТЕСТИРОВАНИЕ СИСТЕМЫ ВЕКТОРИЗАЦИИ VIBECODING');
  console.log('🕉️ ============================================\n');

  try {
    // 1. Проверяем статистику векторной базы
    console.log('📊 1. Проверка статистики векторной базы...');
    const stats = await vibeCodingCommands.getVibeCodingStats();

    console.log(`   ✅ Всего чанков: ${stats.totalChunks}`);
    console.log(`   ✅ Файлов обработано: ${stats.totalFiles}`);
    console.log(
      `   ✅ Средний размер чанка: ${Math.round(stats.avgTokensPerChunk)} токенов`
    );
    console.log(
      `   ✅ Топ категории: ${stats.topCategories.slice(0, 3).join(', ')}`
    );
    console.log(
      `   ✅ Топ типы секций: ${stats.topSectionTypes.slice(0, 3).join(', ')}\n`
    );

    if (stats.totalChunks === 0) {
      console.log('⚠️  Векторная база пуста! Запускаем векторизацию...');

      const reindexResult = await vibeCodingCommands.reindexVibecoding();

      if (reindexResult.success) {
        console.log(`   ✅ ${reindexResult.message}\n`);
      } else {
        console.error(`   ❌ ${reindexResult.message}\n`);
        return;
      }
    }

    // 2. Тестируем различные типы поиска
    console.log('🔍 2. Тестирование различных типов поиска...');

    const searchResults = await vibeCodingCommands.searchVibecoding({
      query: 'медитация и программирование',
      searchType: 'hybrid',
      limit: 5,
      generateCarousel: false,
    });

    if (searchResults.success) {
      console.log(`   ✅ Поиск выполнен за ${searchResults.totalTime}ms`);
      console.log(`   ✅ Найдено ${searchResults.results.length} результатов`);

      if (searchResults.stats) {
        console.log(
          `   ✅ Векторных: ${searchResults.stats.vectorCount}, Полнотекстовых: ${searchResults.stats.fullTextCount}`
        );
      }

      searchResults.results.slice(0, 2).forEach((result, index) => {
        console.log(
          `   📄 ${index + 1}. ${result.title || 'Без заголовка'} (${Math.round(result.similarity * 100)}%)`
        );
        console.log(
          `      Категория: ${result.category}, Файл: ${result.sourceFile}`
        );
      });
    } else {
      console.error(`   ❌ Ошибка поиска: ${searchResults.error}`);
    }
    console.log('');

    // 3. Тестируем генерацию каруселей для каждого тестового запроса
    console.log('🎨 3. Тестирование генерации каруселей...\n');

    const outputDir = './test-outputs';

    for (const testCase of TEST_QUERIES) {
      console.log(`   🎯 Тестируем: ${testCase.name}`);
      console.log(`   📝 Запрос: "${testCase.query}"`);
      console.log(`   🎨 Стиль: ${testCase.style}`);

      try {
        const carouselResult =
          await vibeCodingCommands.generateVibeCodingCarousel(testCase.query, {
            maxCards: 3,
            style: testCase.style,
            categories: testCase.categories,
            includeCodeExamples: true,
          });

        if (carouselResult.success) {
          console.log(`   ✅ ${carouselResult.message}`);
          console.log(
            `   ⏱️  Время поиска: ${carouselResult.searchStats?.queryTime}ms`
          );

          // Сохраняем изображения карусели
          if (
            carouselResult.carouselImages &&
            carouselResult.carouselImages.length > 0
          ) {
            for (let i = 0; i < carouselResult.carouselImages.length; i++) {
              const imageData = carouselResult.carouselImages[i];
              const base64Data = imageData.replace(
                /^data:image\/png;base64,/,
                ''
              );
              const fileName = `${testCase.name.replace(/\s+/g, '_').toLowerCase()}_card_${i + 1}.png`;
              const filePath = join(outputDir, fileName);

              try {
                await writeFile(filePath, base64Data, 'base64');
                console.log(`   💾 Сохранено: ${fileName}`);
              } catch (saveError) {
                console.error(
                  `   ❌ Ошибка сохранения ${fileName}:`,
                  saveError
                );
              }
            }
          }

          // Показываем информацию о карточках
          if (carouselResult.carouselCards) {
            carouselResult.carouselCards.forEach((card, index) => {
              console.log(`   📄 Карточка ${index + 1}: ${card.title}`);
              console.log(
                `      Категория: ${card.category}, Теги: ${card.tags.slice(0, 3).join(', ')}`
              );
              if (card.codeExamples && card.codeExamples.length > 0) {
                console.log(`      💻 Есть примеры кода`);
              }
              if (card.keyPrinciples && card.keyPrinciples.length > 0) {
                console.log(`      🎯 Принципов: ${card.keyPrinciples.length}`);
              }
            });
          }
        } else {
          console.error(
            `   ❌ ${carouselResult.error || 'Неизвестная ошибка'}`
          );
        }
      } catch (error) {
        console.error(`   💥 Критическая ошибка: ${error}`);
      }

      console.log('');
    }

    // 4. Итоговый отчет
    console.log('📈 4. Итоговый отчет производительности...');

    const finalStats = await vibeCodingCommands.getVibeCodingStats();

    console.log(`   📊 База данных:`);
    console.log(`      • Чанков: ${finalStats.totalChunks}`);
    console.log(`      • Файлов: ${finalStats.totalFiles}`);
    console.log(
      `      • Средний размер: ${Math.round(finalStats.avgTokensPerChunk)} токенов`
    );

    console.log(`   📂 Распределение по категориям:`);
    Object.entries(finalStats.categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([category, count]) => {
        console.log(`      • ${category}: ${count} чанков`);
      });

    console.log(`   📝 Типы секций:`);
    Object.entries(finalStats.sectionTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([sectionType, count]) => {
        console.log(`      • ${sectionType}: ${count} чанков`);
      });

    console.log('\n🎉 ============================================');
    console.log('✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО УСПЕШНО!');
    console.log('🎨 Проверьте файлы каруселей в папке test-outputs/');
    console.log('🕉️ ============================================');
  } catch (error) {
    console.error('\n💥 ============================================');
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА ПРИ ТЕСТИРОВАНИИ:');
    console.error(error);
    console.error('🕉️ ============================================');
    process.exit(1);
  }
}

/**
 * 🏃‍♂️ Быстрый тест одного запроса
 */
async function quickTest(query: string = 'vibecoding философия') {
  console.log(`🚀 Быстрый тест для запроса: "${query}"`);

  const result = await vibeCodingCommands.generateVibeCodingCarousel(query, {
    maxCards: 2,
    style: 'vibrant',
    includeCodeExamples: true,
  });

  if (result.success) {
    console.log(`✅ ${result.message}`);
    console.log(`📊 Статистика поиска:`, result.searchStats);

    if (result.carouselCards) {
      result.carouselCards.forEach((card, index) => {
        console.log(
          `📄 ${index + 1}. ${card.title} (${Math.round(card.relevanceScore * 100)}%)`
        );
      });
    }
  } else {
    console.error(`❌ ${result.error}`);
  }
}

// 🚀 Запуск в зависимости от аргументов
const args = process.argv.slice(2);

if (args[0] === 'quick') {
  const query = args.slice(1).join(' ');
  quickTest(query);
} else if (import.meta.main) {
  testVibeCodingSystem();
}

export { testVibeCodingSystem, quickTest };
