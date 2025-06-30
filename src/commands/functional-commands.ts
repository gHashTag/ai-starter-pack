// 🕉️ Functional Commands - Pure Event Handlers
// 🚫 NO CLASSES, NO MUTATIONS, PURE COMPOSITION

import { Context } from 'telegraf';
import { logger, LogType } from '../utils/logger.js';
import { inngest } from '../inngest/client.js';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../services/instagram-canvas.service';

// 🎨 Типы для временного хранения данных карусели
declare global {
  var carouselTopics:
    | Record<string, { topic: string; messageId: number }>
    | undefined;
  var carouselState: Record<string, { currentIndex: number }> | undefined;
}

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
    '🔍 `/research [тема]` - Глубокое исследование с AI агентом\n' +
    '💡 `/ask [вопрос]` - Быстрый ответ на вопрос\n' +
    '🧘‍♂️ `/wisdom` - Получить мудрость дня\n' +
    '⚡ `/quick` - Быстрый старт проекта\n\n' +
    '**Примеры использования:**\n' +
    '`/carousel медитативное программирование`\n' +
    '`/research AI инструменты 2025`\n' +
    '`/ask что такое состояние потока?`\n' +
    '`/carousel принципы VIBECODING`\n\n' +
    '🤖 *Research Agent ищет в интернете, анализирует данные и создает структурированные отчеты!*\n' +
    '🎨 *Carousel генерирует красивые слайды для Instagram из знаний VibeCoding!*\n\n' +
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

  // 🎨 Сохраняем тему в памяти для использования в callback
  const topicKey = `topic_${telegramUserId}_${Date.now()}`;
  // Используем простое хранение в памяти (можно заменить на Redis)
  global.carouselTopics = global.carouselTopics || {};
  global.carouselTopics[topicKey] = { topic, messageId };

  // 🎨 Инициализируем состояние карусели и сразу показываем галерею
  const templates = InstagramCanvasService.getColorTemplates();
  const templateKeys = Object.keys(templates);

  // Инициализируем состояние карусели
  if (!global.carouselState) {
    global.carouselState = {};
  }
  global.carouselState[topicKey] = { currentIndex: 0 };

  // Берем первый темплейт для отображения
  const currentTemplateKey = templateKeys[0];
  const selectedTemplate = templates[currentTemplateKey as ColorTemplate];

  // 🔧 Локальная версия: отправляем текстовое сообщение вместо фото

  // 🔧 Локальная версия: отправляем текстовое сообщение вместо фото
  await ctx.reply(
    `🎨 **Галерея темплейтов для карусели**\n\n` +
      `📝 **Тема:** "${topic}"\n\n` +
      `${selectedTemplate.emoji} **${selectedTemplate.name}**\n` +
      `🎨 **Цвета:** ${selectedTemplate.background}\n\n` +
      `💡 Листайте влево-вправо для выбора. Чтобы применить, нажмите "Применить"!\n\n` +
      `🎯 Позиция: 1 из ${templateKeys.length}`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⬅️ Назад', callback_data: `nav:prev:${topicKey}` },
            { text: 'Вперед ➡️', callback_data: `nav:next:${topicKey}` },
          ],
          [
            {
              text: '✔️ Применить',
              callback_data: `select:${currentTemplateKey}:${topicKey}`,
            },
          ],
        ],
      },
    }
  );
};

