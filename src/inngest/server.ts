/**
 * Inngest Server Setup
 *
 * Настройка HTTP сервера для обработки Inngest функций
 * с поддержкой кастомных портов.
 */

import { serve } from 'inngest/node';
import { inngest } from './client';
import { functions } from './functions';
import { INNGEST_PORTS, getInngestUrls } from './client';

/**
 * Конфигурация Inngest сервера
 */
export const inngestConfig = {
  client: inngest,
  functions,

  // Настройки для development
  serve: {
    path: '/api/inngest',
    signingKey: process.env.INNGEST_SIGNING_KEY,

    // Настройки для локальной разработки
    landingPage: process.env.NODE_ENV === 'development',

    // Кастомные заголовки для CORS если нужно
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
};

/**
 * Создание HTTP обработчика для Inngest
 */
export const inngestHandler = serve(inngestConfig);

/**
 * Функция для запуска автономного Inngest сервера
 * (для тестирования и development)
 */
export const startInngestServer = async (
  port: number = 3001
): Promise<void> => {
  try {
    // Динамический импорт express с проверкой доступности
    // @ts-ignore - Опциональная зависимость
    const express = await import('express').catch(() => null);

    if (!express) {
      throw new Error(
        'Express не установлен. Установите его: npm install express @types/express'
      );
    }

    const app = express.default();

    // Middleware для логирования
    app.use((req: any, _res: any, next: any) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });

    // Health check endpoint
    app.get('/health', (_req: any, res: any) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        inngestPorts: INNGEST_PORTS,
        urls: getInngestUrls(),
      });
    });

    // Inngest обработчик
    app.use('/api/inngest', inngestHandler);

    // Информационная страница
    app.get('/', (_req: any, res: any) => {
      const urls = getInngestUrls();
      res.json({
        message: 'Bible VibeCoder Inngest Server',
        status: 'running',
        endpoints: {
          inngest: '/api/inngest',
          health: '/health',
        },
        inngestDashboard: urls.dashboard,
        functions: functions.map(fn => fn.id),
      });
    });

    return new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`🕉️ Inngest Server запущен на порту ${port}`);
        console.log(`📊 Dashboard: ${getInngestUrls().dashboard}`);
        console.log(`🔗 Endpoint: http://localhost:${port}/api/inngest`);
        resolve();
      });

      server.on('error', reject);
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Неизвестная ошибка при запуске Inngest сервера');
  }
};

/**
 * Экспорт для использования в других файлах
 */
export { inngest, functions, INNGEST_PORTS, getInngestUrls };

/**
 * Экспорт по умолчанию
 */
export default inngestHandler;
