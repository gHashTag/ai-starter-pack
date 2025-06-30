import { Telegraf } from 'telegraf';
import { CustomContext } from './bot';
import { logger, LogType } from './utils/logger';
import { inngest } from './inngest/client';

/**
 * Определяет среду выполнения бота
 */
function getEnvironmentInfo() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailway =
    process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_NAME;
  const port = process.env.PORT || '7100';

  if (isRailway) {
    return {
      env: 'production',
      platform: 'Railway',
      indicator: '☁️ Railway Cloud',
      details: `Environment: ${
        process.env.RAILWAY_ENVIRONMENT_NAME || 'production'
      }`,
    };
  } else if (isProduction) {
    return {
      env: 'production',
      platform: 'Unknown Cloud',
      indicator: '🌐 Production',
      details: `Port: ${port}`,
    };
  } else {
    return {
      env: 'development',
      platform: 'Local',
      indicator: '🏠 Local Development',
      details: `Port: ${port}, PID: ${process.pid}`,
    };
  }
}

export const setupCommands = (bot: Telegraf<CustomContext>): void => {
  // Команда /start
  bot.start(async ctx => {
    logger.info('/start command handled by commands.ts', {
      type: LogType.USER_ACTION,
      userId: ctx.from?.id,
    });

    const userFirstName =
      ctx.session?.user?.first_name || ctx.from?.first_name || 'незнакомец';

    const envInfo = getEnvironmentInfo();

    await ctx.reply(
      `🚀 Привет, ${userFirstName}! Я - **Bible VibeCoder Bot**\n\n` +
        `🎨 Создаю Instagram карусели из документации VIBECODING\n` +
        `✨ Превращаю мудрость в визуальный контент\n\n` +
        `Используй /help для списка команд.\n\n` +
        `_${envInfo.indicator}_`,
      { parse_mode: 'Markdown' }
    );
  });

  // Команда /help
  bot.help(async ctx => {
    logger.info('/help command handled by commands.ts', {
      type: LogType.USER_ACTION,
      userId: ctx.from?.id,
    });

    const envInfo = getEnvironmentInfo();

    const helpMessage =
      '🤖 **Доступные команды:**\n\n' +
      '🚀 `/start` - Начальное приветствие\n' +
      '❓ `/help` - Это сообщение с помощью\n' +
      '🎨 `/carousel [тема]` - Создать Instagram карусель\n\n' +
      '**Примеры использования карусели:**\n' +
      '`/carousel медитативное программирование`\n' +
      '`/carousel состояние потока`\n' +
      '`/carousel AI инструменты 2025`\n' +
      '`/carousel принципы VIBECODING`\n\n' +
      '💡 *Бот анализирует документацию VIBECODING и создает красивые слайды для Instagram!*\n\n' +
      `_${envInfo.indicator} | ${envInfo.details}_`;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  });

  // Команда /carousel для генерации Instagram карусели
  bot.command('carousel', async ctx => {
    logger.info('/carousel command received', {
      type: LogType.USER_ACTION,
      userId: ctx.from?.id,
      data: { text: ctx.message.text },
    });

    const args = ctx.message.text.split(' ').slice(1);
    const topic = args.join(' ').trim();

    if (!topic) {
      await ctx.reply(
        '🎨 **Как пользоваться генератором карусели**\n\n' +
          'Просто укажите тему после команды. Я создам для вас 10 уникальных слайдов.\n\n' +
          '**Пример:**\n' +
          '`/carousel Квантовая физика для котов`',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const telegramUserId = ctx.from?.id;
    const messageId = ctx.message.message_id;

    if (!telegramUserId) {
      await ctx.reply('❌ Не удалось определить ваш ID пользователя.');
      return;
    }

    try {
      logger.info('Попытка отправки события в Inngest', {
        type: LogType.BUSINESS_LOGIC,
        data: {
          topic,
          telegramUserId,
          eventName: 'app/carousel.generate.request',
          inngestBaseUrl:
            process.env.NODE_ENV !== 'production'
              ? `http://localhost:8288`
              : 'production',
        },
      });

      // Отправляем событие в Inngest
      await inngest.send({
        name: 'app/carousel.generate.request',
        data: {
          topic,
          telegramUserId: String(telegramUserId),
          messageId,
        },
      });

      logger.info(
        '✅ Событие на генерацию карусели УСПЕШНО отправлено в Inngest',
        {
          type: LogType.USER_ACTION,
          data: {
            topic,
            telegramUserId,
          },
        }
      );

      // Можно отправить короткое подтверждение, но основную работу делает Inngest
      // await ctx.reply("🚀 Запрос принят! Начинаю магию...", { reply_to_message_id: messageId });
    } catch (error) {
      logger.error('Ошибка при отправке события в Inngest', {
        type: LogType.BUSINESS_LOGIC,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { topic, telegramUserId },
      });

      await ctx.reply(
        '❌ **Ошибка!** Не удалось запустить генерацию карусели. Попробуйте еще раз.',
        { parse_mode: 'Markdown', reply_parameters: { message_id: messageId } }
      );
    }
  });

  // Обработка всех текстовых сообщений
  bot.on('text', async ctx => {
    logger.info('Text message received', {
      type: LogType.USER_ACTION,
      userId: ctx.from?.id,
      data: { text: ctx.message.text },
    });

    const envInfo = getEnvironmentInfo();

    await ctx.reply(
      `👂 Я получил твоё сообщение: _"${ctx.message.text}"_\n\n` +
        `💡 **Подсказка:** Используй команды для взаимодействия:\n` +
        `• /help - список всех команд\n` +
        `• /carousel [тема] - создать карусель\n\n` +
        `_${envInfo.indicator}_`,
      { parse_mode: 'Markdown' }
    );
  });

  const envInfo = getEnvironmentInfo();
  logger.info(
    `✅ Commands successfully registered: /start, /help, /carousel, text handler | ${envInfo.platform}`,
    {
      type: LogType.SYSTEM,
      data: { environment: envInfo },
    }
  );
};
