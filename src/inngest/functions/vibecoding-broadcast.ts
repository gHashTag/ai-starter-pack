/**
 * Inngest Function: VibeCoding Automatic Broadcast
 *
 * Автоматическая функция для почасовой рассылки полезных карусельных знаний
 * из Библии VibeCoding всем зарегистрированным пользователям бота.
 *
 * Workflow:
 * 1. Срабатывает по cron расписанию каждый час
 * 2. Получает список активных пользователей с включенными уведомлениями
 * 3. Генерирует случайную/релевантную тему из векторной базы VibeCoding
 * 4. Создает красивую карусель с полезными знаниями
 * 5. Рассылает карусель всем пользователям
 */

import { inngest } from '../client';
import { bot } from '../../bot';
import { db } from '../../db';
import { users, userSettings } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { VibeCodingVectorService } from '../../services/vibecoding-vector.service';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../../services/instagram-canvas.service';
import { logger, LogType } from '../../utils/logger';
import type { InputMediaPhoto } from 'telegraf/types';
import type { CarouselSlide } from '../../types';

const vectorService = new VibeCodingVectorService();
const canvasService = new InstagramCanvasService();

/**
 * 📅 Тематические рубрики для каждого дня недели
 * Каждый день - своя уникальная тема из VibeCoding книжки
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
 * 🎭 Fallback контент высокого качества для каждой темы дня
 */
function getFallbackContent(theme: any) {
  const fallbackContentMap: Record<string, { title: string; content: string }> =
    {
      'Основы и Философия VibeCoding': {
        title: '🧘‍♂️ Философия VibeCoding',
        content: `# Путь VibeCoder'а

VibeCoding — это не просто подход к программированию, это **медитативная практика создания кода**.

## 🌱 Основные принципы:

**💫 Состояние потока** - Войди в медитативное состояние перед кодингом. Отключи уведомления, настрой среду, дыши глубоко.

**🎯 Осознанное программирование** - Каждая строка кода должна быть написана с полным пониманием её цели и места в архитектуре.

**⚡ Качество важнее скорости** - Лучше написать 10 строк качественного кода, чем 100 строк хаоса.

VibeCoding — это путь к гармонии между разумом и кодом.`,
      },
      'Cursor AI и Инструменты': {
        title: '🛠️ Мастерство Cursor AI',
        content: `# Cursor AI — Твой Цифровой Напарник

Cursor AI превращает процесс программирования в **интуитивный диалог с кодом**.

## 🚀 Ключевые возможности:

**💬 Контекстный AI** - Cursor понимает всю твою кодовую базу и предлагает решения с учётом архитектуры.

**⚡ Быстрое редактирование** - Нажми Cmd+K и опиши что нужно изменить. AI сделает это за секунды.

С Cursor AI ты не просто пишешь код — ты **творишь цифровые решения**.`,
      },
      'Медитативные Практики и Flow': {
        title: '🧘‍♂️ Медитативное Программирование',
        content: `# Войди в Состояние Потока

Медитативное программирование — это **искусство быть полностью присутствующим в коде**.

## 🌸 Практики для Flow:

**🌅 Утренний ритуал** - Начинай день с 5-минутной медитации. Настрой намерение на качественный код.

**⏰ Техника Pomodoro** - 25 минут глубокой концентрации, 5 минут отдыха. Повторяй циклы.

Помни: **лучший код рождается в состоянии внутреннего покоя**.`,
      },
      'Мифы и Реальность VibeCoding': {
        title: '🕉️ Мифы о VibeCoding',
        content: `# Развенчиваем Мифы

VibeCoding окружён множеством **заблуждений и стереотипов**.

## ✨ Истинная суть:

VibeCoding — это **философия качества** в программировании. Это не про скорость, а про **устойчивость и элегантность решений**.

Помни: **мастерство не в том, чтобы писать код быстро, а в том, чтобы писать его правильно**.`,
      },
    };

  return (
    fallbackContentMap[theme.name] || {
      title: '🧘‍♂️ VibeCoding Мудрость',
      content: `# Путь VibeCoder'а

VibeCoding — это медитативная практика создания качественного кода.

## Основные принципы:
- Осознанное программирование  
- Состояние потока
- Качество важнее скорости
- Постоянное совершенствование

Создавай не просто код, а цифровую гармонию.`,
    }
  );
}

/**
 * 🎲 Получает тему дня или случайную тему
 */
