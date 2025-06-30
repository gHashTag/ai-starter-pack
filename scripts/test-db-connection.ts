import { db } from '../src/db';
import { testTable } from '../src/db/schema';
import { logger } from '../src/utils/logger';
import { vibeCodingBroadcast } from '../src/inngest/functions/vibecoding-broadcast';

async function testDb() {
  logger.info('🚀 Starting simple DB connection test...');
  if (!db) {
    logger.error('❌ DB object is null. Check DATABASE_URL.');
    process.exit(1);
  }
  try {
    const result = await db.select().from(testTable).limit(1);
    logger.info('✅ DB connection test successful!', { data: result });
    process.exit(0);
  } catch (error) {
    logger.error('❌ DB connection test failed!', { error });
    process.exit(1);
  }
}

testDb();
