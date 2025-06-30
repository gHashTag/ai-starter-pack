import {
  vibeCodingVectorService,
  VibeCodingCarouselCard,
} from '../services/vibecoding-vector.service';
import {
  instagramCanvasService,
  ColorTemplate,
} from '../services/instagram-canvas.service';
import { logger, LogType } from '../utils/logger';
import type { CarouselSlide } from '../types';
import { vibeCodingBroadcast } from '../inngest/functions/vibecoding-broadcast';
import { BotContext } from '../types';
import { handleSendCarousel } from '../utils/button-handler';
import { VibeCodingVectorService } from '../services/vibecoding-vector.service';

// 🕉️ Интерфейсы для команд
interface VibeCodingSearchOptions {
  query: string;
  searchType?: 'vector' | 'fulltext' | 'hybrid';
  categories?: string[];
  sectionTypes?: string[];
  limit?: number;
  generateCarousel?: boolean;
  carouselOptions?: {
    maxCards?: number;
    includeCodeExamples?: boolean;
    groupByCategory?: boolean;
    style?: 'minimalist' | 'vibrant' | 'dark' | 'gradient';
  };
}

interface VibeCodingStatsResult {
  totalChunks: number;
  totalFiles: number;
  categoryCounts: Record<string, number>;
  sectionTypeCounts: Record<string, number>;
  avgTokensPerChunk: number;
  topCategories: string[];
  topSectionTypes: string[];
}

interface VibeCodingCommandResult {
  success: boolean;
  message?: string;
  error?: string;
  stats?: any;
}

/**
 * 🔍 Поиск по векторной базе Vibecoding с опциональной генерацией карусели
 */
export async function searchVibecoding(options: VibeCodingSearchOptions) {
  try {
    console.log(`🕉️ Начинаем поиск в Библии Vibecoding: "${options.query}"`);
    console.log(
      `📊 Тип поиска: ${options.searchType || 'hybrid'}, лимит: ${options.limit || 10}`
    );

    const startTime = Date.now();
    let searchResults;
    let searchStats;

    // Выполняем поиск в зависимости от типа
    switch (options.searchType) {
      case 'vector':
        searchResults = await vibeCodingVectorService.vectorSearch(
          options.query,
          {
            limit: options.limit,
            categories: options.categories,
            sectionTypes: options.sectionTypes,
          }
        );
        break;

      case 'fulltext':
        searchResults = await vibeCodingVectorService.fullTextSearch(
          options.query,
          {
            limit: options.limit,
            categories: options.categories,
          }
        );
        break;

      case 'hybrid':
      default:
        const hybridResult = await vibeCodingVectorService.hybridSearch(
          options.query,
          {
            limit: options.limit,
            categories: options.categories,
          }
        );
        searchResults = hybridResult.combinedResults;
        searchStats = hybridResult.searchStats;
        break;
    }

    console.log(
      `✅ Поиск завершен за ${Date.now() - startTime}ms. Найдено ${searchResults.length} результатов`
    );

    // Генерируем карусель если запрошено
    let carouselCards: VibeCodingCarouselCard[] | undefined;
    let carouselImages: string[] | undefined;

    if (options.generateCarousel && searchResults.length > 0) {
      console.log('🎨 Генерируем карусель из результатов поиска...');

      carouselCards = await vibeCodingVectorService.generateCarouselCards(
        searchResults,
        options.carouselOptions
      );

      // 🔧 ИСПРАВЛЕНИЕ: Создаем изображения с использованием готовых шаблонов
      if (carouselCards.length > 0) {
        console.log('🖼️ Создаем изображения карусели...');

        // Конвертируем в CarouselSlide[]
        const slides: CarouselSlide[] = carouselCards.map((card, index) => ({
          order: index + 1,
          type:
            index === 0
              ? 'title'
              : index === carouselCards!.length - 1
                ? 'summary'
                : 'practice',
          title: `${getCategoryEmoji(card.category)} ${card.title}`,
          content: card.summary,
          subtitle: card.codeExamples?.[0]
            ? `💻 ${card.codeExamples[0].substring(0, 100)}...`
            : undefined,
        }));

        // Определяем ColorTemplate - теперь только Galaxy Spiral Blur
        const colorTemplate = ColorTemplate.GALAXY_SPIRAL_BLUR;

        // Используем существующую функцию
        const imageBuffers =
          await instagramCanvasService.generateCarouselImages(
            slides,
            undefined,
            colorTemplate
          );

        // Конвертируем в base64
        carouselImages = imageBuffers.map(
          buffer => `data:image/png;base64,${buffer.toString('base64')}`
        );

        console.log(`✅ Создано ${carouselImages.length} изображений карусели`);
      }
    }

    // Возвращаем результат
    const result = {
      success: true,
      query: options.query,
      searchType: options.searchType || 'hybrid',
      results: searchResults.map(r => ({
        id: r.id,
        title: r.title,
        content:
          r.content.substring(0, 300) + (r.content.length > 300 ? '...' : ''),
        category: r.metadata.file_category,
        sectionType: r.metadata.section_type,
        sourceFile: r.sourceFile,
        similarity: Math.round(r.similarity * 100) / 100,
        tokenCount: r.tokenCount,
      })),
      stats: searchStats,
      carouselCards,
      carouselImages,
      totalTime: Date.now() - startTime,
    };

    console.log('🎉 Поиск и генерация завершены успешно!');
    return result;
  } catch (error) {
    console.error('💥 Критическая ошибка при поиске в Vibecoding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      query: options.query,
    };
  }
}

