#!/usr/bin/env bun

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import fs from 'fs/promises';
import path from 'path';

const canvasService = new InstagramCanvasService();

async function testFinalProportions() {
  console.log('🌌 Финальный тест Galaxy Spiral Blur...');
  console.log('📏 Центральный: 800×800px, Footer: 700px (разница 100px)');

  const outputDir = './test-outputs/galaxy-final-proportions';
  await fs.mkdir(outputDir, { recursive: true });

  // 🌌 Тестовые слайды
  const slides = [
    {
      order: 1,
      type: 'title' as const,
      title: '🌌 Идеальные Пропорции',
      content:
        'Центральный элемент доминирует, footer элегантно меньше на 100px',
    },
    {
      order: 2,
      type: 'principle' as const,
      title: '📐 Золотое Сечение',
      content:
        'Разница в 100px создает визуальную иерархию и привлекает внимание к центру',
    },
  ];

  const startTime = Date.now();

  try {
    // 🎨 Генерируем Galaxy Spiral Blur с новыми пропорциями
    const imageBuffers = await canvasService.generateCarouselImages(
      slides,
      undefined,
      ColorTemplate.GALAXY_SPIRAL_BLUR
    );

    console.log(
      `✅ Сгенерировано ${imageBuffers.length} изображений за ${Date.now() - startTime}ms`
    );

    // 💾 Сохраняем изображения
    for (let i = 0; i < imageBuffers.length; i++) {
      const filename = path.join(
        outputDir,
        `final_proportions_slide_${i + 1}.png`
      );
      await fs.writeFile(filename, imageBuffers[i]);

      const stats = await fs.stat(filename);
      console.log(
        `   📁 ${filename} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`
      );
    }

    console.log('\n🎯 Финальные пропорции:');
    console.log(`   🔲 Центральный: 800×800px (квадрат)`);
    console.log(`   🔹 Footer: 700px (на 100px меньше)`);
    console.log(`   ⚖️ Соотношение: 8:7 (идеальный контраст)`);
    console.log(`   📁 Результат: ${outputDir}`);
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error);
    throw error;
  }
}

// Запускаем финальный тест
testFinalProportions().catch(console.error);
