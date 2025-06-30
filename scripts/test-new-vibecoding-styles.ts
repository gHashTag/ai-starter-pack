#!/usr/bin/env bun

/**
 * 🧘‍♂️ Тестирование новых VibeCoding стилей
 *
 * Генерирует образцы карточек с новыми стилями:
 * - Night Flow (Ночной поток)
 * - Wave Technique (Волновая техника)
 * - Code Matrix (Код Матрица)
 * - Code Perspective (Код Перспектива)
 * - Code Hologram (Код Голограмма)
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import { logger, LogType } from '../src/utils/logger';
import fs from 'fs/promises';
import path from 'path';

const canvasService = new InstagramCanvasService();

// 🧘‍♂️ Тестовые слайды
const testSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🧘‍♂️ VibeCoding',
    content: 'Медитативное программирование',
  },
  {
    order: 2,
    type: 'principle',
    title: '💻 Код как искусство',
    content:
      'Каждая строка кода должна быть написана с полным пониманием её цели и места в архитектуре проекта.',
  },
];

// 🎨 Новые стили для тестирования
const newStyles = [
  ColorTemplate.NIGHT_FLOW,
  ColorTemplate.WAVE_TECHNIQUE,
  ColorTemplate.CODE_MATRIX,
  ColorTemplate.CODE_PERSPECTIVE,
  ColorTemplate.CODE_HOLOGRAM,
];

async function generateNewStyleSamples() {
  logger.info('🎨 Начинаем генерацию образцов новых VibeCoding стилей', {
    type: LogType.BUSINESS_LOGIC,
    data: { stylesCount: newStyles.length },
  });

  // Создаем директорию для результатов
  const outputDir = path.resolve('./test-outputs/new-vibecoding-styles');
  await fs.mkdir(outputDir, { recursive: true });

  for (const style of newStyles) {
    try {
      logger.info(`🎨 Генерируем образцы для стиля: ${style}`, {
        type: LogType.BUSINESS_LOGIC,
        data: { style },
      });

      // Генерируем изображения
      const images = await canvasService.generateCarouselImages(
        testSlides,
        undefined,
        style
      );

      // Сохраняем изображения
      for (let i = 0; i < images.length; i++) {
        const filename = `${style}_slide_${i + 1}.png`;
        const filepath = path.join(outputDir, filename);
        await fs.writeFile(filepath, images[i]);

        logger.info(`✅ Сохранен образец: ${filename}`, {
          type: LogType.BUSINESS_LOGIC,
          data: { filepath, size: images[i].length },
        });
      }
    } catch (error) {
      logger.error(`❌ Ошибка генерации для стиля ${style}`, {
        type: LogType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { style },
      });
    }
  }

  logger.info('🎉 Генерация образцов завершена', {
    type: LogType.BUSINESS_LOGIC,
    data: { outputDir },
  });
}

// 🚀 Запуск
generateNewStyleSamples()
  .then(() => {
    console.log('✅ Все образцы сгенерированы успешно!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Ошибка генерации:', error);
    process.exit(1);
  });
