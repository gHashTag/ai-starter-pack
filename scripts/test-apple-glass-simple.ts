#!/usr/bin/env bun

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import { CarouselSlide } from '../src/types';
import * as fs from 'fs';

// 🍎 VibeCoding контент для Apple Glass теста
const vibeCodingSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🍎 Apple Glass VibeCoding',
    content: 'Элегантные инструменты\nредакторы кода\nдля вайб-кодинга',
    subtitle: 'В стиле Apple с матовым стеклом',
  },
  {
    order: 2,
    type: 'principle',
    title: '💻 Cursor AI',
    content:
      'Революционный редактор с ИИ\n\n• Автодополнение кода\n• Интеллектуальные предложения\n• Рефакторинг одним кликом',
  },
  {
    order: 3,
    type: 'practice',
    title: '🌊 Windsurf IDE',
    content:
      'Новый уровень разработки\n\n• Мультимодальный ИИ\n• Контекстное понимание\n• Плавный workflow',
  },
  {
    order: 4,
    type: 'summary',
    title: '🙏 Результат',
    content:
      'Современные инструменты\nдля медитативного кодирования\nв стиле Apple',
  },
];

async function testAppleGlassVibeCoding() {
  const service = new InstagramCanvasService();

  console.log('🍎 Создаем VibeCoding карусель в стиле Apple Glass...');

  try {
    // Генерируем с Apple Glass Purple шаблоном
    const images = await service.generateCarouselImages(
      vibeCodingSlides,
      { width: 1080, height: 1350 },
      ColorTemplate.APPLE_GLASS_PURPLE
    );

    console.log(`✅ Создано ${images.length} слайдов`);

    // Сохраняем файлы
    for (let i = 0; i < images.length; i++) {
      const filename = `apple-glass-vibecoding-slide-${i + 1}.png`;
      fs.writeFileSync(`./test-outputs/${filename}`, images[i]);
      console.log(
        `💾 Сохранен: ${filename} (${(images[i].length / 1024).toFixed(1)}KB)`
      );
    }

    console.log('\n🎉 Apple Glass VibeCoding карусель готова!');
    console.log('🎨 Шаблон: Apple Glass Purple');
    console.log('📁 Файлы в папке: test-outputs/');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testAppleGlassVibeCoding().catch(console.error);
