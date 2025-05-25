import { CustomContext } from "../bot"; // Предполагается, что CustomContext будет экспортирован
import { logger, LogType } from "../utils/logger"; // Предполагается, что logger существует

// Простая заглушка для обработчика ошибок
export const errorHandler = (error: any, ctx: CustomContext): void => {
  logger.error(`Telegraf error for ${ctx.updateType}`, {
    error: error instanceof Error ? error : new Error(String(error)),
    type: LogType.ERROR, // или другой подходящий тип
    // Складываем контекстную информацию в поле data
    data: {
      update: ctx.update,
      updateType: ctx.updateType,
      telegramUserId: ctx.from?.id,
      chatId: ctx.chat?.id,
    },
    // Можно также явно указать userId, если он доступен и нужен на верхнем уровне лога
    userId: ctx.from?.id,
  });

  // Опционально: ответить пользователю
  // Важно не падать, если ctx.reply уже был вызван или недоступен
  if (ctx.reply && !ctx.webhookReply && typeof ctx.reply === "function") {
    ctx
      .reply(
        "Извините, произошла непредвиденная ошибка. Мы уже работаем над этим."
      )
      .catch((replyError) => {
        logger.error("Failed to send error message to user", {
          error: replyError,
          type: LogType.SYSTEM,
        });
      });
  } else {
    logger.warn(
      "Cannot send error reply to user, ctx.reply is not available or webhook reply was used.",
      {
        type: LogType.SYSTEM,
        data: {
          // Также используем data для дополнительной информации
          updateType: ctx.updateType,
        },
      }
    );
  }
};
