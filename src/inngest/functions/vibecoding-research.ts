/**
 * 🕉️ Inngest Function: VibeCoding Research Agent
 *
 * Функция обработки исследовательских запросов пользователей через AI SDK агента.
 * Используется для глубокого анализа тем VibeCoding с веб-поиском и AI-обработкой.
 */

import { inngest } from '../client';
import { bot } from '../../bot';
import {
  vibeCodingAgent,
  type ResearchAnalysis,
} from '../../agents/vibecoding-research-agent';
import { logger, LogType } from '../../utils/logger';

/**
 * 🎯 Функция для исследования тем VibeCoding через AI агента
 */
export const vibeCodingResearch = inngest.createFunction(
  {
    id: 'vibecoding-research',
    name: 'VibeCoding Research Agent',
    retries: 2,
  },
  {
    event: 'app/research.request',
  },
  async ({ event, step }) => {
    const { topic, telegramUserId, depth = 'detailed' } = event.data;

    try {
      logger.info('🕉️ Запуск VibeCoding Research Agent', {
        type: LogType.BUSINESS_LOGIC,
        data: { topic, telegramUserId, depth },
      });

      // 🔍 Шаг 1: Выполняем исследование через AI SDK агента
      const research = await step.run('ai-agent-research', async () => {
        logger.info('🤖 AI SDK агент начинает исследование', {
          type: LogType.BUSINESS_LOGIC,
          data: { topic, depth },
        });

        return await vibeCodingAgent.researchTopic(topic, depth as any);
      });

      // 📝 Шаг 2: Форматируем результаты для Telegram
      const formattedMessage = await step.run('format-results', async () => {
        return formatResearchResults(research);
      });

      // 📤 Шаг 3: Отправляем результаты пользователю
      await step.run('send-results', async () => {
        try {
          await bot.telegram.sendMessage(telegramUserId, formattedMessage, {
            parse_mode: 'Markdown',
            link_preview_options: { is_disabled: false },
          });

          logger.info('✅ Результаты исследования отправлены пользователю', {
            type: LogType.BUSINESS_LOGIC,
            data: {
              telegramUserId,
              topic,
              confidenceLevel: research.confidenceLevel,
              insightsCount: research.keyInsights.length,
            },
          });
        } catch (error) {
          logger.error('❌ Ошибка отправки результатов пользователю', {
            type: LogType.ERROR,
            error: error instanceof Error ? error : new Error(String(error)),
            data: { telegramUserId, topic },
          });
          throw error;
        }
      });

      return {
        success: true,
        topic,
        confidenceLevel: research.confidenceLevel,
        resultsSent: true,
      };
    } catch (error) {
      logger.error('❌ Ошибка в VibeCoding Research Agent', {
        type: LogType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { topic, telegramUserId, depth },
      });

      // 🚨 Отправляем сообщение об ошибке пользователю
      try {
        await bot.telegram.sendMessage(
          telegramUserId,
          `🕉️ *Извини, произошла ошибка при исследовании темы*\n\n` +
            `Тема: "${topic}"\n\n` +
            `Попробуй переформулировать запрос или обратиться к основным принципам VibeCoding:\n` +
            `• Осознанное программирование\n` +
            `• Медитативные практики в разработке\n` +
            `• Качество важнее скорости\n\n` +
            `Используй команду \`/research <тема>\` для повторной попытки.`,
          { parse_mode: 'Markdown' }
        );
      } catch (sendError) {
        logger.error('❌ Не удалось отправить сообщение об ошибке', {
          type: LogType.ERROR,
          error:
            sendError instanceof Error
              ? sendError
              : new Error(String(sendError)),
        });
      }

      throw error;
    }
  }
);

/**
 * 📝 Форматирует результаты исследования для Telegram
 */
