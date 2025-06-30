#!/usr/bin/env bun
/**
 * 🍎 Тест новых Apple Glass шаблонов
 * Демонстрирует все новые шаблоны в стиле Apple с эффектом матового стекла
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import { CarouselSlide } from '../src/types';
import { logger } from '../src/utils/logger';

// 🍎 Все новые Apple Glass шаблоны
const appleGlassTemplates = [
  ColorTemplate.APPLE_GLASS_LIGHT,
  ColorTemplate.APPLE_GLASS_DARK,
  ColorTemplate.APPLE_GLASS_BLUE,
  ColorTemplate.APPLE_GLASS_GREEN,
  ColorTemplate.APPLE_GLASS_PURPLE,
  ColorTemplate.APPLE_GLASS_PINK,
  ColorTemplate.APPLE_GLASS_GOLD,
];

// 🎨 Тестовые слайды
const testSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🍎 Apple Glass Design',
    content: 'Элегантный дизайн в стиле Apple с эффектом матового стекла',
    subtitle: 'Frosted Glass Template',
  },
  {
    order: 2,
    type: 'principle',
    title: '✨ Минимализм',
    content:
      'Чистые линии, элегантные переходы и изысканная типографика в духе Apple',
  },
  {
    order: 3,
    type: 'practice',
    title: '🎯 Практичность',
    content: 'Удобочитаемость и функциональность превыше всего',
  },
  {
    order: 4,
    type: 'summary',
    title: '🙏 Результат',
    content:
      'Современный дизайн, который радует глаз и вдохновляет на творчество',
  },
];

async function testAppleGlassTemplates() {
  const canvasService = new InstagramCanvasService();

  console.log('🍎 Тестируем новые Apple Glass шаблоны...\n');

  // Показываем все доступные шаблоны
  const allTemplates = InstagramCanvasService.getColorTemplates();
  console.log('📋 Доступные Apple Glass шаблоны:');

  appleGlassTemplates.forEach((template, index) => {
    const design = allTemplates[template];
    console.log(`${index + 1}. ${template} - ${design.name} ${design.emoji}`);
  });

  console.log('\n🎨 Генерируем превью для каждого шаблона...\n');

  // Генерируем по одному слайду для каждого шаблона
  for (let i = 0; i < appleGlassTemplates.length; i++) {
    const template = appleGlassTemplates[i];
    const design = allTemplates[template];

    console.log(`🔄 Генерируем ${template} (${design.name})...`);

    try {
      // Берем первый слайд и адаптируем под шаблон
      const slideForTemplate = {
        ...testSlides[0],
        title: `${design.emoji} ${design.name}`,
        content: `Элегантный дизайн в стиле Apple\nс эффектом матового стекла`,
        subtitle: template,
      };

      const images = await canvasService.generateCarouselImages(
        [slideForTemplate],
        { width: 1080, height: 1350 },
        template
      );

      // Сохраняем файл
      const fs = await import('fs');
      const outputPath = `./test-outputs/apple-glass-${template}.png`;
      fs.writeFileSync(outputPath, images[0]);

      console.log(`✅ Сохранен: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Ошибка при генерации ${template}:`, error);
    }
  }

  console.log('\n🎉 Тест завершен! Проверьте папку test-outputs/');
  console.log('\n📸 Сгенерированные файлы:');
  appleGlassTemplates.forEach(template => {
    console.log(`   - apple-glass-${template}.png`);
  });
}

// Запуск теста
if (import.meta.main) {
  testAppleGlassTemplates().catch(console.error);
}
