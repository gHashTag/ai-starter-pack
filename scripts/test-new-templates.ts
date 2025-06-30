#!/usr/bin/env bun

/**
 * 🎨 Тестирование новых luxury цветовых темплейтов
 *
 * Генерирует образцы всех новых шаблонов для проверки
 */

import { CarouselContentGeneratorService } from '../src/services/carousel-content-generator.service';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import { VibeCodingContentService } from '../src/services/vibecoding-content.service';
import { promises as fs } from 'fs';
import path from 'path';

const contentGenerator = new CarouselContentGeneratorService();
const canvasService = new InstagramCanvasService();
const vibeContentService = new VibeCodingContentService();

async function testNewTemplates() {
  console.log('🎨 Тестирование новых luxury цветовых темплейтов...\n');

  const topic = 'Clean Code Principles';

  // Генерируем контент один раз
  console.log('📝 Генерирую контент слайдов...');
  const slides = await contentGenerator.generateCarouselSlides(topic);
  console.log(`✅ Создано ${slides.length} слайдов\n`);

  // Генерируем Instagram текст
  console.log('📱 Генерирую Instagram текст...');
  const instagramText = vibeContentService.generateInstagramPost(topic, slides);
  console.log('✅ Instagram текст создан\n');

  // Получаем все темплейты
  const templates = InstagramCanvasService.getColorTemplates();
  const newTemplates = [
    ColorTemplate.BLACK_GOLD,
    ColorTemplate.EMERALD_LUXURY,
    ColorTemplate.ROYAL_PURPLE,
    ColorTemplate.PLATINUM_SILVER,
    ColorTemplate.BURGUNDY_GOLD,
    ColorTemplate.MIDNIGHT_BLUE,
    ColorTemplate.COPPER_BRONZE,
    ColorTemplate.FOREST_GOLD,
    ColorTemplate.ROSE_GOLD,
    ColorTemplate.CHARCOAL_MINT,
  ];

  // Создаем папку для результатов
  const outputDir = path.join(process.cwd(), 'test-outputs', 'new-templates');
  await fs.mkdir(outputDir, { recursive: true });

  console.log('🎨 Генерирую образцы новых темплейтов:\n');

  for (const template of newTemplates) {
    const templateInfo = templates[template];
    console.log(`🎨 Создаю ${templateInfo.emoji} ${templateInfo.name}...`);

    try {
      // Генерируем только первый слайд для быстрого тестирования
      const firstSlide = slides[0];
      const imagePath = await canvasService.generateCarouselImageFiles(
        [firstSlide],
        `${outputDir}/${template}_sample`,
        template
      );

      // Проверяем размер файла
      const stats = await fs.stat(imagePath[0]);
      const sizeKB = Math.round(stats.size / 1024);

      console.log(`  ✅ ${templateInfo.name}: ${sizeKB} KB`);
    } catch (error) {
      console.log(`  ❌ Ошибка в ${templateInfo.name}:`, error);
    }
  }

  // Сохраняем Instagram текст
  const textPath = path.join(outputDir, 'instagram-text.txt');
  await fs.writeFile(textPath, instagramText, 'utf-8');
  console.log(`\n📱 Instagram текст сохранен: ${textPath}`);

  console.log('\n🎉 Тестирование завершено!');
  console.log(`📁 Результаты в папке: ${outputDir}`);
}

// Запускаем тест
testNewTemplates().catch(console.error);
