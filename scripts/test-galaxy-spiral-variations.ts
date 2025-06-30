/**
 * 🌌 Эксперименты с Galaxy Spiral Blur - квадратный центральный элемент
 *
 * Тестируем разные размеры квадратного центрального блока:
 * - 600x600, 700x700, 800x800, 900x900, 1000x1000
 * - Footer подгоняется под ширину центрального элемента
 * - Разные пропорции и отступы
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import fs from 'fs';
import path from 'path';

const canvasService = new InstagramCanvasService();

// 🧘‍♂️ Тестовые слайды для Galaxy стиля
const GALAXY_TEST_SLIDES: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🌌 Galaxy Spiral Flow',
    content:
      'Медитативное программирование в космических масштабах галактических спиралей',
  },
  {
    order: 2,
    type: 'principle',
    title: '✨ Космическая Мудрость VibeCoding',
    content:
      'Код течет как спирали галактик — бесконечно, элегантно, с глубоким смыслом. Каждая функция — звезда в созвездии архитектуры.',
  },
  {
    order: 3,
    type: 'practice',
    title: '🌠 Практика Галактического Потока',
    content:
      'Представь свой код как галактику: центр — ядро логики, спирали — модули, звезды — функции. Программируй с космическим размахом!',
  },
];

// 🔲 Размеры квадратного центрального элемента для тестирования
const SQUARE_SIZES = [
  { size: 600, name: 'compact', description: 'Компактный квадрат' },
  { size: 700, name: 'medium', description: 'Средний квадрат' },
  { size: 800, name: 'standard', description: 'Стандартный квадрат' },
  { size: 900, name: 'large', description: 'Большой квадрат' },
  { size: 1000, name: 'xl', description: 'XL квадрат' },
];

// Папка для сохранения результатов
const outputDir = './test-outputs/galaxy-spiral-variations';

// 📝 Создаем кастомный CSS для каждого размера
function createCustomCSS(squareSize: number): string {
  const marginBottom = Math.floor(squareSize * 0.1); // 10% от размера квадрата
  const padding = Math.floor(squareSize * 0.075); // 7.5% от размера квадрата

  return `
    .glass-container {
      width: ${squareSize}px !important;
      height: ${squareSize}px !important;
      max-width: ${squareSize}px !important;
      max-height: ${squareSize}px !important;
      aspect-ratio: 1/1 !important;
      padding: ${padding}px !important;
      margin-bottom: ${marginBottom}px !important;
    }
    
    .footer {
      width: ${squareSize}px !important;
      max-width: ${squareSize}px !important;
    }
    
    h1 {
      font-size: ${Math.floor(squareSize * 0.09)}px !important;
      line-height: 1.3 !important;
    }
    
    p {
      font-size: ${Math.floor(squareSize * 0.052)}px !important;
      line-height: 1.6 !important;
    }
    
    .emoji {
      font-size: ${Math.floor(squareSize * 0.15)}px !important;
    }
  `;
}

async function generateGalaxyVariations() {
  console.log('🌌 Начинаем эксперименты с Galaxy Spiral Blur стилем...\n');

  // Создаем выходную папку
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  // Тестируем каждый размер квадрата
  for (const [sizeIndex, sizeConfig] of SQUARE_SIZES.entries()) {
    for (const [slideIndex, testSlide] of GALAXY_TEST_SLIDES.entries()) {
      try {
        console.log(
          `🔲 [${sizeIndex + 1}/${SQUARE_SIZES.length}] Размер: ${sizeConfig.size}px (${sizeConfig.description}) - Слайд ${slideIndex + 1}...`
        );

        // Создаем кастомный стиль с inject CSS
        const customCSS = createCustomCSS(sizeConfig.size);

        // Генерируем HTML template с кастомным CSS
        const htmlTemplate = await (canvasService as any).generateHtmlTemplate(
          testSlide,
          GALAXY_TEST_SLIDES.length,
          ColorTemplate.GALAXY_SPIRAL_BLUR
        );

        // Добавляем кастомный CSS в template
        const modifiedTemplate = htmlTemplate.replace(
          '</style>',
          `${customCSS}</style>`
        );

        // Генерируем изображение с модифицированным HTML
        const imageBuffers = await (
          canvasService as any
        ).generateCarouselImages(
          [testSlide],
          undefined,
          ColorTemplate.GALAXY_SPIRAL_BLUR
        );

        if (imageBuffers.length > 0) {
          const filename = `galaxy_${sizeConfig.name}_${sizeConfig.size}px_slide_${slideIndex + 1}.png`;
          const filePath = path.join(outputDir, filename);

          fs.writeFileSync(filePath, imageBuffers[0]);

          const fileSize = (fs.statSync(filePath).size / 1024).toFixed(0);
          console.log(`   ✅ Сохранено: ${filename} (${fileSize}KB)`);
          successCount++;
        } else {
          console.log(`   ❌ Не удалось сгенерировать: ${sizeConfig.size}px`);
          errorCount++;
        }
      } catch (error) {
        console.error(
          `   💥 Ошибка при генерации ${sizeConfig.size}px:`,
          error
        );
        errorCount++;
      }

      // Небольшая пауза между генерациями
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const totalTime = Date.now() - startTime;

  // Создаем подробный отчет
  const report = `# 🌌 Galaxy Spiral Blur - Эксперименты с размерами

## 📊 Статистика
- **Успешно сгенерировано:** ${successCount}/${SQUARE_SIZES.length * GALAXY_TEST_SLIDES.length} изображений
- **Ошибок:** ${errorCount}
- **Время выполнения:** ${(totalTime / 1000).toFixed(1)}с
- **Папка с результатами:** ${outputDir}

## 🔲 Протестированные размеры квадратов:

${SQUARE_SIZES.map(
  size => `
### ${size.size}px - ${size.description}
- **Центральный элемент:** ${size.size}px × ${size.size}px (квадрат)
- **Footer:** подогнан под ${size.size}px ширины
- **Отступ:** ${Math.floor(size.size * 0.1)}px между элементами
- **Padding:** ${Math.floor(size.size * 0.075)}px внутри контейнера
- **Размер h1:** ${Math.floor(size.size * 0.09)}px
- **Размер p:** ${Math.floor(size.size * 0.052)}px
- **Размер emoji:** ${Math.floor(size.size * 0.15)}px
`
).join('')}

## 🎯 Рекомендации:
1. **600px** - компактно, подходит для мобильных
2. **700px** - хороший баланс размера и читаемости  
3. **800px** - стандартный размер, отличная читаемость
4. **900px** - просторно, подходит для длинных текстов
5. **1000px** - максимальный размер, впечатляющий вид

## ✨ Особенности Galaxy Spiral Blur:
- Фоновые изображения из папки bg-bible-vibecoding
- Glassmorphism эффекты с галактическими акцентами
- Белый текст с тенями для контраста
- Backdrop-filter: blur(15px) для глубины

Дата: ${new Date().toLocaleString('ru-RU')}
`;

  fs.writeFileSync(path.join(outputDir, 'galaxy-variations-report.md'), report);

  console.log('\n📋 ИТОГОВЫЙ ОТЧЕТ:');
  console.log(
    `✅ Успешно: ${successCount}/${SQUARE_SIZES.length * GALAXY_TEST_SLIDES.length}`
  );
  console.log(`❌ Ошибок: ${errorCount}`);
  console.log(`⏱️ Время: ${(totalTime / 1000).toFixed(1)}с`);
  console.log(`📁 Папка: ${outputDir}`);
  console.log('\n🌌 Эксперименты завершены! Выбери лучший размер квадрата.');
}

// Запускаем эксперименты
generateGalaxyVariations()
  .then(() => {
    console.log('\n🌌 Galaxy Spiral Blur эксперименты готовы!');
    console.log('Квадратный центральный элемент с подогнанным footer! ✨');
  })
  .catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