/**
 * 📊 Получение статистики векторной базы Vibecoding
 */
export async function getVibeCodingStats(): Promise<VibeCodingStatsResult> {
  try {
    console.log('📊 Получаем статистику векторной базы Vibecoding...');

    const stats = await vibeCodingVectorService.getVectorDatabaseStats();

    // Сортируем категории и типы секций по популярности
    const topCategories = Object.entries(stats.categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([category]) => category);

    const topSectionTypes = Object.entries(stats.sectionTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([sectionType]) => sectionType);

    const result: VibeCodingStatsResult = {
      ...stats,
      topCategories,
      topSectionTypes,
    };

    console.log(
      `✅ Статистика получена: ${stats.totalChunks} чанков из ${stats.totalFiles} файлов`
    );
    return result;
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    throw error;
  }
}

/**
 * 🎨 Быстрая генерация карусели по запросу (без детального поиска)
 */
export async function generateVibeCodingCarousel(
  query: string,
  options: {
    maxCards?: number;
    style?: 'minimalist' | 'vibrant' | 'dark' | 'gradient';
    categories?: string[];
    includeCodeExamples?: boolean;
  } = {}
) {
  try {
    console.log(
      `🎨 Быстрая генерация карусели Vibecoding для запроса: "${query}"`
    );

    const { maxCards = 5, style = 'vibrant' } = options;

    // Выполняем гибридный поиск
    const hybridResult = await vibeCodingVectorService.hybridSearch(query, {
      limit: Math.ceil(maxCards * 1.5), // Берем больше для лучшего отбора
      categories: options.categories,
    });

    if (hybridResult.combinedResults.length === 0) {
      return {
        success: false,
        message: 'По вашему запросу ничего не найдено в Библии Vibecoding',
        query,
      };
    }

    // Генерируем карточки
    const carouselCards = await vibeCodingVectorService.generateCarouselCards(
      hybridResult.combinedResults,
      {
        maxCards,
        includeCodeExamples: options.includeCodeExamples ?? true,
        groupByCategory: true,
      }
    );

    // 🔧 ИСПРАВЛЕНИЕ: Конвертируем VibeCoding карточки в CarouselSlide[]
    const slides: CarouselSlide[] = carouselCards.map((card, index) => ({
      order: index + 1,
      type:
        index === 0
          ? 'title'
          : index === carouselCards.length - 1
            ? 'summary'
            : 'practice',
      title: `${getCategoryEmoji(card.category)} ${card.title}`,
      content: card.summary,
      subtitle: card.codeExamples?.[0]
        ? `💻 ${card.codeExamples[0].substring(0, 100)}...`
        : undefined,
    }));

    // 🔧 ИСПРАВЛЕНИЕ: Используем только Galaxy Spiral Blur
    const colorTemplate = ColorTemplate.GALAXY_SPIRAL_BLUR;

    // 🔧 ИСПРАВЛЕНИЕ: Используем существующую функцию generateCarouselImages
    const imageBuffers = await instagramCanvasService.generateCarouselImages(
      slides,
      undefined, // используем дефолтный config
      colorTemplate
    );

    // Конвертируем Buffer[] в base64 строки для совместимости
    const carouselImages = imageBuffers.map(
      buffer => `data:image/png;base64,${buffer.toString('base64')}`
    );

    console.log(
      `✅ Генерация завершена: ${carouselImages.length} карточек создано`
    );

    return {
      success: true,
      query,
      carouselCards: carouselCards.slice(0, carouselImages.length),
      carouselImages,
      searchStats: hybridResult.searchStats,
      message: `Создана карусель из ${carouselImages.length} карточек по теме "${query}"`,
    };
  } catch (error) {
    console.error('💥 Ошибка быстрой генерации карусели:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      query,
    };
  }
}

