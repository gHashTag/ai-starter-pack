// 🕉️ Functional Commands - Pure Event Handlers
// 🚫 NO CLASSES, NO MUTATIONS, PURE COMPOSITION

import { Context } from 'telegraf';
import { logger, LogType } from '../utils/logger.js';
import { inngest } from '../inngest/client.js';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../services/instagram-canvas.service';

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

// 🎨 Carousel Handler с выбором цветовых темплейтов
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

  // 🎨 Показываем выбор цветовых темплейтов
  const templates = InstagramCanvasService.getColorTemplates();
  const keyboard = Object.entries(templates).map(([key, template]) => [
    {
      text: `${template.emoji} ${template.name}`,
      callback_data: `carousel_color:${key}:${Buffer.from(topic).toString('base64')}:${telegramUserId}:${messageId}`,
    },
  ]);

  await ctx.reply(
    `🎨 **Выберите цветовую тему для карусели:**\n\n` +
      `📝 **Тема:** "${topic}"\n\n` +
      `Каждая тема создает уникальную атмосферу для ваших слайдов!`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: keyboard,
      },
    }
  );
};

// 🎨 Обработчик выбора цветового темплейта
export const handleColorSelection = async (ctx: any) => {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData || !callbackData.startsWith('carousel_color:')) {
    return;
  }

  const [, colorKey, topicBase64, telegramUserId, messageId] =
    callbackData.split(':');
  const topic = Buffer.from(topicBase64, 'base64').toString('utf-8');
  const colorTemplate = colorKey as ColorTemplate;

  const templates = InstagramCanvasService.getColorTemplates();
  const selectedTemplate = templates[colorTemplate];

  try {
    // Обновляем сообщение с выбранным цветом
    await ctx.editMessageText(
      `🎨 **Генерирую карусель в стиле "${selectedTemplate.name}"**\n\n` +
        `📝 **Тема:** "${topic}"\n` +
        `🎨 **Стиль:** ${selectedTemplate.emoji} ${selectedTemplate.name}\n\n` +
        `⏳ Пожалуйста, подождите... Создаю для вас красивые слайды!`,
      { parse_mode: 'Markdown' }
    );

    // Отправляем событие в Inngest с выбранным цветом
    logger.info('Попытка отправки события в Inngest с цветовым темплейтом', {
      type: LogType.BUSINESS_LOGIC,
      data: {
        topic,
        telegramUserId,
        colorTemplate,
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
        colorTemplate, // 🎨 Добавляем выбранный цветовой темплейт
      },
    });

    logger.info(
      '✅ Событие на генерацию карусели с цветовым темплейтом УСПЕШНО отправлено в Inngest',
      {
        type: LogType.USER_ACTION,
        data: { topic, telegramUserId, colorTemplate },
      }
    );

    // Подтверждаем callback
    await ctx.answerCbQuery(`🎨 Выбран стиль: ${selectedTemplate.name}`);
  } catch (error) {
    logger.error(
      'Ошибка при отправке события в Inngest с цветовым темплейтом',
      {
        type: LogType.BUSINESS_LOGIC,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { topic, telegramUserId, colorTemplate },
      }
    );

    await ctx.editMessageText(
      '❌ **Ошибка!** Не удалось запустить генерацию карусели. Попробуйте еще раз.',
      { parse_mode: 'Markdown' }
    );

    await ctx.answerCbQuery('❌ Произошла ошибка');
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
  colorSelection: handleColorSelection,
  text: handleText,
} as const;

// 🎯 Pure Command Setup Function
export const setupFunctionalCommands = (bot: any): void => {
  bot.start(COMMAND_HANDLERS.start);
  bot.help(COMMAND_HANDLERS.help);
  bot.command('wisdom', COMMAND_HANDLERS.wisdom);
  bot.command('quick', COMMAND_HANDLERS.quick);
  bot.command('carousel', COMMAND_HANDLERS.carousel);

  // 🎨 Регистрируем обработчик callback-запросов для выбора цвета
  bot.on('callback_query', COMMAND_HANDLERS.colorSelection);

  bot.on('text', COMMAND_HANDLERS.text);

  const environment = detectEnvironment();
  logger.info(
    `✅ Functional commands registered: start, help, wisdom, quick, carousel, colorSelection, text | ${environment.platform}`,
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
