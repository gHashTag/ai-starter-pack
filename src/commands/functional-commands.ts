// 🕉️ Functional Commands - Pure Event Handlers
// 🚫 NO CLASSES, NO MUTATIONS, PURE COMPOSITION

import { Context } from 'telegraf';
import { logger, LogType } from '../utils/logger.js';
import { inngest } from '../inngest/client.js';

// 📋 Pure Types
export type CommandContext = Context & {
  storage?: any; // Will be injected by middleware
  session?: any;
};

export type CommandHandler = (ctx: CommandContext) => Promise<void>;

export type BotEnvironment = {
  readonly env: 'development' | 'production';
  readonly platform: string;
  readonly indicator: string;
  readonly details: string;
};

// 🌱 Pure Environment Detection
export const detectEnvironment = (): BotEnvironment => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailway =
    process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_NAME;
  const port = process.env.PORT || '7100';

  if (isRailway) {
    return {
      env: 'production',
      platform: 'Railway',
      indicator: '☁️ Railway Cloud',
      details: `Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME || 'production'}`,
    };
  }

  if (isProduction) {
    return {
      env: 'production',
      platform: 'Unknown Cloud',
      indicator: '🌐 Production',
      details: `Port: ${port}`,
    };
  }

  return {
    env: 'development',
    platform: 'Local',
    indicator: '🏠 Local Development',
    details: `Port: ${port}, PID: ${process.pid}`,
  };
};

// 🎯 Pure Message Builders
export const buildWelcomeMessage = (
  userFirstName: string,
  environment: BotEnvironment
): string => {
  return (
    `🚀 Привет, ${userFirstName}! Я - **Bible VibeCoder Bot**\n\n` +
    `🎨 Создаю Instagram карусели из документации VIBECODING\n` +
    `✨ Превращаю мудрость в визуальный контент\n\n` +
    `Используй /help для списка команд.\n\n` +
    `_${environment.indicator}_`
  );
};

export const buildHelpMessage = (environment: BotEnvironment): string => {
  return (
    '🤖 **Доступные команды:**\n\n' +
    '🚀 `/start` - Начальное приветствие\n' +
    '❓ `/help` - Это сообщение с помощью\n' +
    '🎨 `/carousel [тема]` - Создать Instagram карусель\n' +
    '🧘‍♂️ `/wisdom` - Получить мудрость дня\n' +
    '⚡ `/quick` - Быстрый старт проекта\n\n' +
    '**Примеры использования карусели:**\n' +
    '`/carousel медитативное программирование`\n' +
    '`/carousel состояние потока`\n' +
    '`/carousel AI инструменты 2025`\n' +
    '`/carousel принципы VIBECODING`\n\n' +
    '💡 *Бот анализирует документацию VIBECODING и создает красивые слайды для Instagram!*\n\n' +
    `_${environment.indicator} | ${environment.details}_`
  );
};

export const buildTextResponse = (
  text: string,
  environment: BotEnvironment
): string => {
  return (
    `👂 Я получил твоё сообщение: _"${text}"_\n\n` +
    `💡 **Подсказка:** Используй команды для взаимодействия:\n` +
    `• /help - список всех команд\n` +
    `• /carousel [тема] - создать карусель\n` +
    `• /wisdom - получить мудрость\n` +
    `• /quick - быстрый старт\n\n` +
    `_${environment.indicator}_`
  );
};

// 🕉️ Sacred Wisdom Arrays (Pure Data)
export const SACRED_WISDOM = [
  '🕉️ तत्त्वमसि - Ты есть То (Tat tvam asi)',
  '🕉️ सत्यमेव जयते - Истина побеждает (Satyameva jayate)',
  '🕉️ अहिंसा परमो धर्मः - Ненасилие - высшая дхарма (Ahimsa paramo dharma)',
  '🕉️ सर्वं खल्विदं ब्रह्म - Всё есть Брахман (Sarvam khalvidam brahma)',
  '🕉️ अहं ब्रह्मास्मि - Я есть Брахман (Aham Brahmasmi)',
  '🕉️ योगः कर्मसु कौशलम् - Йога есть искусность в действии (Yogah karmasu kaushalam)',
  '🕉️ प्रज्ञानं ब्रह्म - Сознание есть Брахман (Prajnanam brahma)',
] as const;

// ✨ Pure Wisdom Selector
export const getRandomWisdom = (): string => {
  const randomIndex = Math.floor(Math.random() * SACRED_WISDOM.length);
  return SACRED_WISDOM[randomIndex];
};

export const getDailyWisdom = (): string => {
  const today = new Date().getDate();
  const index = today % SACRED_WISDOM.length;
  return SACRED_WISDOM[index];
};

// 🎯 Pure Command Handlers
export const handleStart: CommandHandler = async ctx => {
  logger.info('/start command handled by functional-commands.ts', {
    type: LogType.USER_ACTION,
    userId: ctx.from?.id,
  });

  const userFirstName =
    ctx.session?.user?.first_name || ctx.from?.first_name || 'незнакомец';

  const environment = detectEnvironment();
  const message = buildWelcomeMessage(userFirstName, environment);

  await ctx.reply(message, { parse_mode: 'Markdown' });
};

