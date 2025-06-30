/**
 * Inngest Function: Generate Instagram Carousel
 *
 * Основная функция для генерации Instagram карусели из VIBECODING документации.
 * Обрабатывает полный workflow: анализ контента → генерация слайдов → рендеринг → отправка.
 */

import { inngest } from '../client';
import { bot } from '../../bot';
import { CarouselContentGeneratorService } from '../../services/carousel-content-generator.service';
import { VibeCodingContentService } from '../../services/vibecoding-content.service';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../../services/instagram-canvas.service';
import { logger, LogType } from '../../utils/logger';
import { InputMediaPhoto } from 'telegraf/types';
import { promises as fs, createReadStream } from 'fs';
// import path from "path"; // не используется

const contentGenerator = new CarouselContentGeneratorService();
const vibeContentService = new VibeCodingContentService();
const canvasService = new InstagramCanvasService();

/**
 * Типы для workflow генерации карусели
 */
export interface CarouselGenerationContext {
  userId: string;
  chatId: string;
  messageId: string;
  topic: string;
  slidesCount: number;
  requestId: string;
  startTime: Date;
}

export interface CarouselSlide {
  id: string;
  type: 'title' | 'principle' | 'quote' | 'practice' | 'summary';
  title: string;
  content: string;
  backgroundStyle: string;
  order: number;
}

export interface ExtractedContent {
  title: string;
  principles: string[];
  quotes: string[];
  concepts: string[];
}

interface GenerateCarouselPayload {
  topic: string;
  telegramUserId: string;
  messageId: number;
  colorTemplate?: ColorTemplate;
}

/**
 * 🎨 ГЛАВНАЯ INNGEST ФУНКЦИЯ: Полный цикл создания карусели
 *
 * Этапы:
 * 1. 📝 Анализ темы и создание сценария
 * 2. ✍️  Генерация текстов для слайдов
 * 3. 🎨 Создание изображений с выбранным цветовым темплейтом
 * 4. 📱 Отправка пользователю
 *
 * С пошаговой коммуникацией на каждом этапе!
 */
