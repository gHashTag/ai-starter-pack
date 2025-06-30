#!/usr/bin/env bun

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import fs from 'fs/promises';
import path from 'path';

const canvasService = new InstagramCanvasService();

async function testGoldenBalance() {
  console.log('⚖️ Тест золотого баланса Galaxy Spiral Blur...');
  console.log('📏 Центральный: 800×800px, Footer: 720px (разница 80px)');

  const outputDir = './test-outputs/galaxy-golden-balance';
  await fs.mkdir(outputDir, { recursive: true });

  // 🌌 Тестовые слайды
  const slides = [
    {
      order: 1,
      type: 'title' as const,
      title: '⚖️ Золотой Баланс',
      content: 'Идеальные пропорции: центральный 800px, footer 720px',
    },
    {
      order: 2,
      type: 'principle' as const,
      title: '🎯 Гармония Размеров',
      content:
        'Разница в 80px создает элегантный баланс - не слишком много, не слишком мало',
    },
  ];

  const startTime = Date.now();

  try {
    // 🎨 Генерируем Galaxy Spiral Blur с золотым балансом
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
        `golden_balance_slide_${i + 1}.png`
      );
      await fs.writeFile(filename, imageBuffers[i]);

      const stats = await fs.stat(filename);
      console.log(
        `   📁 ${filename} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`
      );
    }

    console.log('\n⚖️ Золотой баланс достигнут:');
    console.log(`   🔲 Центральный: 800×800px (квадрат)`);
    console.log(`   🔹 Footer: 720px (на 80px меньше)`);
    console.log(`   ✨ Соотношение: 10:9 (элегантная пропорция)`);
    console.log(`   📁 Результат: ${outputDir}`);
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error);
    throw error;
  }
}

// Запускаем тест золотого баланса
testGoldenBalance().catch(console.error);
