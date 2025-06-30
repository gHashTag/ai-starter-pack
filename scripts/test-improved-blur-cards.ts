import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import path from 'path';
import fs from 'fs';

// 🎯 Тестовые слайды для демонстрации улучшенных blur эффектов
const testSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🌌 Улучшенный Blur',
    content:
      'Правильный blur эффект с белым текстом поверх полупрозрачного фона',
  },
  {
    order: 2,
    type: 'principle',
    title: '✨ Читаемость',
    content:
      'Белый текст на полупрозрачном размытом фоне обеспечивает максимальную читаемость и эстетику. Фоновое изображение создает атмосферу, не мешая восприятию контента.',
  },
  {
    order: 3,
    type: 'practice',
    title: '🎨 Дизайн Принципы',
    content:
      'Баланс между красотой фонового изображения и функциональностью текстового блока. Размытие создает глубину, белый текст - четкость.',
  },
];

// 🎨 Улучшенные blur стили с правильными настройками
const improvedBlurStyles = [
  {
    template: ColorTemplate.COSMIC_BLUR,
    name: 'cosmic-improved-blur',
    description: 'Космический blur с улучшенной читаемостью',
  },
  {
    template: ColorTemplate.MYSTIC_BLUR,
    name: 'mystic-improved-blur',
    description: 'Мистический blur с четким белым текстом',
  },
  {
    template: ColorTemplate.ETHEREAL_BLUR,
    name: 'ethereal-improved-blur',
    description: 'Эфирный blur с оптимальным контрастом',
  },
  {
    template: ColorTemplate.CELESTIAL_BLUR,
    name: 'celestial-improved-blur',
    description: 'Небесный blur с идеальной читаемостью',
  },
];

async function testImprovedBlurCards() {
  const canvasService = new InstagramCanvasService();

  // Создаем папку для улучшенных результатов
  const outputDir = path.join(
    process.cwd(),
    'test-outputs',
    'improved-blur-cards'
  );
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎨 Генерируем улучшенные blur карточки...');

  for (const style of improvedBlurStyles) {
    console.log(`\n✨ Создаем ${style.description}...`);

    try {
      const images = await canvasService.generateCarouselImages(
        testSlides,
        undefined, // Используем дефолтные настройки
        style.template
      );

      // Сохраняем каждое изображение
      images.forEach((imageBuffer, index) => {
        const filename = `${style.name}_slide_${index + 1}.png`;
        const filepath = path.join(outputDir, filename);

        // Обеспечиваем правильный формат Buffer
        const buffer = Buffer.isBuffer(imageBuffer)
          ? imageBuffer
          : Buffer.from((imageBuffer as any).data || imageBuffer);

        fs.writeFileSync(filepath, buffer);
        console.log(
          `  💾 Сохранен: ${filename} (${Math.round(buffer.length / 1024)}KB)`
        );
      });
    } catch (error) {
      console.error(`❌ Ошибка создания ${style.name}:`, error);
    }
  }

  console.log('\n🎉 Улучшенные blur карточки созданы!');
  console.log(`📁 Результаты в: ${outputDir}`);
}

// Запускаем генерацию
testImprovedBlurCards().catch(console.error);
