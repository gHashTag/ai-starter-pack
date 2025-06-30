#!/usr/bin/env bun

/**
 * 🧪 Финальный тест VibeCoding broadcast с ежедневными тематическими рубриками
 * Тестирует полный цикл: получение темы дня -> поиск контента -> генерация слайдов -> создание изображений
 */

import { VibeCodingVectorService } from '../src/services/vibecoding-vector.service';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import { logger, LogType } from '../src/utils/logger';
import type { CarouselSlide } from '../src/types';

const vectorService = new VibeCodingVectorService();
const canvasService = new InstagramCanvasService();

/**
 * 📅 Тематические рубрики для каждого дня недели
 */
const DAILY_VIBECODING_THEMES = {
  0: {
    name: 'Мифы и Реальность VibeCoding',
    query: 'мифы vibecoding реальность заблуждения',
    categories: ['general', 'fundamentals'],
    emoji: '🕉️',
  },
  1: {
    name: 'Основы и Философия VibeCoding',
    query: 'библия vibecoding основы философия принципы',
    categories: ['fundamentals', 'main_book'],
    emoji: '📖',
  },
  2: {
    name: 'Cursor AI и Инструменты',
    query: 'cursor ai инструменты разработка руководство',
    categories: ['tools'],
    emoji: '🛠️',
  },
  3: {
    name: 'Медитативные Практики и Flow',
    query: 'медитативное программирование практики поток состояние',
    categories: ['practices'],
    emoji: '🧘‍♂️',
  },
  4: {
    name: 'Разработка и Roadmap',
    query: 'разработка roadmap интенсивный продакшен',
    categories: ['development'],
    emoji: '🚀',
  },
  5: {
    name: 'AI-Инструменты 2025',
    query: 'ai инструменты 2025 детальный анализ новые',
    categories: ['tools', 'analytics'],
    emoji: '🤖',
  },
  6: {
    name: 'Контент и Telegram',
    query: 'telegram посты контент планы продающие',
    categories: ['general'],
    emoji: '📱',
  },
} as const;

/**
 * 🎲 Получает тему дня
 */
function getDailyTheme() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const theme =
    DAILY_VIBECODING_THEMES[dayOfWeek as keyof typeof DAILY_VIBECODING_THEMES];

  console.log(`📅 Выбрана тема дня: ${theme.name}`, {
    dayOfWeek,
    themeName: theme.name,
    categories: theme.categories,
    query: theme.query,
  });

  return theme;
}

/**
 * 🎨 Преобразует контент VibeCoding в слайды карусели
 */
function convertVibeCodingToSlides(
  content: string,
  title: string
): CarouselSlide[] {
  // Разбиваем контент на части (примерно по 200 символов на слайд)
  const maxCharsPerSlide = 200;
  const slides: CarouselSlide[] = [];

  // Первый слайд - заголовок
  slides.push({
    title: '🧘‍♂️ VibeCoding мудрость',
    content: title,
    type: 'title',
  });

  // Разбиваем контент на слайды
  const words = content.split(' ');
  let currentSlide = '';
  let slideNumber = 2;

  for (const word of words) {
    if ((currentSlide + word).length > maxCharsPerSlide && currentSlide) {
      slides.push({
        title: `Принцип ${slideNumber - 1}`,
        content: currentSlide.trim(),
        type: 'content',
      });
      currentSlide = word + ' ';
      slideNumber++;
    } else {
      currentSlide += word + ' ';
    }
  }

  // Добавляем последний слайд если есть остаток
  if (currentSlide.trim()) {
    slides.push({
      title: `Принцип ${slideNumber - 1}`,
      content: currentSlide.trim(),
      type: 'content',
    });
  }

  // Финальный слайд
  slides.push({
    title: '🙏 Практикуй каждый день',
    content:
      'VibeCoding - это путь к осознанному программированию через состояние потока и интуитивное взаимодействие с AI.',
    type: 'summary',
  });

  // Ограничиваем до 5 слайдов максимум
  return slides.slice(0, 5);
}

