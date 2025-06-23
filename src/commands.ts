import { Telegraf } from "telegraf";
import { CustomContext } from "./bot"; // Исправленный путь
import { logger, LogType } from "./utils/logger"; // Исправленный путь

export const setupCommands = (bot: Telegraf<CustomContext>): void => {
  // Команда /start
  bot.start(async (ctx) => {
    logger.info("/start command handled by commands.ts", {
      type: LogType.USER_ACTION,
      userId: ctx.from?.id,
    });
    const userFirstName =
      ctx.session?.user?.first_name || ctx.from?.first_name || "незнакомец";
    await ctx.reply(
      `🚀 Привет, ${userFirstName}! Я - AI Starter Pack Bot.\n\n` +
        `Используй /help для списка команд.`
    );
  });

  // Команда /help
  bot.help(async (ctx) => {
    logger.info("/help command handled by commands.ts", {
      type: LogType.USER_ACTION,
      userId: ctx.from?.id,
    });
    const helpMessage =
      "🤖 **Доступные команды:**\n\n" +
      "🚀 /start - Начальное приветствие\n" +
      "❓ /help - Это сообщение с помощью\n\n" +
      "✨ Бот успешно задеплоен на Railway!";
    await ctx.reply(helpMessage, { parse_mode: "Markdown" });
  });

  // Обработка всех текстовых сообщений
  bot.on("text", async (ctx) => {
    logger.info("Text message received", {
      type: LogType.USER_ACTION,
      userId: ctx.from?.id,
      data: { text: ctx.message.text },
    });

    await ctx.reply(
      `👂 Я получил твоё сообщение: "${ctx.message.text}"\n\n` +
        `Используй /help для списка команд.`
    );
  });

  logger.info(
    "✅ Commands successfully registered: /start, /help, text handler",
    {
      type: LogType.SYSTEM,
    }
  );
};
