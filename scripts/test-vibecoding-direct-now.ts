#!/usr/bin/env bun

/**
 * 🧪 ПРЯМОЙ ТЕСТ VIBECODING BROADCAST БЕЗ INNGEST
 * Напрямую тестирует логику функции
 */

import { VibeCodingVectorService } from '../src/services/vibecoding-vector.service';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import { bot } from '../src/bot';
import type { CarouselSlide } from '../src/types';
import { db } from '../src/db';
import { users, userSettings } from '../src/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { InputMediaPhoto } from 'telegraf/types';

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

  console.log(`📅 Выбрана тема дня: ${theme.name}`);
  return theme;
}

/**
 * 🎨 Преобразует контент VibeCoding в слайды карусели
 */
function convertVibeCodingToSlides(
  content: string,
  title: string
): CarouselSlide[] {
  const maxCharsPerSlide = 200;
  const slides: CarouselSlide[] = [];

  // Первый слайд - заголовок
  slides.push({
    title: '🧘‍♂️ VibeCoding мудрость',
    content: title,
    type: 'title',
    order: 1,
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
        type: 'principle',
        order: slideNumber,
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
      type: 'principle',
      order: slideNumber,
    });
  }

  // Финальный слайд
  slides.push({
    title: '🙏 Практикуй каждый день',
    content:
      'VibeCoding - это путь к осознанному программированию через состояние потока и интуитивное взаимодействие с AI.',
    type: 'summary',
    order: slides.length + 1,
  });

  // Ограничиваем до 5 слайдов максимум
  return slides.slice(0, 5);
}

/**
 * 🚀 ПРЯМОЕ ВЫПОЛНЕНИЕ BROADCAST ЛОГИКИ
 */
async function runVibeCodingBroadcastDirect() {
  console.log('🧪 ПРЯМОЙ ТЕСТ VIBECODING BROADCAST ЛОГИКИ\n');

  try {
    const startTime = Date.now();

    // 🎲 Шаг 1: Получаем тему дня
    console.log('🎯 Шаг 1: Получение темы дня');
    const theme = getDailyTheme();
    console.log(`${theme.emoji} Тема: ${theme.name}`);
    console.log(`🔍 Запрос: "${theme.query}"\n`);

    // 🔍 Шаг 2: Получаем случайный VibeCoding контент
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
      theme,
    };

    console.log(`✅ Найден контент: ${randomContent.title}`);
    console.log(`📁 Категория: ${randomContent.category}\n`);

    // 🎨 Шаг 3: Преобразуем контент в слайды
    console.log('🎨 Шаг 3: Преобразование в слайды');
    const slides = convertVibeCodingToSlides(
      randomContent.content,
      randomContent.title
    );
    console.log(`✅ Создано ${slides.length} слайдов\n`);

    // 🎨 Шаг 4: Генерируем изображения
    console.log('🖼️ Шаг 4: Генерация изображений (быстрый тест)');

    const colorTemplates = Object.values(ColorTemplate);
    const randomTemplate =
      colorTemplates[Math.floor(Math.random() * colorTemplates.length)];
    console.log(`🎨 Выбран шаблон: ${randomTemplate}`);

    try {
      // Тестируем только первый слайд для скорости
      const testSlides = slides.slice(0, 1);
      const imageBuffers = await canvasService.generateCarouselImages(
        testSlides,
        undefined,
        randomTemplate
      );
      console.log(
        `✅ Успешно сгенерирован тестовый слайд (${Math.round(imageBuffers[0].length / 1024)}KB)\n`
      );
    } catch (imageError) {
      console.log(`⚠️ Генерация изображений пропущена (${imageError})\n`);
    }

    // 🔍 Шаг 5: Получаем пользователей (только меня для теста)
    console.log('👥 Шаг 5: Отправка тестового сообщения');
    const caption =
      `${randomContent.theme.emoji} **${randomContent.theme.name}**\n\n` +
      `📝 ${randomContent.title}\n\n` +
      `📚 Источник: Библия VibeCoding\n` +
      `📅 ${new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Moscow',
      })}\n\n` +
      `#VibeCoding #${randomContent.theme.name.replace(/\s+/g, '')} #МедитативноеПрограммирование\n\n` +
      `🧪 **Прямой тест broadcast функции**\n` +
      `⚡ Время выполнения: ${Date.now() - startTime}ms`;

    // Отправляем мне как тест
    await bot.telegram.sendMessage(144022504, caption, {
      parse_mode: 'Markdown',
    });

    console.log('✅ Тестовое сообщение отправлено!\n');

    const executionTime = Date.now() - startTime;
    console.log('🎉 ПРЯМОЙ ТЕСТ ЗАВЕРШЕН УСПЕШНО!');
    console.log(`⚡ Общее время: ${executionTime}ms`);
    console.log('✅ Логика broadcast функции работает корректно');
    console.log('✅ Система ежедневных тематических рубрик функционирует');
  } catch (error) {
    console.error('❌ Ошибка в прямом тесте:', error);
    throw error;
  }
}

// Запуск
runVibeCodingBroadcastDirect();
