import { Context } from 'telegraf';
import { TTSService } from './tts.service.interface';
import { TTSOptions, Emotion } from './types';

/**
 * Хелпер для отправки озвученных сообщений в Telegram
 */
export class TelegramTTSHelper {
  constructor(private readonly ttsService: TTSService) {}

  /**
   * Отправляет текстовое сообщение как голосовое в Telegram
   */
  async sendVoiceMessage(
    ctx: Context,
    text: string,
    options?: TTSOptions
  ): Promise<void> {
    try {
      // Генерируем аудио
      const result = await this.ttsService.convertTextToSpeech(text, {
        format: 'ogg' as any, // Telegram предпочитает OGG
        ...options,
      });

      // Отправляем голосовое сообщение
      await ctx.replyWithVoice({
        source: result.audio,
        filename: 'voice.ogg',
      });
    } catch (error) {
      console.error('Ошибка при отправке голосового сообщения:', error);
      // Отправляем текстовое сообщение как fallback
      await ctx.reply(text);
    }
  }

  /**
   * Отправляет эмоциональное голосовое сообщение
   */
  async sendEmotionalVoiceMessage(
    ctx: Context,
    text: string,
    emotion: Emotion
  ): Promise<void> {
    return this.sendVoiceMessage(ctx, text, { emotion });
  }

  /**
   * Middleware для автоматической озвучки ответов бота
   */
  createVoiceMiddleware(options?: TTSOptions) {
    return async (ctx: Context, next: () => Promise<void>) => {
      // Сохраняем оригинальный метод reply
      const originalReply = ctx.reply.bind(ctx);

      // Перехватываем вызовы reply и добавляем голосовую версию
      ctx.reply = async (text: string, extra?: any) => {
        // Отправляем текстовое сообщение
        const textMessage = await originalReply(text, extra);

        // Если текст не слишком длинный, отправляем и голосовую версию
        if (typeof text === 'string' && text.length <= 500) {
          try {
            await this.sendVoiceMessage(ctx, text, options);
          } catch (error) {
            console.error('Не удалось отправить голосовое сообщение:', error);
          }
        }

        return textMessage;
      };

      await next();
    };
  }
}
