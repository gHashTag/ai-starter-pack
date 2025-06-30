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

        // Определяем ColorTemplate
        const style = options.carouselOptions?.style || 'vibrant';
        const styleToColorTemplate: Record<string, ColorTemplate> = {
          minimalist: ColorTemplate.WHITE,
          vibrant: ColorTemplate.ROYAL_PURPLE,
          dark: ColorTemplate.BLACK_GOLD,
          gradient: ColorTemplate.EMERALD_LUXURY,
        };
        const colorTemplate =
          styleToColorTemplate[style] || ColorTemplate.ROYAL_PURPLE;

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

    // 🔧 ИСПРАВЛЕНИЕ: Определяем ColorTemplate на основе стиля
    const styleToColorTemplate: Record<string, ColorTemplate> = {
      minimalist: ColorTemplate.WHITE,
      vibrant: ColorTemplate.ROYAL_PURPLE,
      dark: ColorTemplate.BLACK_GOLD,
      gradient: ColorTemplate.EMERALD_LUXURY,
    };

    const colorTemplate =
      styleToColorTemplate[style] || ColorTemplate.ROYAL_PURPLE;

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
