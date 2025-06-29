/**
 * Inngest Client Configuration
 *
 * Настраивает Inngest клиент с возможностью использования кастомных портов
 * для избежания конфликтов с другими сервисами.
 */

import { Inngest } from 'inngest';

// Стандартные порты для Inngest Dev Server (по умолчанию)
export const INNGEST_PORTS = {
  // Основной порт для Inngest Dev Server (стандартный порт 8288)
  DEV_SERVER: process.env.INNGEST_DEV_PORT
    ? parseInt(process.env.INNGEST_DEV_PORT)
    : 8288,
  // Порт для Connect Gateway (стандартный порт 8289)
  CONNECT_GATEWAY: process.env.INNGEST_CONNECT_PORT
    ? parseInt(process.env.INNGEST_CONNECT_PORT)
    : 8289,
} as const;

/**
 * Основной Inngest клиент для приложения
 */
export const inngest = new Inngest({
  id: 'bible-vibecoder-app',
  name: 'Bible VibeCoder Application',

  // Настройки для локальной разработки
  isDev: process.env.NODE_ENV !== 'production',

  // Добавляем уникальный appId для избежания дублирования
  env: process.env.NODE_ENV || 'development',
});

/**
 * Экспорт портов для использования в скриптах запуска
 */
export { INNGEST_PORTS as ports };

/**
 * Вспомогательная функция для создания URL-адресов для Inngest
 */
export const getInngestUrls = () => ({
  devServer: `http://localhost:${INNGEST_PORTS.DEV_SERVER}`,
  connectGateway: `http://localhost:${INNGEST_PORTS.CONNECT_GATEWAY}`,
  dashboard: `http://localhost:${INNGEST_PORTS.DEV_SERVER}/dashboard`,
});

/**
 * Типы событий для Bible VibeCoder
 */
export interface BibleVibeCoderEvents {
  // Общие события
  'app/user.message': {
    data: {
      userId: string;
      messageId: string;
      chatId: string;
      text: string;
      timestamp: Date;
    };
  };

  // События карусели
  'carousel/generate.requested': {
    data: {
      userId: string;
      chatId: string;
      messageId: string;
      topic: string;
      slidesCount?: number;
      timestamp: Date;
    };
  };

  'carousel/content.analyzed': {
    data: {
      userId: string;
      requestId: string;
      topic: string;
      extractedContent: {
        title: string;
        principles: string[];
        quotes: string[];
        concepts: string[];
      };
      timestamp: Date;
    };
  };

  'carousel/slides.generated': {
    data: {
      userId: string;
      requestId: string;
      slides: Array<{
        id: string;
        type: 'title' | 'principle' | 'quote' | 'concept';
        title: string;
        content: string;
        backgroundStyle: string;
      }>;
      timestamp: Date;
    };
  };

  'carousel/images.rendered': {
    data: {
      userId: string;
      requestId: string;
      images: Array<{
        slideId: string;
        imageUrl: string;
        size: { width: number; height: number };
      }>;
      timestamp: Date;
    };
  };

  // События системы
  'system/health.check': {
    data: {
      timestamp: Date;
      source: string;
    };
  };

  'system/error.occurred': {
    data: {
      error: string;
      context: Record<string, any>;
      timestamp: Date;
    };
  };
}

/**
 * Utility функции для отправки событий
 */
export const sendEvent = {
  /**
   * Отправляет событие запроса генерации карусели
   */
  async carouselGenerateRequested(
    data: BibleVibeCoderEvents['carousel/generate.requested']['data']
  ) {
    return inngest.send({
      name: 'carousel/generate.requested',
      data,
    });
  },

  /**
   * Отправляет событие анализа контента
   */
  async carouselContentAnalyzed(
    data: BibleVibeCoderEvents['carousel/content.analyzed']['data']
  ) {
    return inngest.send({
      name: 'carousel/content.analyzed',
      data,
    });
  },

  /**
   * Отправляет событие генерации слайдов
   */
  async carouselSlidesGenerated(
    data: BibleVibeCoderEvents['carousel/slides.generated']['data']
  ) {
    return inngest.send({
      name: 'carousel/slides.generated',
      data,
    });
  },

  /**
   * Отправляет событие рендеринга изображений
   */
  async carouselImagesRendered(
    data: BibleVibeCoderEvents['carousel/images.rendered']['data']
  ) {
    return inngest.send({
      name: 'carousel/images.rendered',
      data,
    });
  },

  /**
   * Отправляет событие проверки здоровья системы
   */
  async systemHealthCheck(source: string) {
    return inngest.send({
      name: 'system/health.check',
      data: {
        timestamp: new Date(),
        source,
      },
    });
  },

  /**
   * Отправляет событие об ошибке
   */
  async systemErrorOccurred(error: string, context: Record<string, any> = {}) {
    return inngest.send({
      name: 'system.error.occurred',
      data: {
        error,
        context,
        timestamp: new Date(),
      },
    });
  },
};

/**
 * Проверка доступности портов (для использования в тестах)
 */
export const checkPortAvailability = async (port: number): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
};