export const generateCarousel = inngest.createFunction(
  { id: 'generate-carousel-from-topic', name: 'Generate Carousel from Topic' },
  { event: 'app/carousel.generate.request' },
  async ({ event, step }) => {
    const {
      topic,
      telegramUserId,
      messageId,
      colorTemplate = ColorTemplate.GALAXY_SPIRAL_BLUR,
    } = event.data as GenerateCarouselPayload;

    // 🎨 Получаем информацию о выбранном темплейте
    const templates = InstagramCanvasService.getColorTemplates();
    const selectedTemplate = templates[colorTemplate];

    // 🔑 Проверяем переменные окружения
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      logger.error(
        '❌ BOT_TOKEN не найден в переменных окружения Inngest функции',
        {
          type: LogType.BUSINESS_LOGIC,
          data: { topic, telegramUserId, colorTemplate },
        }
      );
      throw new Error('BOT_TOKEN не настроен для Inngest функции');
    }

    let statusMessageId: number | null = null;

    try {
      // 🎯 ШАГ 1: Уведомляем о начале работы с указанием выбранного стиля
      const statusMessage = await step.run('notify-start', async () => {
        return bot.telegram.sendMessage(
          telegramUserId,
          `🎨 **Создаю карусель на тему:** "${topic}"\n` +
            `🎨 **Стиль:** ${selectedTemplate.emoji} ${selectedTemplate.name}\n\n` +
            `📋 **План работы:**\n` +
            `1️⃣ Анализирую тему и создаю сценарий\n` +
            `2️⃣ Генерирую тексты для слайдов\n` +
            `3️⃣ Создаю красивые изображения в выбранном стиле\n` +
            `4️⃣ Отправляю готовую карусель\n\n` +
            `⏳ Начинаю работу...`,
          {
            parse_mode: 'Markdown',
            reply_parameters: { message_id: messageId },
          }
        );
      });
      statusMessageId = statusMessage.message_id;

      // 🎯 ШАГ 2: Анализируем тему и создаем сценарий
      await step.run('update-status-analyzing', async () => {
        return bot.telegram.editMessageText(
          telegramUserId,
          statusMessageId!,
          undefined,
          `🎨 **Создаю карусель на тему:** "${topic}"\n` +
            `🎨 **Стиль:** ${selectedTemplate.emoji} ${selectedTemplate.name}\n\n` +
            `📋 **План работы:**\n` +
            `✅ Анализирую тему и создаю сценарий\n` +
            `2️⃣ Генерирую тексты для слайдов\n` +
            `3️⃣ Создаю красивые изображения в выбранном стиле\n` +
            `4️⃣ Отправляю готовую карусель\n\n` +
            `🔍 Анализирую тему и создаю сценарий...`,
          { parse_mode: 'Markdown' }
        );
      });

      // 🎯 ШАГ 3: Генерируем контент слайдов
      const slides = await step.run('generate-slide-content', async () => {
        return contentGenerator.generateCarouselSlides(topic);
      });

      if (!slides || slides.length === 0) {
        throw new Error('Не удалось сгенерировать контент для слайдов.');
      }

      // 🎯 ШАГ 4: Уведомляем о генерации текстов
      await step.run('update-status-texts', async () => {
        return bot.telegram.editMessageText(
          telegramUserId,
          statusMessageId!,
          undefined,
          `🎨 **Создаю карусель на тему:** "${topic}"\n` +
            `🎨 **Стиль:** ${selectedTemplate.emoji} ${selectedTemplate.name}\n\n` +
            `📋 **План работы:**\n` +
            `✅ Анализирую тему и создаю сценарий\n` +
            `✅ Генерирую тексты для слайдов (${slides.length} слайдов)\n` +
            `3️⃣ Создаю красивые изображения в выбранном стиле\n` +
            `4️⃣ Отправляю готовую карусель\n\n` +
            `🎨 Создаю красивые изображения в стиле "${selectedTemplate.name}"...`,
          { parse_mode: 'Markdown' }
        );
      });

      // 🎯 ШАГ 5: Генерируем изображения с выбранным цветовым темплейтом
      const imagePaths = await step.run('generate-slide-images', async () => {
        return canvasService.generateCarouselImageFiles(
          slides,
          undefined,
          colorTemplate
        );
      });

      // 🎯 ШАГ 6: Уведомляем о готовности к отправке
      await step.run('update-status-sending', async () => {
        return bot.telegram.editMessageText(
          telegramUserId,
          statusMessageId!,
          undefined,
          `🎨 **Создаю карусель на тему:** "${topic}"\n` +
            `🎨 **Стиль:** ${selectedTemplate.emoji} ${selectedTemplate.name}\n\n` +
            `📋 **План работы:**\n` +
            `✅ Анализирую тему и создаю сценарий\n` +
            `✅ Генерирую тексты для слайдов (${slides.length} слайдов)\n` +
            `✅ Создаю красивые изображения (${imagePaths.length} изображений)\n` +
            `4️⃣ Отправляю готовую карусель\n\n` +
            `📤 Отправляю карусель в стиле "${selectedTemplate.name}"...`,
          { parse_mode: 'Markdown' }
        );
      });

      // 🎯 ШАГ 7: Дополнительная проверка файлов перед отправкой
      await step.run('verify-files-exist', async () => {
        const fs = await import('fs/promises');
        for (const imagePath of imagePaths) {
          try {
            await fs.access(imagePath);
            const stats = await fs.stat(imagePath);
            if (stats.size === 0) {
              throw new Error(`Файл ${imagePath} пустой!`);
            }
            logger.info(
              `✅ Файл проверен перед отправкой: ${imagePath} (${stats.size} bytes)`,
              {
                type: LogType.BUSINESS_LOGIC,
              }
            );
          } catch (error) {
            logger.error(`❌ Файл недоступен для отправки: ${imagePath}`, {
              type: LogType.BUSINESS_LOGIC,
              error: error instanceof Error ? error : new Error(String(error)),
            });
            throw new Error(`Файл изображения недоступен: ${imagePath}`);
          }
        }
        return { verified: imagePaths.length };
      });

      // 🎯 ШАГ 8: Создаем медиа-группу и отправляем
      const mediaGroup: InputMediaPhoto[] = imagePaths.map(
        (imagePath, index) => ({
          type: 'photo',
          media: { source: createReadStream(imagePath) }, // Правильный способ для Telegram API
          caption:
            index === 0
              ? `🎨 **Карусель на тему:** "${topic}"\n\n` +
                `📊 **Содержание:**\n` +
                slides
                  .map((slide, i) => `${i + 1}. ${slide.title}`)
                  .join('\n') +
                `\n\n💡 Создано с помощью @bible_vibecoder_bot`
              : undefined,
          parse_mode: index === 0 ? 'Markdown' : undefined,
        })
      );

      await step.run('send-media-group', async () => {
        return bot.telegram.sendMediaGroup(telegramUserId, mediaGroup, {
          reply_parameters: { message_id: messageId },
        });
      });

      // 🎯 ШАГ 9: Генерируем Instagram-ready текст с веб-исследованием
      const instagramText = await step.run(
        'generate-instagram-text',
        async () => {
          return await vibeContentService.generateInstagramPost(topic, slides);
        }
      );

      // 🎯 ШАГ 10: Отправляем готовый текст для Instagram
      await step.run('send-instagram-text', async () => {
        return bot.telegram.sendMessage(
          telegramUserId,
          `📱 **ГОТОВЫЙ ТЕКСТ ДЛЯ INSTAGRAM:**\n\n` +
            `📋 *Скопируй и вставь этот текст в Instagram:*\n\n` +
            `\`\`\`\n${instagramText}\n\`\`\`\n\n` +
            `💡 **Как использовать:**\n` +
            `1️⃣ Скопируй текст выше\n` +
            `2️⃣ Сохрани изображения карусели\n` +
            `3️⃣ Создай пост в Instagram\n` +
            `4️⃣ Вставь скопированный текст\n` +
            `5️⃣ Добавь изображения карусели\n` +
            `6️⃣ Публикуй! 🚀`,
          {
            parse_mode: 'Markdown',
            reply_parameters: { message_id: messageId },
          }
        );
      });

      // 🎯 ШАГ 11: Финальное уведомление об успехе
      await step.run('notify-success', async () => {
        return bot.telegram.editMessageText(
          telegramUserId,
          statusMessageId!,
          undefined,
          `🎨 **Карусель готова!** ✨\n\n` +
            `📋 **Результат:**\n` +
            `✅ Тема проанализирована\n` +
            `✅ Создано ${slides.length} слайдов\n` +
            `✅ Сгенерировано ${imagePaths.length} изображений\n` +
            `✅ Карусель отправлена\n` +
            `✅ Готовый текст для Instagram создан\n\n` +
            `🎉 Карусель на тему "${topic}" готова!\n` +
            `📱 Текст для Instagram отправлен отдельным сообщением\n` +
            `💡 Для создания новой карусели используйте /carousel`,
          { parse_mode: 'Markdown' }
        );
      });

      // 🎯 ШАГ 12: Очистка временных файлов
      await step.run('cleanup-images', async () => {
        const cleanupPromises = imagePaths.map(p =>
          fs.unlink(p).catch(err =>
            logger.warn(`Не удалось удалить файл: ${p}`, {
              type: LogType.EXTERNAL_SERVICE,
              error: err,
            })
          )
        );
        await Promise.all(cleanupPromises);
        return { success: true };
      });

      logger.info('🎉 Карусель успешно создана и отправлена', {
        type: LogType.BUSINESS_LOGIC,
        data: {
          topic,
          telegramUserId,
          slidesCount: slides.length,
          imagesCount: imagePaths.length,
        },
      });

      return {
        success: true,
        topic,
        slidesCount: slides.length,
        imagesCount: imagePaths.length,
      };
    } catch (error) {
      logger.error('❌ Ошибка в создании карусели', {
        type: LogType.BUSINESS_LOGIC,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { topic, telegramUserId },
      });

      // Уведомляем об ошибке
      await step.run('notify-error', async () => {
        const errorMessage =
          `❌ **Ошибка при создании карусели**\n\n` +
          `🎯 **Тема:** "${topic}"\n` +
          `💥 **Проблема:** ${error instanceof Error ? error.message : 'Неизвестная ошибка'}\n\n` +
          `🔄 **Что делать:**\n` +
          `• Попробуйте другую тему\n` +
          `• Или повторите попытку через минуту\n` +
          `• Используйте команду /carousel для нового запроса`;

        if (statusMessageId) {
          // Обновляем существующее сообщение
          return bot.telegram.editMessageText(
            telegramUserId,
            statusMessageId,
            undefined,
            errorMessage,
            { parse_mode: 'Markdown' }
          );
        } else {
          // Отправляем новое сообщение
          return bot.telegram.sendMessage(telegramUserId, errorMessage, {
            parse_mode: 'Markdown',
            reply_parameters: { message_id: messageId },
          });
        }
      });

      throw error;
    }
  }
);

/**
 * Типы событий для карусели
 */
export const CAROUSEL_EVENTS = {
  GENERATE_REQUESTED: 'carousel/generate.requested',
  CONTENT_ANALYZED: 'carousel/content.analyzed',
  SLIDES_GENERATED: 'carousel/slides.generated',
  IMAGES_RENDERED: 'carousel/images.rendered',
  GENERATE_CANCELLED: 'carousel/generate.cancelled',
} as const;

/**
 * Utility функция для отправки запроса на генерацию
 */
export async function requestCarouselGeneration(data: {
  userId: string;
  chatId: string;
  messageId: string;
  topic: string;
  slidesCount?: number;
}) {
  return inngest.send({
    name: CAROUSEL_EVENTS.GENERATE_REQUESTED,
    data: {
      ...data,
      timestamp: new Date(),
    },
  });
}

export default generateCarousel;
