import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import path from 'path';
import fs from 'fs';

// 🎨 Демонстрационные слайды для blur эффектов
const demoSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🌌 VibeCoding Blur',
    content:
      'Инновационные blur эффекты для максимального визуального воздействия контента',
  },
  {
    order: 2,
    type: 'principle',
    title: '💫 Философия Размытия',
    content:
      'Blur эффекты создают глубину восприятия, фокусируя внимание на ключевом контенте поверх красивых фоновых изображений. Это создает баланс между эстетикой и читаемостью.',
  },
];

// 🌈 Расширенная палитра blur стилей для сравнения
const blurVariations = [
  {
    template: ColorTemplate.COSMIC_BLUR,
    name: 'cosmic-light-blur',
    description: '🌌 Легкий космический blur (20px)',
  },
  {
    template: ColorTemplate.MYSTIC_BLUR,
    name: 'mystic-medium-blur',
    description: '🔮 Средний мистический blur (30px)',
  },
  {
    template: ColorTemplate.ETHEREAL_BLUR,
    name: 'ethereal-strong-blur',
    description: '✨ Сильный эфирный blur (35px)',
  },
  {
    template: ColorTemplate.CELESTIAL_BLUR,
    name: 'celestial-balanced-blur',
    description: '🌠 Сбалансированный небесный blur (28px)',
  },
];

async function generateBlurVariations() {
  console.log('🎨 Генерация вариаций blur эффектов...');

  const canvasService = new InstagramCanvasService();
  const outputDir = path.resolve('./test-outputs/blur-variations');

  // Создаем папку для результатов
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(
    '🌟 Каждый стиль будет сгенерирован с разными фоновыми изображениями'
  );
  console.log('📱 Все изображения в формате 1080x1080 (Instagram Square)');

  for (const variation of blurVariations) {
    console.log(`\n🔄 Тестирование: ${variation.name}`);
    console.log(`📝 ${variation.description}`);

    try {
      // Генерируем несколько вариантов для каждого стиля
      for (let batch = 1; batch <= 3; batch++) {
        console.log(`  📸 Батч ${batch}/3 для ${variation.name}...`);

        const images = await canvasService.generateCarouselImages(
          demoSlides,
          undefined,
          variation.template
        );

        // Сохраняем изображения с указанием батча
        for (let i = 0; i < images.length; i++) {
          const filename = `${variation.name}_batch${batch}_slide${i + 1}.png`;
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, images[i]);

          // Показываем размер файла для анализа
          const stats = fs.statSync(filepath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`    ✅ ${filename} (${sizeKB}KB)`);
        }
      }

      console.log(`🎉 Все варианты для ${variation.name} готовы!`);
    } catch (error) {
      console.error(`❌ Ошибка генерации ${variation.name}:`, error);
    }
  }

  console.log('\n🎨 Все blur вариации сгенерированы!');
  console.log(`📁 Результаты сохранены в: ${outputDir}`);

  // Анализ результатов
  console.log('\n📊 Технический анализ blur эффектов:');
  console.log(
    '┌─────────────────────────────────────────────────────────────┐'
  );
  console.log(
    '│ Стиль              │ Blur    │ Цвет акцента │ Особенности   │'
  );
  console.log(
    '├─────────────────────────────────────────────────────────────┤'
  );
  console.log(
    '│ 🌌 Космический      │ 20px    │ Белый       │ Контрастный   │'
  );
  console.log(
    '│ 🔮 Мистический      │ 30px    │ Фиолетовый  │ Мягкий        │'
  );
  console.log(
    '│ ✨ Эфирный          │ 35px    │ Золотой     │ Сильный       │'
  );
  console.log(
    '│ 🌠 Небесный         │ 28px    │ Синий       │ Сбалансирован │'
  );
  console.log(
    '└─────────────────────────────────────────────────────────────┘'
  );

  console.log('\n🎯 Рекомендации по использованию:');
  console.log('• 🌌 Космический - для технических тем, программирования');
  console.log('• 🔮 Мистический - для философских концепций, медитации');
  console.log('• ✨ Эфирный - для премиум контента, роскошных тем');
  console.log('• 🌠 Небесный - для образовательного контента, tutorials');
}

// 🚀 Запуск генерации
generateBlurVariations().catch(console.error);
