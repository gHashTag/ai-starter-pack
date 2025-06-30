#!/usr/bin/env bun
/**
 * 🔮 Тест нового Modern Glassmorphism темплейта
 * Генерирует одну карточку с современным стеклянным дизайном
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service.js';
import { CarouselSlide } from '../src/types.js';

async function testPhotoRealisticGlassmorphism() {
  console.log('🔥 Тестируем ФОТОРЕАЛИСТИЧНЫЙ Glassmorphism эффект...');

  const canvasService = new InstagramCanvasService();

  // Создаем тестовый слайд с темой кодинга
  const testSlide: CarouselSlide = {
    order: 1,
    type: 'title',
    title: '💎 Библия VibeCoding',
    content:
      'Фотореалистичное стекло\nс кодовым фоном для\nполного погружения в мир программирования',
    subtitle: '#glassmorphism #photorealistic #vibecoding',
  };

  try {
    console.log('📸 Генерируем изображение с фотореалистичным стеклом...');

    const imageBuffers = await canvasService.generateCarouselImages(
      [testSlide],
      { width: 1080, height: 1080 },
      ColorTemplate.MODERN_GLASSMORPHISM
    );

    console.log(
      `✅ Изображение сгенерировано! Размер: ${imageBuffers[0].length} байт`
    );
    console.log('📁 Файл сохранен в: carousel-output/slide-1.png');

    // Дополнительно создаем версию файла с именем
    const fs = await import('fs/promises');
    await fs.writeFile(
      './photorealistic-glassmorphism-test.png',
      imageBuffers[0]
    );
    console.log(
      '💾 Дубликат сохранен как: photorealistic-glassmorphism-test.png'
    );

    console.log('\n🎨 Особенности нового фотореалистичного дизайна:');
    console.log('• 💻 Кодовый фон с библией VibeCoding');
    console.log('• 🌟 Многослойный blur эффект');
    console.log('• 💎 Реалистичные тени и отражения');
    console.log('• 🔮 3D перспектива стекла');
    console.log('• ✨ Динамическая подсветка кода');
  } catch (error) {
    console.error('❌ Ошибка при генерации изображения:', error);
  }
}

// Запускаем тест
testPhotoRealisticGlassmorphism();