// 🎨 Обработчик выбора предпросмотра или цветового темплейта
export const handleColorSelection = async (ctx: any) => {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) {
    return;
  }

  if (callbackData.startsWith('nav:')) {
    const [, direction, topicKey] = callbackData.split(':');
    const templates = InstagramCanvasService.getColorTemplates();
    const templateKeys = Object.keys(templates);

    if (!global.carouselState) {
      global.carouselState = {};
    }

    const state = global.carouselState[topicKey] || { currentIndex: 0 };
    state.currentIndex =
      direction === 'next'
        ? (state.currentIndex + 1) % templateKeys.length
        : (state.currentIndex - 1 + templateKeys.length) % templateKeys.length;

    global.carouselState[topicKey] = state;

    const currentTemplateKey = templateKeys[state.currentIndex];
    const selectedTemplate = templates[currentTemplateKey as ColorTemplate];

    // Получаем тему из памяти
    const topicData = global.carouselTopics?.[topicKey];
    const topic = topicData?.topic || 'Неизвестная тема';

    // 🔧 Локальная версия: обновляем текстовое сообщение вместо фото
    await ctx.editMessageText(
      `🎨 **Галерея темплейтов для карусели**\n\n` +
        `📝 **Тема:** "${topic}"\n\n` +
        `${selectedTemplate.emoji} **${selectedTemplate.name}**\n` +
        `🎨 **Цвета:** ${selectedTemplate.background}\n\n` +
        `💡 Листайте влево-вправо для выбора. Чтобы применить, нажмите "Применить"!\n\n` +
        `🎯 Позиция: ${state.currentIndex + 1} из ${templateKeys.length}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⬅️ Назад', callback_data: `nav:prev:${topicKey}` },
              { text: 'Вперед ➡️', callback_data: `nav:next:${topicKey}` },
            ],
            [
              {
                text: '✔️ Применить',
                callback_data: `select:${currentTemplateKey}:${topicKey}`,
              },
            ],
          ],
        },
      }
    );
    return;
  }

  if (callbackData.startsWith('select:')) {
    const [, colorKey, topicKey] = callbackData.split(':');

    // Получаем тему из памяти
    const topicData = global.carouselTopics?.[topicKey];
    if (!topicData) {
      await ctx.answerCbQuery('❌ Сессия истекла, попробуйте еще раз');
      return;
    }

    const { topic, messageId } = topicData;
    const colorTemplate = colorKey as ColorTemplate;
    const telegramUserId = ctx.from?.id;

    const templates = InstagramCanvasService.getColorTemplates();
    const selectedTemplate = templates[colorTemplate];

    try {
      // 🔧 Локальная версия: обновляем текстовое сообщение при выборе
      await ctx.editMessageText(
        `🎨 **Генерирую карусель в стиле "${selectedTemplate.name}"**\n\n` +
          `📝 **Тема:** "${topic}"\n` +
          `🎨 **Стиль:** ${selectedTemplate.emoji} ${selectedTemplate.name}\n\n` +
          `⏳ Пожалуйста, подождите... Создаю для вас красивые слайды!`,
        { parse_mode: 'Markdown', reply_markup: undefined }
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
              ? `http://localhost:8288`
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

      // Очищаем данные из памяти
      if (global.carouselTopics) {
        delete global.carouselTopics[topicKey];
      }
      if (global.carouselState) {
        delete global.carouselState[topicKey];
      }
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
        { parse_mode: 'Markdown', reply_markup: undefined }
      );

      await ctx.answerCbQuery('❌ Произошла ошибка');

      // Очищаем данные из памяти даже при ошибке
      if (global.carouselTopics) {
        delete global.carouselTopics[topicKey];
      }
      if (global.carouselState) {
        delete global.carouselState[topicKey];
      }
    }
    return;
  }

  if (!callbackData.startsWith('color:')) {
    return;
  }

  const [, colorKey, topicKey] = callbackData.split(':');

  // Получаем тему из памяти
  const topicData = global.carouselTopics?.[topicKey];
  if (!topicData) {
    await ctx.answerCbQuery('❌ Сессия истекла, попробуйте еще раз');
    return;
  }

  const { topic, messageId } = topicData;
  const colorTemplate = colorKey as ColorTemplate;
  const telegramUserId = ctx.from?.id;

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
            ? `http://localhost:8288`
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

    // Очищаем данные из памяти
    if (global.carouselTopics) {
      delete global.carouselTopics[topicKey];
    }
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

    // Очищаем данные из памяти даже при ошибке
    if (global.carouselTopics) {
      delete global.carouselTopics[topicKey];
    }
  }
};

