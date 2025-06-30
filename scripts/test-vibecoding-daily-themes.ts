#!/usr/bin/env bun

/**
 * 🧪 Тест системы ежедневных тематических рубрик VibeCoding
 * Проверяет разные дни недели и случайные темы
 */

import { VibeCodingVectorService } from '../src/services/vibecoding-vector.service';
import { logger, LogType } from '../src/utils/logger';

const vectorService = new VibeCodingVectorService();

/**
 * 📅 Тематические рубрики для каждого дня недели (копия из broadcast функции)
 */
const DAILY_VIBECODING_THEMES = {
  // 0 = Воскресенье
  0: {
    name: 'Мифы и Реальность VibeCoding',
    query: 'мифы vibecoding реальность заблуждения',
    categories: ['general', 'fundamentals'],
    emoji: '🕉️',
  },
  // 1 = Понедельник
  1: {
    name: 'Основы и Философия VibeCoding',
    query: 'библия vibecoding основы философия принципы',
    categories: ['fundamentals', 'main_book'],
    emoji: '📖',
  },
  // 2 = Вторник
  2: {
    name: 'Cursor AI и Инструменты',
    query: 'cursor ai инструменты разработка руководство',
    categories: ['tools'],
    emoji: '🛠️',
  },
  // 3 = Среда
  3: {
    name: 'Медитативные Практики и Flow',
    query: 'медитативное программирование практики поток состояние',
    categories: ['practices'],
    emoji: '🧘‍♂️',
  },
  // 4 = Четверг
  4: {
    name: 'Разработка и Roadmap',
    query: 'разработка roadmap интенсивный продакшен',
    categories: ['development'],
    emoji: '🚀',
  },
  // 5 = Пятница
  5: {
    name: 'AI-Инструменты 2025',
    query: 'ai инструменты 2025 детальный анализ новые',
    categories: ['tools', 'analytics'],
    emoji: '🤖',
  },
  // 6 = Суббота
  6: {
    name: 'Контент и Telegram',
    query: 'telegram посты контент планы продающие',
    categories: ['general'],
    emoji: '📱',
  },
} as const;

/**
 * 🎲 Получает тему для конкретного дня недели
 */
function getThemeForDay(dayOfWeek: number) {
  const theme =
    DAILY_VIBECODING_THEMES[dayOfWeek as keyof typeof DAILY_VIBECODING_THEMES];
  return theme;
}

/**
 * 🧪 Тестирует тему дня
 */
async function testDailyTheme(dayOfWeek: number) {
  const theme = getThemeForDay(dayOfWeek);
  const dayNames = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ];

  console.log(`\n${theme.emoji} === ${dayNames[dayOfWeek].toUpperCase()} ===`);
  console.log(`   📝 Тема: ${theme.name}`);
  console.log(`   🔍 Поисковый запрос: "${theme.query}"`);
  console.log(`   📂 Категории: ${theme.categories.join(', ')}`);

  try {
    // Ищем контент по теме дня
    const searchResult = await vectorService.hybridSearch(theme.query, {
      limit: 3,
    });

    if (
      searchResult.combinedResults &&
      searchResult.combinedResults.length > 0
    ) {
      console.log(
        `   ✅ Найдено ${searchResult.combinedResults.length} результатов:`
      );

      searchResult.combinedResults.slice(0, 2).forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.title || 'Без заголовка'}`);
        console.log(
          `      📁 Категория: ${result.metadata?.file_category || 'unknown'}`
        );
        console.log(`      📝 Контент: ${result.content.substring(0, 100)}...`);
        console.log(
          `      📊 Сходство: ${(result.similarity * 100).toFixed(1)}%`
        );
      });
    } else {
      console.log(`   ❌ Результатов не найдено для запроса: "${theme.query}"`);
    }
  } catch (error) {
    console.error(`   ❌ Ошибка поиска:`, error);
  }
}

/**
 * 🚀 Основная функция теста
 */
async function main() {
  console.log('🧪 ТЕСТ СИСТЕМЫ ЕЖЕДНЕВНЫХ ТЕМАТИЧЕСКИХ РУБРИК VIBECODING\n');

  const today = new Date();
  const currentDay = today.getDay();

  console.log(
    `📅 Сегодня: ${today.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })} (день недели: ${currentDay})`
  );

  // Тестируем текущий день
  console.log('\n🎯 ТЕМА СЕГОДНЯШНЕГО ДНЯ:');
  await testDailyTheme(currentDay);

  // Тестируем все дни недели
  console.log('\n📊 ВСЕ ТЕМЫ НЕДЕЛИ:');
  for (let day = 0; day < 7; day++) {
    await testDailyTheme(day);
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Тест завершен успешно!');
}

// Запускаем тест
main().catch(error => {
  console.error('❌ Ошибка в тесте:', error);
  process.exit(1);
});
