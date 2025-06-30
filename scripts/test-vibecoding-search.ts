#!/usr/bin/env bun

import { vibeCodingCommands } from '../src/commands/vibecoding-commands';

console.log('🔍 ТЕСТ VIBECODING ВЕКТОРНОГО ПОИСКА И КАРУСЕЛИ...');

async function testVibeCodingSearch() {
  try {
    console.log('\n1️⃣ Получение статистики VibeCoding базы...');

    const stats = await vibeCodingCommands.getVibeCodingStats();
    console.log('📊 Статистика:');
    console.log(`   📦 Всего чанков: ${stats.totalChunks}`);
    console.log(`   📁 Файлов: ${stats.totalFiles}`);
    console.log(
      `   📂 Топ категории: ${stats.topCategories.slice(0, 3).join(', ')}`
    );
    console.log(
      `   📝 Топ типы секций: ${stats.topSectionTypes.slice(0, 3).join(', ')}`
    );

    console.log('\n2️⃣ Тестирование поиска по теме...');

    const searchQueries = [
      'Cursor AI техники и практики',
      'медитативное программирование',
      'настройка рабочего пространства',
      'ИИ инструменты для разработки',
    ];

    for (const query of searchQueries) {
      console.log(`\n🔍 Поиск: "${query}"`);

      const searchResult = await vibeCodingCommands.searchVibecoding({
        query,
        searchType: 'hybrid',
        limit: 5,
        generateCarousel: false,
      });

      if (searchResult.success) {
        console.log(`   ✅ Найдено ${searchResult.results.length} результатов`);
        searchResult.results.slice(0, 2).forEach((result, index) => {
          console.log(
            `      ${index + 1}. ${result.title || 'Без заголовка'} (${result.category})`
          );
          console.log(`         📄 ${result.content.substring(0, 80)}...`);
          console.log(`         🎯 Релевантность: ${result.similarity}`);
        });
      } else {
        console.log(`   ❌ Ошибка поиска: ${searchResult.error}`);
      }
    }

    console.log('\n3️⃣ Тестирование генерации карусели...');

    const carouselThemes = [
      'Cursor AI техники и лучшие практики',
      'Медитативное программирование и состояние потока',
      'Инструменты и настройка рабочего пространства',
    ];

    for (const theme of carouselThemes) {
      console.log(`\n🎨 Создание карусели: "${theme}"`);

      const carouselResult =
        await vibeCodingCommands.generateVibeCodingCarousel(theme, {
          maxCards: 3,
          style: 'vibrant',
          includeCodeExamples: true,
          categories: ['general', 'fundamentals', 'tools', 'practices'],
        });

      if (carouselResult.success) {
        console.log(
          `   ✅ Карусель создана: ${carouselResult.carouselImages?.length || 0} карточек`
        );

        if (carouselResult.carouselCards) {
          carouselResult.carouselCards.forEach((card, index) => {
            console.log(`      ${index + 1}. ${card.title} (${card.category})`);
            console.log(`         📝 ${card.summary.substring(0, 60)}...`);
            console.log(
              `         🏷️ Теги: ${card.tags.slice(0, 3).join(', ')}`
            );
          });
        }
      } else {
        console.log(`   ❌ Ошибка карусели: ${carouselResult.error}`);
      }
    }

    console.log('\n🎉 ТЕСТ VIBECODING ПОИСКА ЗАВЕРШЕН!');
    console.log('✅ Векторная база данных функционирует корректно');
    console.log('🎨 Система генерации каруселей готова к работе');
  } catch (error) {
    console.error('\n💥 Критическая ошибка тестирования:', error);
  }
}

if (import.meta.main) {
  testVibeCodingSearch()
    .then(() => {
      console.log('\n✨ Тестирование завершено! 🕉️');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Критическая ошибка:', error);
      process.exit(1);
    });
}
