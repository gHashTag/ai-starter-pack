import { Scenes, Markup } from "telegraf";
import type { BaseBotContext } from "../types";
import { logger, LogType } from "../utils/logger";

/**
 * Функциональный шаблон Wizard-сцены
 *
 * Этот шаблон показывает как создавать Wizard-сцены в Telegram боте
 * в функциональном стиле. Используйте этот шаблон в качестве основы
 * для создания собственных сцен.
 *
 * @example
 * Пример использования:
 * ```
 * // Создание сцены
 * const myWizardScene = createExampleWizardScene();
 *
 * // Регистрация в Stage
 * const stage = new Scenes.Stage([myWizardScene]);
 *
 * // Использование в боте
 * bot.use(stage.middleware());
 * bot.command('start_wizard', (ctx) => ctx.scene.enter('example_wizard'));
 * ```
 */

// Функция для обработки первого шага сцены
const handleStep1 = async (ctx: BaseBotContext) => {
  logger.info("[ExampleWizard] Шаг 1: Начало сцены", {
    type: LogType.SCENE,
  });

  // Инициализация состояния
  // Используем явное приведение типа для работы с данными
  const wizardState = ctx.wizard.state as any;
  wizardState.data = {};

  await ctx.reply(
    "Добро пожаловать в мастер! Это первый шаг.\nВведите ваше имя:",
    Markup.inlineKeyboard([Markup.button.callback("Отмена", "cancel")])
  );

  // Переход к следующему шагу
  return ctx.wizard.next();
};

// Функция для обработки второго шага сцены (имя)
const handleStep2 = async (ctx: BaseBotContext) => {
  logger.info("[ExampleWizard] Шаг 2: Обработка имени", {
    type: LogType.SCENE,
  });

  // Проверка наличия текстового сообщения
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Пожалуйста, введите текст:");
    return; // Остаемся на текущем шаге
  }

  // Используем явное приведение типа для работы с данными
  const wizardState = ctx.wizard.state as any;
  if (!wizardState.data) {
    wizardState.data = {};
  }

  // Сохранение имени в состоянии
  wizardState.data.name = ctx.message.text;

  await ctx.reply(
    `Привет, ${wizardState.data.name}! Теперь введите ваш возраст:`,
    Markup.inlineKeyboard([
      Markup.button.callback("Назад", "back"),
      Markup.button.callback("Отмена", "cancel"),
    ])
  );

  // Переход к следующему шагу
  return ctx.wizard.next();
};

// Функция для обработки третьего шага сцены (возраст)
const handleStep3 = async (ctx: BaseBotContext) => {
  logger.info("[ExampleWizard] Шаг 3: Обработка возраста", {
    type: LogType.SCENE,
  });

  // Проверка наличия текстового сообщения
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Пожалуйста, введите число:");
    return; // Остаемся на текущем шаге
  }

  // Используем явное приведение типа для работы с данными
  const wizardState = ctx.wizard.state as any;
  if (!wizardState.data) {
    wizardState.data = {};
  }

  // Проверка, что введено число
  const age = parseInt(ctx.message.text);
  if (isNaN(age)) {
    await ctx.reply("Пожалуйста, введите корректное число:");
    return; // Остаемся на текущем шаге
  }

  // Сохранение возраста в состоянии
  wizardState.data.age = age;

  await ctx.reply(
    `Спасибо за информацию!\nИмя: ${wizardState.data.name}\nВозраст: ${wizardState.data.age}`,
    Markup.inlineKeyboard([
      Markup.button.callback("Начать заново", "restart"),
      Markup.button.callback("Завершить", "finish"),
    ])
  );

  // Остаемся на текущем шаге для ожидания выбора кнопки
  return;
};

// Обработчики кнопок

// Обработчик кнопки "Назад"
const handleBackAction = async (ctx: BaseBotContext) => {
  logger.info('[ExampleWizard] Нажата кнопка "Назад"', {
    type: LogType.USER_ACTION,
  });
  await ctx.answerCbQuery();

  // Возврат к предыдущему шагу
  return ctx.wizard.back();
};

// Обработчик кнопки "Отмена"
const handleCancelAction = async (ctx: BaseBotContext) => {
  logger.info('[ExampleWizard] Нажата кнопка "Отмена"', {
    type: LogType.USER_ACTION,
  });
  await ctx.answerCbQuery();

  await ctx.reply("Операция отменена.");

  // Очистка состояния перед выходом
  const wizardState = ctx.wizard.state as any;
  wizardState.data = {};

  // Выход из сцены
  return ctx.scene.leave();
};

// Обработчик кнопки "Начать заново"
const handleRestartAction = async (ctx: BaseBotContext) => {
  logger.info('[ExampleWizard] Нажата кнопка "Начать заново"', {
    type: LogType.USER_ACTION,
  });
  await ctx.answerCbQuery();

  // Очистка состояния перед перезапуском
  const wizardState = ctx.wizard.state as any;
  wizardState.data = {};

  // Возврат к первому шагу
  return ctx.wizard.selectStep(0);
};

// Обработчик кнопки "Завершить"
const handleFinishAction = async (ctx: BaseBotContext) => {
  logger.info('[ExampleWizard] Нажата кнопка "Завершить"', {
    type: LogType.USER_ACTION,
  });
  await ctx.answerCbQuery();

  await ctx.reply("Спасибо за использование мастера! До свидания!");

  // Очистка состояния перед выходом
  const wizardState = ctx.wizard.state as any;
  wizardState.data = {};

  // Выход из сцены
  return ctx.scene.leave();
};

// Функция для регистрации обработчиков кнопок
const registerButtonHandlers = (scene: Scenes.WizardScene<BaseBotContext>) => {
  scene.action("back", handleBackAction);
  scene.action("cancel", handleCancelAction);
  scene.action("restart", handleRestartAction);
  scene.action("finish", handleFinishAction);
  return scene;
};

/**
 * Создать и настроить экземпляр сцены в функциональном стиле
 */
export const createExampleWizardScene =
  (): Scenes.WizardScene<BaseBotContext> => {
    // Создаем сцену с обработчиками шагов
    const scene = new Scenes.WizardScene(
      "example_wizard",
      handleStep1,
      handleStep2,
      handleStep3
    );

    // Регистрируем обработчики кнопок
    return registerButtonHandlers(scene);
  };

export default createExampleWizardScene;
