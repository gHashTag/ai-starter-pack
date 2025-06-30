import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import path from 'path';
import fs from 'fs';

// 🌌 Простой слайд для тестирования фоновых изображений
const testSlide: CarouselSlide = {
  order: 1,
  type: 'title',
  title: '🌌 Тест Фоновых Изображений',
  content:
    'Проверяем, что фоновые изображения из папки bg-bible-vibecoding правильно отображаются как background с blur эффектом поверх них',
};

async function testBackgroundImages() {
  console.log('🎨 Тестируем фоновые изображения с blur эффектами...\n');

  const canvasService = new InstagramCanvasService();
  const outputDir = './test-outputs/background-test';

  // Создаем директорию для результатов
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 🌌 Тестируем каждый blur стиль
  const blurStyles = [
    { template: ColorTemplate.COSMIC_BLUR, name: 'cosmic-bg' },
    { template: ColorTemplate.MYSTIC_BLUR, name: 'mystic-bg' },
    { template: ColorTemplate.ETHEREAL_BLUR, name: 'ethereal-bg' },
    { template: ColorTemplate.CELESTIAL_BLUR, name: 'celestial-bg' },
  ];

  for (const style of blurStyles) {
    console.log(`✨ Создаем ${style.name} с фоновым изображением...`);

    // Генерируем изображение
    const imageBuffers = await canvasService.generateCarouselImages(
      [testSlide],
      undefined,
      style.template
    );

    // Сохраняем изображение
    const imagePath = path.join(outputDir, `${style.name}.png`);
    fs.writeFileSync(imagePath, imageBuffers[0]);

    const fileSizeKB = Math.round(imageBuffers[0].length / 1024);
    console.log(`  💾 Сохранен: ${style.name}.png (${fileSizeKB}KB)`);
  }

  console.log(`\n🎉 Тестирование фоновых изображений завершено!`);
  console.log(`📁 Результаты в: ${path.resolve(outputDir)}`);
  console.log(
    `\n💡 Проверьте созданные изображения - фоновые картинки из папки bg-bible-vibecoding должны быть видны под blur эффектом!`
  );
}

// Запускаем тест
testBackgroundImages().catch(console.error);