// 🔍 Research Command Handler
export const handleResearch: CommandHandler = async ctx => {
  const telegramUserId = ctx.from?.id;
  if (!telegramUserId) {
    await ctx.reply('❌ Не удалось получить ID пользователя');
    return;
  }

  const messageText = (ctx as any)?.message?.text || '';
  const topic = messageText.replace('/research', '').trim();

  if (!topic) {
    await ctx.reply(
      '🕉️ *VibeCoding Research Agent*\n\n' +
        'Глубокое исследование тем VibeCoding с веб-поиском и AI-анализом\n\n' +
        'Используй команду с темой:\n' +
        '`/research <тема>`\n\n' +
        'Примеры:\n' +
        '• `/research медитативное программирование`\n' +
        '• `/research AI инструменты 2025`\n' +
        '• `/research состояние потока в разработке`\n' +
        '• `/research cursor ai лучшие практики`\n\n' +
        '*Agent выполнит веб-поиск, проанализирует данные и даст структурированный ответ*',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  logger.info('/research command received', {
    type: LogType.USER_ACTION,
    data: { text: messageText },
  });

  try {
    await inngest.send({
      name: 'app/research.request',
      data: {
        topic,
        telegramUserId,
        depth: 'detailed',
      },
    });

    logger.info('✅ Событие на исследование УСПЕШНО отправлено в Inngest', {
      type: LogType.USER_ACTION,
      data: { topic, telegramUserId },
    });

    await ctx.reply(
      `🤖 *VibeCoding Research Agent активирован*\n\n` +
        `📊 Исследую тему: "${topic}"\n\n` +
        '🔍 Выполняю веб-поиск актуальной информации...\n' +
        '🧠 Анализирую данные через призму VibeCoding...\n' +
        '📝 Готовлю структурированный отчет...\n\n' +
        '⏳ *Результат придет через 30-60 секунд*',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    logger.error('❌ Ошибка при отправке события исследования в Inngest', {
      type: LogType.ERROR,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    await ctx.reply(
      '❌ Произошла ошибка при запуске исследования.\n' +
        'Попробуйте еще раз или обратитесь к администратору.'
    );
  }
};

// 💡 Ask Command Handler
export const handleAsk: CommandHandler = async ctx => {
  const telegramUserId = ctx.from?.id;
  if (!telegramUserId) {
    await ctx.reply('❌ Не удалось получить ID пользователя');
    return;
  }

  const messageText = (ctx as any)?.message?.text || '';
  const question = messageText.replace('/ask', '').trim();

  if (!question) {
    await ctx.reply(
      '🕉️ *VibeCoding Wisdom*\n\n' +
        'Быстрые ответы на вопросы о VibeCoding\n\n' +
        'Используй команду с вопросом:\n' +
        '`/ask <вопрос>`\n\n' +
        'Примеры:\n' +
        '• `/ask как начать медитативное программирование?`\n' +
        '• `/ask что такое состояние потока?`\n' +
        '• `/ask как настроить Cursor AI?`\n' +
        '• `/ask преимущества осознанного кодинга`\n\n' +
        '*Для глубокого анализа используй* `/research <тема>`',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  logger.info('/ask command received', {
    type: LogType.USER_ACTION,
    data: { text: messageText },
  });

  try {
    await inngest.send({
      name: 'app/question.ask',
      data: {
        question,
        telegramUserId,
      },
    });

    logger.info('✅ Событие на вопрос УСПЕШНО отправлено в Inngest', {
      type: LogType.USER_ACTION,
      data: { question, telegramUserId },
    });

    await ctx.reply(
      `🤔 *Размышляю над вопросом...*\n\n` +
        `"${question}"\n\n` +
        '⏳ *Ответ придет через несколько секунд*',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    logger.error('❌ Ошибка при отправке события вопроса в Inngest', {
      type: LogType.ERROR,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    await ctx.reply(
      '❌ Произошла ошибка при обработке вопроса.\n' +
        'Попробуйте еще раз или используйте `/research` для детального анализа.'
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
  research: handleResearch,
  ask: handleAsk,
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
  bot.command('research', COMMAND_HANDLERS.research);
  bot.command('ask', COMMAND_HANDLERS.ask);

  // 🎨 Регистрируем обработчик callback-запросов для выбора цвета
  bot.on('callback_query', COMMAND_HANDLERS.colorSelection);

  bot.on('text', COMMAND_HANDLERS.text);

  const environment = detectEnvironment();
  logger.info(
    `✅ Functional commands registered: start, help, wisdom, quick, carousel, research, ask, colorSelection, text | ${environment.platform}`,
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
