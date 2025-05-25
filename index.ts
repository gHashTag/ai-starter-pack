import { Telegraf, Scenes } from "telegraf";
import { session } from "telegraf";
import { config } from "./src/config";
import { logger, LogType } from "./src/utils/logger";
import type { BaseBotContext } from "./src/types";
import { errorHandler } from "./src/middlewares/error-handler";
import { MemoryAdapter } from "./src/adapters/memory-adapter";
import { createExampleWizardScene } from "./src/templates/wizard-scene-template";
import { setupCommands } from "./src/commands";

// Экспорты для использования стартер-кита как библиотеки
export { Telegraf, Scenes };
export type { BaseBotContext } from "./src/types";
export type { StorageAdapter } from "./src/adapters/storage-adapter";
export { MemoryAdapter } from "./src/adapters/memory-adapter";
export { createExampleWizardScene } from "./src/templates/wizard-scene-template";
export { errorHandler } from "./src/middlewares/error-handler";
export { logger, LogType } from "./src/utils/logger";

// Вспомогательная функция для форматирования ошибок
const formatError = (err: unknown): Error =>
  err instanceof Error ? err : new Error(String(err));

// Определяем, является ли текущий файл точкой входа
// import.meta.main доступен только в Bun, поэтому проверяем его наличие
const isEntryPoint =
  (typeof import.meta.main === "boolean" && import.meta.main) ||
  process.argv[1]?.endsWith("index.ts") ||
  import.meta.url.endsWith("index.ts");

// Запуск бота если файл выполняется напрямую
if (isEntryPoint) {
  try {
    // Создаем экземпляр бота
    const bot = new Telegraf<BaseBotContext>(config.BOT_TOKEN);

    // Создаем адаптер хранилища
    const storage = new MemoryAdapter();

    // Инициализируем хранилище
    await storage.initialize();

    // Добавляем хранилище и конфигурацию в контекст бота
    bot.use((ctx, next) => {
      ctx.storage = storage;
      ctx.config = {
        telegramBotToken: config.BOT_TOKEN,
        ...config,
      };
      return next();
    });

    // Подключаем middleware для обработки ошибок
    bot.catch((err, ctx) => {
      // Безопасное приведение типов для контекста
      // @ts-expect-error: Типы CustomContext и BaseBotContext несовместимы
      errorHandler(err, ctx);
    });

    // Подключаем middleware
    bot.use(session());

    // Создаем и регистрируем сцены
    const exampleScene = createExampleWizardScene();
    const stage = new Scenes.Stage<BaseBotContext>([exampleScene]);
    bot.use(stage.middleware());

    // Регистрируем команды
    // @ts-expect-error: Типы не совместимы, но функционально это работает
    setupCommands(bot);

    // Запускаем бота
    await bot.launch();
    logger.info("Бот успешно запущен", { type: LogType.SYSTEM });

    // Обработка завершения работы
    const shutdown = async (signal: string) => {
      logger.info(`Получен сигнал ${signal}, завершаем работу...`, {
        type: LogType.SYSTEM,
      });
      bot.stop(signal);
      await storage.close().catch((err) =>
        logger.error("Ошибка при закрытии хранилища", {
          error: formatError(err),
          type: LogType.ERROR,
        })
      );
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    logger.error("Ошибка при запуске бота", {
      error: formatError(err),
      type: LogType.ERROR,
    });
    process.exit(1);
  }
}
