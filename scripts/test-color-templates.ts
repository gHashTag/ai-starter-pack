#!/usr/bin/env bun

/**
 * 🎨 Тестирование всех цветовых темплейтов
 *
 * Генерирует по одному слайду для каждого цветового темплейта
 * для демонстрации различий в дизайне.
 */

import { CarouselContentGeneratorService } from '../src/services/carousel-content-generator.service';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
// import { logger, LogType } from '../src/utils/logger'; // Unused import commented out

const contentGenerator = new CarouselContentGeneratorService();
const canvasService = new InstagramCanvasService();

async function testColorTemplates() {
  console.log('🎨 Тестирование всех цветовых темплейтов...\n');

  const topic = 'красота дизайна';

  // Генерируем один слайд для тестирования
  console.log('📝 Генерируем тестовый слайд...');
  const slides = await contentGenerator.generateCarouselSlides(topic);

  if (!slides || slides.length === 0) {
    console.error('❌ Не удалось сгенерировать слайды');
    process.exit(1);
  }

  // Берем первый слайд для тестирования всех цветов
  const testSlide = slides[0];
  console.log(`✅ Тестовый слайд: "${testSlide.title}"\n`);

  // Получаем все доступные темплейты
  const templates = InstagramCanvasService.getColorTemplates();

  console.log('🎨 Генерируем изображения для всех цветовых темплейтов:\n');

  for (const [colorKey, template] of Object.entries(templates)) {
    const colorTemplate = colorKey as ColorTemplate;

    try {
      console.log(`🎨 Генерирую: ${template.emoji} ${template.name}...`);

      const imagePaths = await canvasService.generateCarouselImageFiles(
        [testSlide],
        undefined,
        colorTemplate
      );

      // Переименовываем файл для различения
      const fs = await import('fs/promises');
      const newPath = `./carousel-output/template-${colorKey}-${testSlide.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`;

      await fs.rename(imagePaths[0], newPath);

      const stats = await fs.stat(newPath);
      console.log(
        `  ✅ Создан: ${newPath} (${Math.round(stats.size / 1024)} KB)`
      );
    } catch (error) {
      console.error(`  ❌ Ошибка для темплейта ${template.name}:`, error);
    }
  }

  console.log('\n🎉 Тестирование завершено!');
  console.log(
    '📁 Проверьте папку ./carousel-output/ для просмотра всех цветовых вариантов'
  );

  // Показываем доступные темплейты
  console.log('\n📋 Доступные цветовые темплейты:');
  Object.entries(templates).forEach(([key, template]) => {
    console.log(`  ${template.emoji} ${template.name} (${key})`);
  });
}

// Запуск тестирования
testColorTemplates()
  .then(() => {
    console.log('\n✅ Тестирование цветовых темплейтов завершено успешно!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Ошибка при тестировании:', error);
    process.exit(1);
  });