function getDailyTheme() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = воскресенье, 1 = понедельник, etc.

  const theme =
    DAILY_VIBECODING_THEMES[dayOfWeek as keyof typeof DAILY_VIBECODING_THEMES];

  logger.info(`📅 Выбрана тема дня: ${theme.name}`, {
    type: LogType.BUSINESS_LOGIC,
    data: {
      dayOfWeek,
      themeName: theme.name,
      categories: theme.categories,
      query: theme.query,
    },
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
  const lines = content.split('\n').filter(line => line.trim());
  const slides: CarouselSlide[] = [];

  // Слайд 1: Заголовок
  slides.push({
    order: 1,
    type: 'title',
    title: `🧘‍♂️ ${title}`,
    content: 'Путь к осознанному программированию через VibeCoding',
  });

  // Разбиваем контент на блоки
  let currentSlideContent = '';
  let slideCount = 2;

  for (const line of lines) {
    // Если строка начинается с заголовка или пустая, создаем новый слайд
    if (
      line.startsWith('#') ||
      line.startsWith('##') ||
      line.startsWith('###')
    ) {
      if (currentSlideContent.trim()) {
        slides.push({
          order: slideCount++,
          type: 'principle',
          title:
            currentSlideContent.split('\n')[0] ||
            `💡 Принцип ${slideCount - 2}`,
          content:
            currentSlideContent.slice(currentSlideContent.indexOf('\n') + 1) ||
            line,
        });
        currentSlideContent = '';
      }
      currentSlideContent = line.replace(/^#+\s*/, '') + '\n';
    } else if (line.includes('**') || line.includes('*')) {
      // Ключевые моменты
      if (currentSlideContent.trim()) {
        slides.push({
          order: slideCount++,
          type: 'practice',
          title: `⚡ Практика`,
          content: currentSlideContent,
        });
        currentSlideContent = '';
      }
      currentSlideContent = line + '\n';
    } else {
      currentSlideContent += line + '\n';
    }

    // Ограничиваем до 4 слайдов максимум
    if (slideCount > 4) break;
  }

  // Добавляем последний накопленный контент
  if (currentSlideContent.trim() && slideCount <= 4) {
    slides.push({
      order: slideCount,
      type: 'summary',
      title: '🎯 Применение',
      content: currentSlideContent.trim(),
    });
  }

  return slides.slice(0, 4); // Максимум 4 слайда
}

/**
 * 🎨 Основная функция автоматической рассылки VibeCoding карусели
 */
export const vibeCodingBroadcast = inngest.createFunction(
  {
    id: 'vibecoding-broadcast',
    name: 'VibeCoding Hourly Broadcast',
    retries: 3,
  },
  {
    cron: '0 * * * *', // Each hour at :00
  },
  async ({ step }) => {
    const startTime = Date.now();

    try {
      // 🎲 Шаг 1: Получаем тему дня или случайную тему
      const theme = getDailyTheme();

      // 🔍 Шаг 2: Получаем случайный VibeCoding контент
      const randomContent = await step.run(
        'get-random-vibecoding-content',
        async () => {
          logger.info('🔍 Получаем случайный VibeCoding контент', {
            type: LogType.BUSINESS_LOGIC,
          });

          // 🔧 Используем правильный метод для поиска в векторной базе
          const searchResult = await vectorService.hybridSearch(theme.query, {
            limit: 1,
          });

          // 🎯 УМНЫЙ FALLBACK: если база пустая, используем качественный фиксированный контент
          if (
            !searchResult.combinedResults ||
            searchResult.combinedResults.length === 0
          ) {
            logger.info(
              '📦 Векторная база пустая, используем fallback контент',
              {
                type: LogType.BUSINESS_LOGIC,
                data: { theme: theme.name },
              }
            );

            // 🎭 Качественный fallback контент по темам дня
            const fallbackContent = getFallbackContent(theme);
            return {
              title: fallbackContent.title,
              content: fallbackContent.content,
              category: theme.categories[0],
              sourceFile: 'fallback',
              theme,
            };
          }

          const result = searchResult.combinedResults[0];
          return {
            title: result.title || theme.name,
            content: result.content,
            category: result.metadata?.file_category || theme.categories[0],
            sourceFile: result.sourceFile,
            theme, // 🎯 Передаем тему дня для использования в caption
          };
        }
      );

      logger.info('✅ Получен контент для рассылки', {
        type: LogType.BUSINESS_LOGIC,
        data: {
          title: randomContent.title,
          contentLength: randomContent.content.length,
        },
      });

      // 🎨 Шаг 3: Преобразуем контент в слайды
      const slides = await step.run('convert-to-slides', async () => {
        logger.info('🎨 Преобразуем контент в слайды карусели', {
          type: LogType.BUSINESS_LOGIC,
        });

        return convertVibeCodingToSlides(
          randomContent.content,
          randomContent.title
        );
      });

      // 🎨 Шаг 4: Генерируем изображения используя СУЩЕСТВУЮЩУЮ функцию
      const imageBuffers = await step.run(
        'generate-carousel-images',
        async () => {
          logger.info('🖼️ Генерируем изображения карусели', {
            type: LogType.BUSINESS_LOGIC,
            data: { slidesCount: slides.length },
          });

          // 🤍 БЕЛЫЙ ФОН с ЧЕРНЫМ ШРИФТОМ для рассылки VibeCoding
          const randomTemplate = ColorTemplate.WHITE;

          logger.info('🎨 Выбран цветовой шаблон', {
            type: LogType.BUSINESS_LOGIC,
            data: { template: randomTemplate },
          });

          // 🔧 ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩУЮ ФУНКЦИЮ!
          return await canvasService.generateCarouselImages(
            slides,
            undefined,
            randomTemplate
          );
        }
      );

      logger.info('✅ Изображения карусели сгенерированы', {
        type: LogType.BUSINESS_LOGIC,
        data: { imagesCount: imageBuffers.length },
      });

      // 🔍 Шаг 5: Получаем активных пользователей
      const activeUsers = await step.run('fetch-active-users', async () => {
        logger.info('👥 Получаем активных пользователей', {
          type: LogType.BUSINESS_LOGIC,
        });

        if (!db) {
          throw new Error('Database connection not available');
        }

        const usersWithSettings = await db
          .select({
            telegram_id: users.telegram_id,
            username: users.username,
            first_name: users.first_name,
            language_code: users.language_code,
            notifications_enabled: userSettings.notifications_enabled,
          })
          .from(users)
          .leftJoin(userSettings, eq(users.id, userSettings.user_id))
          .where(
            and(
              sql`${users.telegram_id} IS NOT NULL`,
              sql`(${userSettings.notifications_enabled} IS NULL OR ${userSettings.notifications_enabled} = true)`
            )
          );

        logger.info(
          `📱 Найдено ${usersWithSettings.length} активных пользователей`,
          {
            type: LogType.BUSINESS_LOGIC,
            data: { count: usersWithSettings.length },
          }
        );

        return usersWithSettings;
      });

      if (activeUsers.length === 0) {
        logger.info('🤷‍♂️ Нет активных пользователей для рассылки', {
          type: LogType.BUSINESS_LOGIC,
        });
        return { success: true, message: 'No active users found' };
      }

      // 📤 Шаг 6: Отправляем карусель пользователям
      const broadcastResults = await step.run('send-to-users', async () => {
        logger.info('📤 Начинаем рассылку карусели', {
          type: LogType.BUSINESS_LOGIC,
          data: { totalUsers: activeUsers.length },
        });

        let successCount = 0;
        let errorCount = 0;

        // Подготавливаем медиа группу
        const mediaGroup: InputMediaPhoto[] = imageBuffers.map(
          (buffer, index) => {
            // 🔧 Обеспечиваем правильный формат Buffer для Telegram API
            const imageBuffer = Buffer.isBuffer(buffer)
              ? buffer
              : Buffer.from((buffer as any).data || buffer);

            return {
              type: 'photo' as const,
              media: { source: imageBuffer }, // ✅ Правильный Buffer формат
              caption:
                index === 0
                  ? `${randomContent.theme.emoji} **${randomContent.theme.name}**\n\n` +
                    `📝 ${randomContent.title}\n\n` +
                    `📚 Источник: Библия VibeCoding\n` +
                    `📅 ${new Date().toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'Europe/Moscow',
                    })}\n\n` +
                    `#VibeCoding #${randomContent.theme.name.replace(/\s+/g, '')} #МедитативноеПрограммирование`
                  : undefined,
              parse_mode: 'Markdown' as const,
            };
          }
        );

        // Отправляем батчами по 10 пользователей
        const BATCH_SIZE = 10;
        for (let i = 0; i < activeUsers.length; i += BATCH_SIZE) {
          const batch = activeUsers.slice(i, i + BATCH_SIZE);

          await Promise.allSettled(
            batch.map(async user => {
              try {
                await bot.telegram.sendMediaGroup(
                  user.telegram_id,
                  mediaGroup as any
                );
                successCount++;

                logger.info(
                  `✅ Карусель отправлена пользователю ${user.telegram_id}`,
                  {
                    type: LogType.BUSINESS_LOGIC,
                    data: {
                      telegram_id: user.telegram_id,
                      username: user.username,
                    },
                  }
                );
              } catch (error) {
                errorCount++;
                logger.error(
                  `❌ Ошибка отправки пользователю ${user.telegram_id}`,
                  {
                    type: LogType.ERROR,
                    error:
                      error instanceof Error ? error : new Error(String(error)),
                    data: {
                      telegram_id: user.telegram_id,
                      username: user.username,
                    },
                  }
                );
              }
            })
          );

          // Пауза между батчами
          if (i + BATCH_SIZE < activeUsers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        return { successCount, errorCount, totalUsers: activeUsers.length };
      });

      const executionTime = Date.now() - startTime;

      logger.info('🎉 VibeCoding рассылка завершена', {
        type: LogType.BUSINESS_LOGIC,
        data: {
          ...broadcastResults,
          executionTime: `${executionTime}ms`,
          title: randomContent.title,
        },
      });

      return {
        success: true,
        message: `Рассылка завершена: ${broadcastResults.successCount}/${broadcastResults.totalUsers} успешно`,
        stats: broadcastResults,
        executionTime,
      };
    } catch (error) {
      logger.error('❌ Ошибка в VibeCoding broadcast', {
        type: LogType.BUSINESS_LOGIC,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }
);
