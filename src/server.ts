/**
 * HTTP Server для Bible VibeCoder
 *
 * Обеспечивает интеграцию между Telegram ботом и Inngest функциями
 * через HTTP endpoints. Сервер принимает webhook'и от Inngest и
 * обрабатывает события от Telegram бота.
 */

import { serve } from 'inngest/bun';
import { inngest } from './inngest/client';
import { functions } from './inngest/functions';
import { logger, LogType } from './utils/logger';
// import { config } from './config'; // Удален неиспользуемый импорт

/**
 * Конфигурация сервера
 */
const SERVER_CONFIG = {
  port: parseInt(
    process.env.HTTP_SERVER_PORT || process.env.PORT || '7103',
    10
  ),
  host: '0.0.0.0',
  inngestPath: '/api/inngest',
  appId: 'bible-vibecoder-app-single', // Уникальный ID для избежания дублирования
} as const;

/**
 * Создает HTTP сервер с Inngest интеграцией
 */
export async function createServer() {
  logger.info('🚀 Инициализация HTTP сервера...', { type: LogType.SYSTEM });

  try {
    // Создаем Inngest handler с уникальным ID
    const inngestHandler = serve({
      client: inngest,
      functions,
    });

    // Запуск HTTP сервера
    const server = Bun.serve({
      port: SERVER_CONFIG.port,
      hostname: SERVER_CONFIG.host,
      fetch: req => {
        const url = new URL(req.url);

        // Health check endpoint
        if (url.pathname === '/health') {
          return new Response(
            JSON.stringify({
              status: 'ok',
              timestamp: new Date().toISOString(),
              service: 'bible-vibecoder-http-server',
              port: SERVER_CONFIG.port,
              version: '1.0.0',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }

        // 🎨 Обработчик превью-изображений темплейтов
        if (url.pathname.startsWith('/preview/')) {
          const filename = url.pathname.replace('/preview/', '');
          const previewPath = `${process.cwd()}/template-previews/${filename}`;
          
          try {
            const file = Bun.file(previewPath);
            return new Response(file, {
              headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600', // Кешируем на час
              },
            });
          } catch (error) {
            return new Response('Preview not found', { status: 404 });
          }
        }

        // Направляем все запросы к /api/inngest в Inngest handler
        if (url.pathname.startsWith('/api/inngest')) {
          return inngestHandler(req);
        }

        // Для остальных запросов возвращаем 404
        return new Response('Not Found', { status: 404 });
      },
    });

    logger.info(`✅ HTTP сервер запущен`, {
      type: LogType.SYSTEM,
      data: {
        port: SERVER_CONFIG.port,
        host: SERVER_CONFIG.host,
        inngestPath: SERVER_CONFIG.inngestPath,
      },
    });

    logger.info(
      `📊 Inngest endpoint: http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}${SERVER_CONFIG.inngestPath}`,
      {
        type: LogType.SYSTEM,
      }
    );

    return {
      server,
      config: SERVER_CONFIG,
    };
  } catch (error) {
    logger.error('❌ Ошибка при запуске HTTP сервера', {
      error: error instanceof Error ? error : new Error(String(error)),
      type: LogType.ERROR,
    });
    throw error;
  }
}

/**
 * Graceful shutdown для сервера
 */
export function setupGracefulShutdown(server: any) {
  const shutdown = async (signal: string) => {
    logger.info(`📡 Получен сигнал ${signal}, останавливаем HTTP сервер...`, {
      type: LogType.SYSTEM,
    });

    try {
      // Если у сервера есть метод close, используем его
      if (server && typeof server.close === 'function') {
        await server.close();
      }

      logger.info('✅ HTTP сервер успешно остановлен', {
        type: LogType.SYSTEM,
      });
      process.exit(0);
    } catch (error) {
      logger.error('❌ Ошибка при остановке HTTP сервера', {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.ERROR,
      });
      process.exit(1);
    }
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Запуск сервера (если файл выполняется напрямую)
 */
const isEntryPoint =
  (typeof import.meta.main === 'boolean' && import.meta.main) ||
  process.argv[1]?.endsWith('server.ts') ||
  process.argv[1]?.endsWith('server.js');

if (isEntryPoint) {
  createServer()
    .then(({ server }) => {
      setupGracefulShutdown(server);
    })
    .catch(error => {
      logger.error('💥 Критическая ошибка при запуске сервера', {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.ERROR,
      });
      process.exit(1);
    });
}