/**
 * 🎯 Получение эмодзи для категории
 */
function getCategoryEmoji(category: string): string {
  const categoryEmojis: Record<string, string> = {
    fundamentals: '🏛️',
    practices: '🧘‍♂️',
    tools: '🛠️',
    development: '🚀',
    analytics: '📊',
    archive: '📚',
    main_book: '📖',
    philosophy: '🕉️',
    general: '✨',
  };
  return categoryEmojis[category] || '✨';
}

/**
 * 🔄 Переиндексация векторной базы Vibecoding
 */
export async function reindexVibeCoding(): Promise<VibeCodingCommandResult> {
  try {
    logger.info('🔄 Starting VibeCoding knowledge base reindexing', {
      type: LogType.BUSINESS_LOGIC,
    });

    // Импортируем и запускаем скрипт векторизации
    const { vectorizeVibecoding } = await import(
      '../../scripts/vectorize-vibecoding'
    );

    await vectorizeVibecoding();

    return {
      success: true,
      message: `✅ VibeCoding knowledge base successfully reindexed.`,
    };
  } catch (error) {
    logger.error('Failed to reindex VibeCoding knowledge base', {
      error: error instanceof Error ? error : new Error(String(error)),
      type: LogType.ERROR,
    });

    return {
      success: false,
      error: `Reindexing failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// 🎯 Экспорт всех команд
export const vibeCodingCommands = {
  searchVibecoding,
  getVibeCodingStats,
  generateVibeCodingCarousel,
  reindexVibeCoding,
};

// 🕉️ Типы для экспорта
export type { VibeCodingSearchOptions, VibeCodingStatsResult };

// ======================== TELEGRAM BOT COMMANDS ========================

import { Context } from 'telegraf';
import { inngest } from '../inngest/client';

/**
 * 🎨 Команда для генерации VibeCoding карусели
 */
export function setupCarouselCommand(bot: any) {
  bot.command('carousel', async (ctx: Context) => {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) {
      return ctx.reply('❌ Не удалось получить ID пользователя');
    }

    const messageText = (ctx.message as any)?.text || '';
    const topic = messageText.replace('/carousel', '').trim();

    if (!topic) {
      return ctx.reply(
        '🕉️ *VibeCoding Carousel Generator*\n\n' +
          'Используй команду с темой:\n' +
          '`/carousel <тема>`\n\n' +
          'Примеры:\n' +
          '• `/carousel медитативное программирование`\n' +
          '• `/carousel cursor ai инструменты`\n' +
          '• `/carousel состояние потока в коде`',
        { parse_mode: 'Markdown' }
      );
    }

    logger.info('/carousel command received', {
      type: LogType.USER_ACTION,
      data: { text: messageText },
    });

    try {
      await inngest.send({
        name: 'app/carousel.generate.request',
        data: {
          topic,
          telegramUserId,
        },
      });

      logger.info(
        '✅ Событие на генерацию карусели УСПЕШНО отправлено в Inngest',
        {
          type: LogType.USER_ACTION,
          data: { topic, telegramUserId },
        }
      );

      await ctx.reply(
        `🧘‍♂️ *Создаю VibeCoding карусель по теме:*\n"${topic}"\n\n` +
          '⏳ Это займет 30-60 секунд...\n' +
          '🎨 Генерирую изображения в медитативном стиле\n' +
          '📚 Анализирую контент из библии VibeCoding\n\n' +
          '*Результат придет в этот чат*',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('❌ Ошибка при отправке события в Inngest', {
        type: LogType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      await ctx.reply(
        '❌ Произошла ошибка при создании карусели.\n' +
          'Попробуйте еще раз или обратитесь к администратору.'
      );
    }
  });
}

/**
 * 🔍 Команда для глубокого исследования тем VibeCoding
 */
export function setupResearchCommand(bot: any) {
  bot.command('research', async (ctx: Context) => {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) {
      return ctx.reply('❌ Не удалось получить ID пользователя');
    }

    const messageText = (ctx.message as any)?.text || '';
    const topic = messageText.replace('/research', '').trim();

    if (!topic) {
      return ctx.reply(
        '🕉️ *VibeCoding Research Agent*\n\n' +
          'Глубокое исследование тем VibeCoding с веб-поиском и AI-анализом\n\n' +
          'Используй команду с темой:\n' +
          '`/research <тема>`\n\n' +
          'Примеры:\n' +
          '• `/research медитативное программирование`\n' +
          '• `/research AI инструменты 2025`\n' +
          '• `/research состояние потока в разработке`\n' +
          '• `/research cursor ai лучшие практики`\n\n' +
          '*Agent выполнит веб-поиск, проанализирует данные и даст структурированный ответ*',
        { parse_mode: 'Markdown' }
      );
    }

    logger.info('/research command received', {
      type: LogType.USER_ACTION,
      data: { text: messageText },
    });

    try {
      await inngest.send({
        name: 'app/research.request',
        data: {
          topic,
          telegramUserId,
          depth: 'detailed',
        },
      });

      logger.info('✅ Событие на исследование УСПЕШНО отправлено в Inngest', {
        type: LogType.USER_ACTION,
        data: { topic, telegramUserId },
      });

      await ctx.reply(
        `🤖 *VibeCoding Research Agent активирован*\n\n` +
          `📊 Исследую тему: "${topic}"\n\n` +
          '🔍 Выполняю веб-поиск актуальной информации...\n' +
          '🧠 Анализирую данные через призму VibeCoding...\n' +
          '📝 Готовлю структурированный отчет...\n\n' +
          '⏳ *Результат придет через 30-60 секунд*',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('❌ Ошибка при отправке события исследования в Inngest', {
        type: LogType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      await ctx.reply(
        '❌ Произошла ошибка при запуске исследования.\n' +
          'Попробуйте еще раз или обратитесь к администратору.'
      );
    }
  });
}

/**
 * 💡 Команда для быстрых вопросов VibeCoding
 */
export function setupAskCommand(bot: any) {
  bot.command('ask', async (ctx: Context) => {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) {
      return ctx.reply('❌ Не удалось получить ID пользователя');
    }

    const messageText = (ctx.message as any)?.text || '';
    const question = messageText.replace('/ask', '').trim();

    if (!question) {
      return ctx.reply(
        '🕉️ *VibeCoding Wisdom*\n\n' +
          'Быстрые ответы на вопросы о VibeCoding\n\n' +
          'Используй команду с вопросом:\n' +
          '`/ask <вопрос>`\n\n' +
          'Примеры:\n' +
          '• `/ask как начать медитативное программирование?`\n' +
          '• `/ask что такое состояние потока?`\n' +
          '• `/ask как настроить Cursor AI?`\n' +
          '• `/ask преимущества осознанного кодинга`\n\n' +
          '*Для глубокого анализа используй* `/research <тема>`',
        { parse_mode: 'Markdown' }
      );
    }

    logger.info('/ask command received', {
      type: LogType.USER_ACTION,
      data: { text: messageText },
    });

    try {
      await inngest.send({
        name: 'app/question.ask',
        data: {
          question,
          telegramUserId,
        },
      });

      logger.info('✅ Событие на вопрос УСПЕШНО отправлено в Inngest', {
        type: LogType.USER_ACTION,
        data: { question, telegramUserId },
      });

      await ctx.reply(
        `🤔 *Размышляю над вопросом...*\n\n` +
          `"${question}"\n\n` +
          '⏳ *Ответ придет через несколько секунд*',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      logger.error('❌ Ошибка при отправке события вопроса в Inngest', {
        type: LogType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      await ctx.reply(
        '❌ Произошла ошибка при обработке вопроса.\n' +
          'Попробуйте еще раз или используйте `/research` для детального анализа.'
      );
    }
  });
}

export const handleSearchCommand = async (ctx: BotContext) => {
  try {
    const result = await searchVibecoding({
      query: ctx.message.text.replace('/search', '').trim(),
      searchType: 'hybrid',
      limit: 10,
      generateCarousel: true,
    });

    if (!result.carouselImages || result.carouselImages.length === 0) {
      await ctx.reply('Не удалось сгенерировать карусель. Попробуйте еще раз');
      return;
    }

    return handleSendCarousel(ctx, result.carouselImages);
  } catch (error) {
    logger.error('Ошибка при поиске Vibecoding', { error });
    await ctx.reply('Произошла ошибка при поиске. Попробуйте еще раз');
    return;
  }
};

export const handleReindexCommand = async (ctx: BotContext) => {
  try {
    const result = await reindexVibeCoding();

    if (!result.success) {
      await ctx.reply('Произошла ошибка при реиндексации. Попробуйте еще раз');
      return;
    }

    await ctx.reply(result.message);
  } catch (error) {
    logger.error('Ошибка при реиндексации Vibecoding', { error });
    await ctx.reply('Произошла ошибка при реиндексации. Попробуйте еще раз');
    return;
  }
};

export const handleVibecodingSystemTestCommand = async (ctx: BotContext) => {
  try {
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
};

const vectorService = new VibeCodingVectorService();

const reindexVibeCoding = async () => {
  await vectorService.reindexVibecoding();
  return { success: true, message: 'Реиндексация успешно завершена' };
};

export const handleVibecodingCommand = async (ctx: BotContext) => {
  try {
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
};