function formatResearchResults(research: ResearchAnalysis): string {
  const confidenceEmoji =
    research.confidenceLevel >= 8
      ? '🟢'
      : research.confidenceLevel >= 6
        ? '🟡'
        : '🔴';

  let message = `🕉️ *VibeCoding Research: ${research.topic}*\n\n`;

  // 📊 Резюме
  message += `📝 **Резюме:**\n${research.summary}\n\n`;

  // 💡 Ключевые инсайты
  if (research.keyInsights.length > 0) {
    message += `💡 **Ключевые Инсайты:**\n`;
    research.keyInsights.forEach((insight, index) => {
      message += `${index + 1}. ${insight}\n`;
    });
    message += '\n';
  }

  // 🔥 Тренды
  if (research.trends.length > 0) {
    message += `🔥 **Актуальные Тренды:**\n`;
    research.trends.forEach((trend, index) => {
      message += `${index + 1}. ${trend}\n`;
    });
    message += '\n';
  }

  // 🎯 Рекомендации
  if (research.recommendations.length > 0) {
    message += `🎯 **Практические Рекомендации:**\n`;
    research.recommendations.forEach((rec, index) => {
      message += `${index + 1}. ${rec}\n`;
    });
    message += '\n';
  }

  // 🔍 Источники (показываем только первые 3)
  if (research.sources.length > 0) {
    message += `🔍 **Источники:**\n`;
    research.sources.slice(0, 3).forEach((source, index) => {
      message += `${index + 1}. [${source.title}](${source.url})\n   _${source.snippet.slice(0, 100)}..._\n`;
    });
    message += '\n';
  }

  // 🎲 Связанные темы
  if (research.relatedTopics.length > 0) {
    message += `🎲 **Для дальнейшего изучения:**\n`;
    research.relatedTopics.forEach((topic, index) => {
      message += `${index + 1}. ${topic}\n`;
    });
    message += '\n';
  }

  // 📊 Метрики
  message += `📊 **Анализ:** ${confidenceEmoji} Уверенность ${research.confidenceLevel}/10\n\n`;
  message += `*Исследование выполнено VibeCoding AI Agent с использованием веб-поиска и анализа*\n`;
  message += `#VibeCoding #AIResearch #${research.topic.replace(/\s+/g, '')}`;

  return message;
}

/**
 * 💬 Функция для быстрых ответов на вопросы
 */
export const vibeCodingQuickAnswer = inngest.createFunction(
  {
    id: 'vibecoding-quick-answer',
    name: 'VibeCoding Quick Answer',
    retries: 2,
  },
  {
    event: 'app/question.ask',
  },
  async ({ event, step }) => {
    const { question, telegramUserId } = event.data;

    try {
      logger.info('💡 Запуск VibeCoding Quick Answer', {
        type: LogType.BUSINESS_LOGIC,
        data: { question, telegramUserId },
      });

      // 🤖 Получаем быстрый ответ от агента
      const answer = await step.run('get-quick-answer', async () => {
        return await vibeCodingAgent.quickAnalysis(question);
      });

      // 📤 Отправляем ответ пользователю
      await step.run('send-answer', async () => {
        const message =
          `🕉️ *VibeCoding Wisdom*\n\n` +
          `**Вопрос:** ${question}\n\n` +
          `**Ответ:** ${answer}\n\n` +
          `*Для более глубокого анализа используй команду* \`/research <тема>\``;

        await bot.telegram.sendMessage(telegramUserId, message, {
          parse_mode: 'Markdown',
        });
      });

      return { success: true, question, answerLength: answer.length };
    } catch (error) {
      logger.error('❌ Ошибка в VibeCoding Quick Answer', {
        type: LogType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Отправляем fallback ответ
      try {
        await bot.telegram.sendMessage(
          telegramUserId,
          `🕉️ *VibeCoding учит терпению*\n\n` +
            `Произошла ошибка при обработке вопроса. Попробуй:\n` +
            `• Переформулировать вопрос\n` +
            `• Использовать команду \`/research\` для детального исследования\n` +
            `• Обратиться к основным принципам VibeCoding`,
          { parse_mode: 'Markdown' }
        );
      } catch {}

      throw error;
    }
  }
);