/**
 * 🚀 Основная функция теста
 */
async function main() {
  console.log(
    '🧪 ФИНАЛЬНЫЙ ТЕСТ VIBECODING BROADCAST С ЕЖЕДНЕВНЫМИ РУБРИКАМИ\n'
  );

  try {
    // 🎲 Шаг 1: Получаем тему дня
    console.log('🎯 Шаг 1: Получение темы дня');
    const theme = getDailyTheme();

    console.log(`${theme.emoji} Тема: ${theme.name}`);
    console.log(`🔍 Поисковый запрос: "${theme.query}"`);
    console.log(`📂 Категории: ${theme.categories.join(', ')}\n`);

    // 🔍 Шаг 2: Получаем случайный VibeCoding контент по теме дня
    console.log('🔍 Шаг 2: Поиск контента по теме дня');
    const searchResult = await vectorService.hybridSearch(theme.query, {
      limit: 1,
    });

    if (
      !searchResult.combinedResults ||
      searchResult.combinedResults.length === 0
    ) {
      throw new Error(`Не найдено контента для темы: ${theme.name}`);
    }

    const result = searchResult.combinedResults[0];
    const randomContent = {
      title: result.title || theme.name,
      content: result.content,
      category: result.metadata?.file_category || theme.categories[0],
      sourceFile: result.sourceFile,
      theme, // 🎯 Добавляем тему для использования в caption
    };

    console.log(`✅ Найден контент: ${randomContent.title}`);
    console.log(`📁 Категория: ${randomContent.category}`);
    console.log(`📝 Контент: ${randomContent.content.substring(0, 150)}...\n`);

    // 🎨 Шаг 3: Преобразуем контент в слайды
    console.log('🎨 Шаг 3: Преобразование контента в слайды');
    const slides = convertVibeCodingToSlides(
      randomContent.content,
      randomContent.title
    );

    console.log(`✅ Создано ${slides.length} слайдов:`);
    slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title} (${slide.type})`);
    });
    console.log();

    // 🎨 Шаг 4: Генерируем изображения
    console.log('🖼️ Шаг 4: Генерация изображений карусели');

    // Случайно выбираем цветовой шаблон
    const colorTemplates = Object.values(ColorTemplate);
    const randomTemplate =
      colorTemplates[Math.floor(Math.random() * colorTemplates.length)];

    console.log(`🎨 Выбран шаблон: ${randomTemplate}`);

    const imageBuffers = await canvasService.generateCarouselImages(
      slides,
      undefined,
      randomTemplate
    );

    console.log(`✅ Сгенерировано ${imageBuffers.length} изображений:`);
    imageBuffers.forEach((buffer, index) => {
      const sizeKB = Math.round(buffer.length / 1024);
      console.log(`   ${index + 1}. Слайд ${index + 1}: ${sizeKB}KB`);
    });
    console.log();

    // 📝 Шаг 5: Показываем пример caption
    console.log('📝 Шаг 5: Пример caption для Telegram');
    const sampleCaption =
      `${randomContent.theme.emoji} **${randomContent.theme.name}**\n\n` +
      `📝 ${randomContent.title}\n\n` +
      `📚 Источник: Библия VibeCoding\n` +
      `📅 ${new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Moscow',
      })}\n\n` +
      `#VibeCoding #${randomContent.theme.name.replace(/\s+/g, '')} #МедитативноеПрограммирование`;

    console.log('📱 Caption для отправки:');
    console.log('---');
    console.log(sampleCaption);
    console.log('---\n');

    console.log('🎉 ТЕСТ ЗАВЕРШЕН УСПЕШНО!');
    console.log('✅ Система ежедневных тематических рубрик работает корректно');
    console.log('✅ Поиск контента по теме дня функционирует');
    console.log('✅ Генерация слайдов и изображений выполняется');
    console.log('✅ Caption формируется с правильной темой дня');
  } catch (error) {
    console.error('❌ Ошибка в тесте:', error);
    process.exit(1);
  }
}

// Запускаем тест
main();
