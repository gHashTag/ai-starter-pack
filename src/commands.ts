import { Telegraf } from "telegraf";
import { CustomContext } from "./bot"; // Исправленный путь
import { logger, LogType } from "./utils/logger"; // Исправленный путь

export const setupCommands = (_bot: Telegraf<CustomContext>): void => {
  // Пример регистрации команды /start (может быть переопределен в bot.ts, если там есть свой)
  // _bot.start(async (ctx) => {
  //   logger.info('/start command handled by commands.ts', { type: LogType.COMMAND, userId: ctx.from?.id });
  //   const userFirstName =
  //     ctx.session?.user?.first_name || ctx.from?.first_name || "незнакомец";
  //   await ctx.reply(
  //     `Привет из commands.ts, ${userFirstName}! Используй /help для списка команд.`
  //   );
  // });

  // Пример регистрации команды /help (может быть переопределен в bot.ts)
  // _bot.help(async (ctx) => {
  //   logger.info('/help command handled by commands.ts', { type: LogType.COMMAND, userId: ctx.from?.id });
  //   const helpMessage =
  //     "Команды из commands.ts:\n" +
  //     "/start - Начальное приветствие\n" +
  //     "/help - Это сообщение";
  //   await ctx.reply(helpMessage);
  // });

  // Сюда можно добавлять другие команды
  // _bot.command('mycommand', (ctx) => {
  //   logger.info('/mycommand handled', { type: LogType.COMMAND, userId: ctx.from?.id });
  //   ctx.reply('Вы вызвали мою кастомную команду!');
  // });

  logger.info(
    "setupCommands function called (currently a stub or with examples). Actual commands might be in bot.ts or added here.",
    {
      type: LogType.SYSTEM,
    }
  );
};
