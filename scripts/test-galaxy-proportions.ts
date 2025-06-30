#!/usr/bin/env bun

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import fs from 'fs/promises';
import path from 'path';

const canvasService = new InstagramCanvasService();

async function testGalaxyProportions() {
  console.log('🌌 Тестируем Galaxy Spiral Blur с новыми пропорциями...');
  console.log('📏 Центральный элемент: 800×800px, Footer: 750px');

  const outputDir = './test-outputs/galaxy-proportions';
  await fs.mkdir(outputDir, { recursive: true });

  // 🌌 Тестовые слайды
  const slides = [
    {
      order: 1,
      type: 'title' as const,
      title: '🌌 Галактическое Программирование',
      content:
        'Войди в космический поток кода через медитативное программирование',
    },
    {
      order: 2,
      type: 'principle' as const,
      title: '⭐ Принцип Галактики',
      content:
        'Каждая строка кода - это звезда в бесконечной галактике решений. Программируй осознанно!',
    },
    {
      order: 3,
      type: 'practice' as const,
      title: '🌟 Космическая Практика',
      content:
        'Начни день с 5-минутной медитации. Представь как твой код становится частью цифровой вселенной.',
    },
    {
      order: 4,
      type: 'summary' as const,
      title: '🚀 Космический Итог',
      content:
        'VibeCoding превращает разработку в медитативное путешествие по галактике возможностей.',
    },
  ];

  const startTime = Date.now();

  try {
    // 🎨 Генерируем только Galaxy Spiral Blur
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
        `galaxy_proportions_slide_${i + 1}.png`
      );
      await fs.writeFile(filename, imageBuffers[i]);

      const stats = await fs.stat(filename);
      console.log(
        `   📁 ${filename} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`
      );
    }

    // 📊 Создаем отчет
    const report = {
      timestamp: new Date().toISOString(),
      style: 'Galaxy Spiral Blur',
      proportions: {
        centralElement: '800×800px (квадрат)',
        footer: '750px (чуть меньше центрального)',
        spacing: '80px между элементами',
      },
      slides: slides.length,
      generationTime: `${Date.now() - startTime}ms`,
      output: outputDir,
      files: imageBuffers.map(
        (_, i) => `galaxy_proportions_slide_${i + 1}.png`
      ),
    };

    await fs.writeFile(
      path.join(outputDir, 'proportions-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n🎯 Новые пропорции протестированы:');
    console.log(`   🔲 Центральный: 800×800px (квадрат)`);
    console.log(`   🔹 Footer: 750px (на 50px меньше)`);
    console.log(`   📏 Spacing: 80px между элементами`);
    console.log(`   📁 Результат: ${outputDir}`);
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error);
    throw error;
  }
}

// Запускаем тест
testGalaxyProportions().catch(console.error);
