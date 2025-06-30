/**
 * 🚀 Manual Test Script for VibeCoding Broadcast
 *
 * This script manually triggers the vibeCodingBroadcast function to test
 * the full end-to-end workflow with real services.
 */

import { vibeCodingBroadcast } from '../src/inngest/functions/vibecoding-broadcast';
import { logger, LogType } from '../src/utils/logger';
import { db, closeConnection } from '../src/db';
import { users, userSettings } from '../src/db/schema';
import { eq } from 'drizzle-orm';

// Helper to create a mock context for the Inngest function
const createMockContext = () => ({
  event: { name: 'scheduled/vibecoding.broadcast', data: {} },
  step: {
    run: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      logger.info(`[MANUAL TEST] Running step: ${name}`);
      const result = await fn();
      logger.info(`[MANUAL TEST] Step "${name}" completed.`);
      return result;
    },
    waitFor: (id: string, timeout: string) => {
      logger.info(`[MANUAL TEST] Skipping waitFor: ${id}`);
      return Promise.resolve();
    },
    sleep: (duration: string) => {
      logger.info(`[MANUAL TEST] Skipping sleep: ${duration}`);
      return Promise.resolve();
    },
  },
});

async function runTest() {
  logger.info('🚀 STARTING MANUAL BROADCAST TEST 🚀');

  try {
    // Manually ensure at least one user can receive notifications for the test
    const testUserTelegramId = 144022504; // Use your Telegram ID
    const user = await db.query.users.findFirst({
      where: eq(users.telegramId, testUserTelegramId),
    });

    if (!user) {
      logger.error(
        `Test user with Telegram ID ${testUserTelegramId} not found. Please register with the bot first.`
      );
      return;
    }

    // Заменяем сложный onConflictDoUpdate на простую логику
    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, user.id),
    });

    if (existingSettings) {
      await db
        .update(userSettings)
        .set({ notifications_enabled: true })
        .where(eq(userSettings.userId, user.id));
    } else {
      await db
        .insert(userSettings)
        .values({ userId: user.id, notifications_enabled: true });
    }

    logger.info(
      `✅ Ensured test user ${testUserTelegramId} is set to receive notifications.`
    );

    const mockContext = createMockContext();

    // Execute the function's core logic directly
    // We cast to 'any' to access the internal 'fn' property for testing
    const result = await (vibeCodingBroadcast as any).fn(mockContext);

    logger.info('🎉 MANUAL BROADCAST TEST COMPLETED SUCCESSFULLY 🎉', {
      type: LogType.SUCCESS,
      data: result,
    });
  } catch (error) {
    logger.error('❌ MANUAL BROADCAST TEST FAILED ❌', {
      type: LogType.ERROR,
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
}

runTest().finally(async () => {
  logger.info('🔚 Test script finished.');
  await closeConnection();
  // Убираем принудительный выход, чтобы все соединения закрылись штатно
  // process.exit(0);
});
