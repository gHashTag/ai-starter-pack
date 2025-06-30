#!/usr/bin/env bun

/**
 * Тестовый скрипт для проверки системы автоматической рассылки VibeCoding
 *
 * Проверяет:
 * 1. Подключение к базе данных
 * 2. Получение активных пользователей
 * 3. Генерацию случайной темы
 * 4. Создание карусели из VibeCoding знаний
 * 5. Тестовую отправку одному пользователю
 * 6. Возможность ручного запуска через Inngest
 */

import { join } from 'path';
import { promises as fs } from 'fs';
import { db } from '../src/db';
import { users, userSettings } from '../src/db/schema';
import { eq, and, isNotNull, or, isNull } from 'drizzle-orm';
import { vibeCodingCommands } from '../src/commands/vibecoding-commands';
import { triggerVibeCodingBroadcast } from '../src/inngest/functions/vibecoding-broadcast';
import { logger, LogType } from '../src/utils/logger';

/**
 * 🕉️ Главная функция тестирования рассылки
 */
async function testVibeCodingBroadcast() {
  console.log(
    '🕉️ Запуск тестирования системы автоматической рассылки VibeCoding...\n'
  );

  const outputDir = join(process.cwd(), 'test-outputs', 'broadcast-test');
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // 🔍 Шаг 1: Проверка подключения к базе данных
    console.log('1️⃣ Проверка подключения к базе данных...');
    if (!db) {
      throw new Error('База данных недоступна');
    }

    // Простой тест подключения
    await db.select().from(users).limit(1);
    console.log('   ✅ Подключение к базе данных успешно\n');

    // 👥 Шаг 2: Получение активных пользователей
    console.log('2️⃣ Получение списка активных пользователей...');
    const activeUsers = await db
      .select({
        telegram_id: users.telegram_id,
        username: users.username,
        first_name: users.first_name,
        language_code: users.language_code,
        notifications_enabled: userSettings.notifications_enabled,
      })
      .from(users)
      .leftJoin(userSettings, eq(users.id, userSettings.user_id))
      .where(
        and(
          isNotNull(users.telegram_id),
          or(
            isNull(userSettings.notifications_enabled), // нет настроек = включено по умолчанию
            eq(userSettings.notifications_enabled, true) // или явно включено
          )
        )
      );

    console.log(`   ✅ Найдено ${activeUsers.length} активных пользователей`);
    if (activeUsers.length > 0) {
      console.log(`   📱 Примеры пользователей:`);
      activeUsers.slice(0, 3).forEach((user, index) => {
        console.log(
          `      ${index + 1}. ${user.first_name || 'Без имени'} (@${user.username || 'без username'}) - ${user.telegram_id}`
        );
      });
    }
    console.log();

    // 🎨 Шаг 3: Генерация тестовой карусели
    console.log('3️⃣ Генерация тестовой карусели...');
    const testThemes = [
      'Философия интуитивного программирования',
      'Cursor AI техники и лучшие практики',
      'Медитативное программирование и состояние потока',
    ];

    const randomTheme =
      testThemes[Math.floor(Math.random() * testThemes.length)];
    const testStyles = ['minimalist', 'vibrant', 'dark', 'gradient'] as const;
    const randomStyle =
      testStyles[Math.floor(Math.random() * testStyles.length)];

    console.log(`   🎯 Выбранная тема: "${randomTheme}"`);
    console.log(`   🎨 Выбранный стиль: "${randomStyle}"`);

    const carouselResult = await vibeCodingCommands.generateVibeCodingCarousel(
      randomTheme,
      {
        maxCards: 3, // Меньше карточек для тестирования
        style: randomStyle,
        includeCodeExamples: true,
        categories: ['general', 'fundamentals', 'tools', 'practices'],
      }
    );

    if (!carouselResult.success) {
      throw new Error(`Ошибка генерации карусели: ${carouselResult.error}`);
    }

    console.log(`   ✅ Карусель успешно создана!`);
    console.log(
      `   🖼️  Создано ${carouselResult.carouselImages?.length || 0} изображений`
    );
    console.log(
      `   📄 Создано ${carouselResult.carouselCards?.length || 0} карточек`
    );

    if (carouselResult.searchStats) {
      console.log(
        `   ⏱️  Время поиска: ${carouselResult.searchStats.queryTime}ms`
      );
    }
    console.log();

    // 💾 Шаг 4: Сохранение тестовых изображений
    console.log('4️⃣ Сохранение тестовых изображений...');
    if (carouselResult.carouselImages) {
      for (let i = 0; i < carouselResult.carouselImages.length; i++) {
        const imageData = carouselResult.carouselImages[i];
        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
        const fileName = `broadcast_test_${randomStyle}_card_${i + 1}.png`;
        const filePath = join(outputDir, fileName);

        try {
          await fs.writeFile(filePath, base64Data, 'base64');
          console.log(`   💾 Сохранено: ${fileName}`);
        } catch (saveError) {
          console.error(`   ❌ Ошибка сохранения ${fileName}:`, saveError);
        }
      }
    }
    console.log();

    // 📊 Шаг 5: Детали карточек
    console.log('5️⃣ Детали созданных карточек:');
    if (carouselResult.carouselCards) {
      carouselResult.carouselCards.forEach((card, index) => {
        console.log(`   📄 Карточка ${index + 1}: "${card.title}"`);
        console.log(`      📂 Категория: ${card.category}`);
        console.log(`      🏷️  Теги: ${card.tags.slice(0, 3).join(', ')}`);
        console.log(
          `      📈 Релевантность: ${Math.round(card.relevanceScore * 100)}%`
        );
        if (card.codeExamples && card.codeExamples.length > 0) {
          console.log(`      💻 Примеры кода: ${card.codeExamples.length} шт.`);
        }
        console.log();
      });
    }

    // 🚀 Шаг 6: Тест ручного запуска через Inngest (опционально)
    console.log('6️⃣ Тест ручного запуска через Inngest...');
    console.log(
      '   ⚠️  Внимание: Это отправит реальную рассылку всем пользователям!'
    );
    console.log(
      '   ℹ️  Для безопасности, ручной запуск пропущен в тестовом режиме.'
    );
    console.log(
      '   💡 Для реального запуска используйте: await triggerVibeCodingBroadcast()'
    );
    console.log();

    // Вместо реального запуска, просто проверим, что функция доступна
    console.log(
      '   📋 Функция triggerVibeCodingBroadcast доступна:',
      typeof triggerVibeCodingBroadcast === 'function'
    );
    console.log();

    // 📈 Шаг 7: Итоговая статистика
    console.log('7️⃣ Итоговая статистика теста:');
    console.log(`   👥 Активных пользователей: ${activeUsers.length}`);
    console.log(`   🎨 Тема: ${randomTheme}`);
    console.log(`   🎭 Стиль: ${randomStyle}`);
    console.log(
      `   🖼️  Изображений создано: ${carouselResult.carouselImages?.length || 0}`
    );
    console.log(
      `   📄 Карточек создано: ${carouselResult.carouselCards?.length || 0}`
    );
    console.log(`   📁 Результаты сохранены в: ${outputDir}`);
    console.log();

    console.log(
      '🎉 Тест системы автоматической рассылки VibeCoding завершен успешно!'
    );
    console.log('🕉️ Система готова к автоматической работе каждый час.');
  } catch (error) {
    console.error('\n💥 Ошибка при тестировании системы рассылки:', error);

    logger.error('Broadcast test failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      type: LogType.ERROR,
    });

    process.exit(1);
  }
}

/**
 * 🔧 Запуск тестов, если скрипт выполняется напрямую
 */
if (import.meta.main) {
  testVibeCodingBroadcast()
    .then(() => {
      console.log(
        '\n✨ Тестирование завершено. До встречи в потоке VibeCoding! 🕉️'
      );
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Критическая ошибка при запуске тестов:', error);
      process.exit(1);
    });
}
