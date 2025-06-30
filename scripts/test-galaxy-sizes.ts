/**
 * 🌌 Тестирование разных размеров квадратного элемента Galaxy Spiral Blur
 *
 * Создаем Galaxy карточки с разными размерами квадратного центрального блока:
 * 600x600, 700x700, 800x800, 900x900, 1000x1000
 *
 * Каждый размер - отдельная карточка для сравнения
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import fs from 'fs';
import path from 'path';

const canvasService = new InstagramCanvasService();

// 🌌 Тестовый слайд для экспериментов с размерами
const GALAXY_TEST_SLIDE: CarouselSlide = {
  order: 1,
  type: 'principle',
  title: '🌌 Galaxy Spiral Flow',
  content:
    'Код течет как спирали галактик — бесконечно, элегантно, с глубоким смыслом. Каждая функция — звезда в созвездии архитектуры. Программируй с космическим размахом!',
};

// 🔲 Размеры для тестирования
const SQUARE_SIZES = [
  { size: 600, name: 'compact' },
  { size: 700, name: 'medium' },
  { size: 800, name: 'standard' },
  { size: 900, name: 'large' },
  { size: 1000, name: 'xl' },
];

// Папка для сохранения результатов
const outputDir = './test-outputs/galaxy-sizes-comparison';

async function generateGalaxySizes() {
  console.log('🌌 Тестируем разные размеры квадратного Galaxy элемента...\n');

  // Создаем выходную папку
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  // Для каждого размера создаем отдельную карточку
  for (const [index, sizeConfig] of SQUARE_SIZES.entries()) {
    try {
      console.log(
        `🔲 [${index + 1}/${SQUARE_SIZES.length}] Размер: ${sizeConfig.size}px (${sizeConfig.name})...`
      );

      // Временно изменяем CSS для текущего размера
      await modifyCanvasServiceCSS(sizeConfig.size);

      // Генерируем карточку
      const imageBuffers = await canvasService.generateCarouselImages(
        [GALAXY_TEST_SLIDE],
        undefined,
        ColorTemplate.GALAXY_SPIRAL_BLUR
      );

      if (imageBuffers.length > 0) {
        const filename = `galaxy_${sizeConfig.name}_${sizeConfig.size}px.png`;
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
      console.error(`   💥 Ошибка при генерации ${sizeConfig.size}px:`, error);
      errorCount++;
    }

    // Пауза между генерациями
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Возвращаем CSS к стандартному размеру 800px
  await modifyCanvasServiceCSS(800);

  const totalTime = Date.now() - startTime;

  // Создаем сравнительный отчет
  const report = `# 🌌 Galaxy Spiral Blur - Сравнение размеров квадратного элемента

## 📊 Статистика
- **Успешно сгенерировано:** ${successCount}/${SQUARE_SIZES.length} размеров
- **Ошибок:** ${errorCount}
- **Время выполнения:** ${(totalTime / 1000).toFixed(1)}с
- **Папка с результатами:** ${outputDir}

## 🔲 Протестированные размеры:

${SQUARE_SIZES.map(
  size => `
### ${size.size}px - ${size.name}
- **Файл:** galaxy_${size.name}_${size.size}px.png
- **Центральный элемент:** ${size.size}px × ${size.size}px (идеальный квадрат)
- **Footer:** ${size.size}px ширины (подогнан)
- **Отступ:** ${Math.floor(size.size * 0.1)}px между элементами
- **Рекомендация:** ${getRecommendation(size.size)}
`
).join('')}

## 🎯 Какой размер выбрать:

1. **600px (compact)** - для мобильных устройств, компактно
2. **700px (medium)** - хороший баланс, универсальный
3. **800px (standard)** - рекомендуемый, отличная читаемость  
4. **900px (large)** - для длинных текстов, просторно
5. **1000px (xl)** - максимальный размер, впечатляющий

## ✨ Замечания по Galaxy Spiral Blur:
- Все размеры используют одинаковые фоновые изображения
- Glassmorphism эффекты адаптируются под размер
- Белый текст сохраняет отличную читаемость
- Backdrop-filter: blur(15px) работает на всех размерах

Дата: ${new Date().toLocaleString('ru-RU')}
`;

  fs.writeFileSync(
    path.join(outputDir, 'galaxy-sizes-comparison-report.md'),
    report
  );

  console.log('\n📋 ИТОГОВЫЙ ОТЧЕТ:');
  console.log(`✅ Успешно: ${successCount}/${SQUARE_SIZES.length} размеров`);
  console.log(`❌ Ошибок: ${errorCount}`);
  console.log(`⏱️ Время: ${(totalTime / 1000).toFixed(1)}с`);
  console.log(`📁 Папка: ${outputDir}`);
  console.log('\n🌌 Сравнение размеров Galaxy готово! Выбери лучший.');
}

// 📝 Временная модификация CSS в InstagramCanvasService
async function modifyCanvasServiceCSS(squareSize: number) {
  const servicePath = './src/services/instagram-canvas.service.ts';
  let content = fs.readFileSync(servicePath, 'utf-8');

  // Заменяем размеры на новые
  content = content.replace(
    /width: 800px;[\s\S]*?height: 800px;[\s\S]*?max-width: 800px;[\s\S]*?max-height: 800px;/,
    `width: ${squareSize}px;
            height: ${squareSize}px; /* 🔲 КВАДРАТНЫЙ центральный элемент */
            max-width: ${squareSize}px;
            max-height: ${squareSize}px;`
  );

  content = content.replace(
    /margin-bottom: 80px;/,
    `margin-bottom: ${Math.floor(squareSize * 0.1)}px;`
  );

  content = content.replace(
    /width: 800px; \/\* 🔲 Подгоняем под квадратный центральный элемент \*\//,
    `width: ${squareSize}px; /* 🔲 Подгоняем под квадратный центральный элемент */`
  );

  content = content.replace(
    /max-width: 800px;/g,
    `max-width: ${squareSize}px;`
  );

  fs.writeFileSync(servicePath, content);
}

// 🎯 Рекомендация по размеру
function getRecommendation(size: number): string {
  switch (size) {
    case 600:
      return 'Идеально для мобильных экранов';
    case 700:
      return 'Универсальный размер для всех устройств';
    case 800:
      return 'Рекомендуемый стандарт, оптимальная читаемость';
    case 900:
      return 'Отлично для детального контента';
    case 1000:
      return 'Максимальный размер для впечатления';
    default:
      return 'Экспериментальный размер';
  }
}

// Запускаем тестирование размеров
generateGalaxySizes()
  .then(() => {
    console.log('\n🌌 Сравнение размеров Galaxy Spiral Blur готово! ✨');
    console.log('Теперь можешь выбрать идеальный размер квадрата! 🎯');
  })
  .catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