export const handleHelp: CommandHandler = async ctx => {
  logger.info('/help command handled by functional-commands.ts', {
    type: LogType.USER_ACTION,
    userId: ctx.from?.id,
  });

  const environment = detectEnvironment();
  const message = buildHelpMessage(environment);

  await ctx.reply(message, { parse_mode: 'Markdown' });
};

export const handleWisdom: CommandHandler = async ctx => {
  logger.info('/wisdom command handled by functional-commands.ts', {
    type: LogType.USER_ACTION,
    userId: ctx.from?.id,
  });

  const wisdom = getDailyWisdom();
  const environment = detectEnvironment();

  await ctx.reply(
    `🧘‍♂️ **Мудрость дня:**\n\n${wisdom}\n\n` +
      `*Да пребудет с тобой покой и осознание* 🙏\n\n` +
      `_${environment.indicator}_`,
    { parse_mode: 'Markdown' }
  );
};

export const handleQuickStart: CommandHandler = async ctx => {
  logger.info('/quick command handled by functional-commands.ts', {
    type: LogType.USER_ACTION,
    userId: ctx.from?.id,
  });

  const environment = detectEnvironment();

  const quickStartMessage =
    `⚡ **Быстрый старт VibeCode Bible**\n\n` +
    `📋 **1. Клонировать репозиторий:**\n` +
    `\`git clone https://github.com/playra/bible_vibecoder.git\`\n\n` +
    `📦 **2. Установить зависимости:**\n` +
    `\`cd bible_vibecoder && bun install\`\n\n` +
    `🔧 **3. Настроить окружение:**\n` +
    `\`cp .env.example .env\`\n` +
    `\`# Добавить BOT_TOKEN в .env\`\n\n` +
    `🚀 **4. Запустить проект:**\n` +
    `\`bun run dev\`\n\n` +
    `🧪 **5. Запустить тесты:**\n` +
    `\`bun test\`\n\n` +
    `📊 **6. Деплой на Railway:**\n` +
    `\`railway login && railway up\`\n\n` +
    `💡 *Весь проект настроен для мгновенного старта!*\n\n` +
    `_${environment.indicator}_`;

  await ctx.reply(quickStartMessage, { parse_mode: 'Markdown' });
};

// 🎨 Pure Carousel Handler
export const handleCarousel: CommandHandler = async ctx => {
  logger.info('/carousel command received', {
    type: LogType.USER_ACTION,
    userId: ctx.from?.id,
    data: { text: (ctx as any).message?.text },
  });

  const args = ((ctx as any).message?.text || '').split(' ').slice(1);
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
  const messageId = (ctx as any).message?.message_id;

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
            ? `http://localhost:7288`
            : 'production',
      },
    });

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
        data: { topic, telegramUserId },
      }
    );
  } catch (error) {
    logger.error('Ошибка при отправке события в Inngest', {
      type: LogType.BUSINESS_LOGIC,
      error: error instanceof Error ? error : new Error(String(error)),
      data: { topic, telegramUserId },
    });

    await ctx.reply(
      '❌ **Ошибка!** Не удалось запустить генерацию карусели. Попробуйте еще раз.',
      {
        parse_mode: 'Markdown',
        reply_parameters: { message_id: messageId },
      }
    );
  }
};

// 📝 Pure Text Handler
export const handleText: CommandHandler = async ctx => {
  logger.info('Text message received', {
    type: LogType.USER_ACTION,
    userId: ctx.from?.id,
    data: { text: (ctx as any).message?.text },
  });

  const text = (ctx as any).message?.text || '';
  const environment = detectEnvironment();
  const message = buildTextResponse(text, environment);

  await ctx.reply(message, { parse_mode: 'Markdown' });
};

// 🕉️ Command Registry (Pure Data Structure)
export const COMMAND_HANDLERS = {
  start: handleStart,
  help: handleHelp,
  wisdom: handleWisdom,
  quick: handleQuickStart,
  carousel: handleCarousel,
  text: handleText,
} as const;

// 🎯 Pure Command Setup Function
export const setupFunctionalCommands = (bot: any): void => {
  bot.start(COMMAND_HANDLERS.start);
  bot.help(COMMAND_HANDLERS.help);
  bot.command('wisdom', COMMAND_HANDLERS.wisdom);
  bot.command('quick', COMMAND_HANDLERS.quick);
  bot.command('carousel', COMMAND_HANDLERS.carousel);
  bot.on('text', COMMAND_HANDLERS.text);

  const environment = detectEnvironment();
  logger.info(
    `✅ Functional commands registered: start, help, wisdom, quick, carousel, text | ${environment.platform}`,
    {
      type: LogType.SYSTEM,
      data: { environment },
    }
  );
};

// 🕉️ Sacred Export
export const FunctionalCommands = {
  // Environment
  detectEnvironment,

  // Message Builders
  buildWelcomeMessage,
  buildHelpMessage,
  buildTextResponse,

  // Wisdom
  getRandomWisdom,
  getDailyWisdom,
  SACRED_WISDOM,

  // Handlers
  ...COMMAND_HANDLERS,

  // Setup
  setupFunctionalCommands,
} as const;

export default FunctionalCommands;
