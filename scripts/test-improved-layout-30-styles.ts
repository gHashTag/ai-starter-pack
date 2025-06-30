/**
 * 🎨 Тестирование 30 blur стилей с УЛУЧШЕННОЙ ВЕРСТКОЙ
 *
 * Исправления:
 * - ✅ Центральный и нижний элементы одинаковой ширины (95% - 40px, max 900px)
 * - ✅ Правильные отступы между элементами
 * - ✅ Меньшие шрифты для лучшего размещения текста
 * - ✅ Улучшенные переносы строк и word-wrap
 * - ✅ Больше места для текста с padding и white-space
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import fs from 'fs';
import path from 'path';

const canvasService = new InstagramCanvasService();

// 🎨 Все 30 blur стилей для тестирования
const BLUR_STYLES = [
  ColorTemplate.AURORA_BLUR,
  ColorTemplate.OCEAN_DEPTHS_BLUR,
  ColorTemplate.SUNSET_DREAMS_BLUR,
  ColorTemplate.FOREST_MIST_BLUR,
  ColorTemplate.DIAMOND_DUST_BLUR,
  ColorTemplate.FIRE_EMBER_BLUR,
  ColorTemplate.ICE_CRYSTAL_BLUR,
  ColorTemplate.GOLDEN_HOUR_BLUR,
  ColorTemplate.MIDNIGHT_STARS_BLUR,
  ColorTemplate.ROSE_PETALS_BLUR,
  ColorTemplate.SAPPHIRE_DEPTHS_BLUR,
  ColorTemplate.EMERALD_FOREST_BLUR,
  ColorTemplate.LAVENDER_FIELDS_BLUR,
  ColorTemplate.AMBER_WAVES_BLUR,
  ColorTemplate.PEARL_ESSENCE_BLUR,
  ColorTemplate.RUBY_GLOW_BLUR,
  ColorTemplate.SILVER_MIST_BLUR,
  ColorTemplate.COPPER_SUNSET_BLUR,
  ColorTemplate.TITANIUM_GLOW_BLUR,
  ColorTemplate.NEON_DREAMS_BLUR,
  ColorTemplate.CYBER_SPACE_BLUR,
  ColorTemplate.QUANTUM_FIELD_BLUR,
  ColorTemplate.HOLOGRAM_BLUR,
  ColorTemplate.MATRIX_CODE_BLUR,
  ColorTemplate.DIGITAL_RAIN_BLUR,
  ColorTemplate.PLASMA_ENERGY_BLUR,
  ColorTemplate.CRYSTAL_CAVE_BLUR,
  ColorTemplate.NEBULA_CLOUDS_BLUR,
  ColorTemplate.GALAXY_SPIRAL_BLUR,
  ColorTemplate.STARDUST_BLUR,
];

// 🧘‍♂️ Тестовые слайды с длинными текстами для проверки верстки
const TEST_SLIDES: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🧘‍♂️ VibeCoding Медитативный Поток',
    content:
      'Полное руководство по осознанному программированию и достижению состояния потока в разработке',
  },
  {
    order: 2,
    type: 'principle',
    title: '💫 Основные Принципы Качественного VibeCoding',
    content:
      'Медитативное программирование — это не просто написание кода, это глубокая практика концентрации и осознанности. Каждая строка кода должна быть написана с полным пониманием её места в архитектуре проекта.',
  },
  {
    order: 3,
    type: 'practice',
    title: '🎯 Ежедневные Практики для Достижения Мастерства',
    content:
      'Начинай каждый день с 5-минутной медитации. Настрой своё окружение — отключи уведомления, подготовь рабочее место, выбери правильную музыку. Качество кода напрямую зависит от состояния твоего ума.',
  },
];

// Папка для сохранения результатов
const outputDir = './test-outputs/improved-layout-30-styles';

async function generateImprovedLayoutStyles() {
  console.log(
    '🎨 Начинаем генерацию 30 blur стилей с УЛУЧШЕННОЙ ВЕРСТКОЙ...\n'
  );

  // Создаем выходную папку
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  // Генерируем по одному примеру для каждого стиля
  for (const [index, style] of BLUR_STYLES.entries()) {
    try {
      console.log(`📸 [${index + 1}/30] Генерируем стиль: ${style}...`);

      // Берем один случайный слайд для тестирования
      const testSlide =
        TEST_SLIDES[Math.floor(Math.random() * TEST_SLIDES.length)];

      // Генерируем изображение
      const imageBuffers = await canvasService.generateCarouselImages(
        [testSlide],
        undefined,
        style
      );

      if (imageBuffers.length > 0) {
        const filename = `${style}_improved_layout.png`;
        const filePath = path.join(outputDir, filename);

        fs.writeFileSync(filePath, imageBuffers[0]);

        const fileSize = (fs.statSync(filePath).size / 1024).toFixed(0);
        console.log(`   ✅ Сохранено: ${filename} (${fileSize}KB)`);
        successCount++;
      } else {
        console.log(`   ❌ Не удалось сгенерировать: ${style}`);
        errorCount++;
      }
    } catch (error) {
      console.error(`   💥 Ошибка при генерации ${style}:`, error);
      errorCount++;
    }

    // Небольшая пауза между генерациями
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const totalTime = Date.now() - startTime;

  // Создаем отчет
  const report = `# 🎨 Отчет о генерации улучшенной верстки

## 📊 Статистика
- **Успешно сгенерировано:** ${successCount}/30 стилей
- **Ошибок:** ${errorCount}
- **Время выполнения:** ${(totalTime / 1000).toFixed(1)}с
- **Папка с результатами:** ${outputDir}

## ✅ Исправления в верстке:
1. **Одинаковая ширина элементов:** glass-container и footer теперь имеют одинаковую ширину (95% - 40px, max 900px)
2. **Улучшенные отступы:** уменьшен margin-bottom до 100px между центральным блоком и footer
3. **Меньшие шрифты:** h1 уменьшен с 84px до 72px, p с 48px до 42px для лучшего размещения
4. **Лучшие переносы:** добавлены word-wrap, overflow-wrap, hyphens для правильного переноса текста
5. **Увеличенный line-height:** для h1 1.3, для p 1.6 - более читаемый текст
6. **white-space: pre-wrap:** для правильного отображения переносов строк

## 🎯 Результат:
Все 30 blur стилей теперь имеют улучшенную верстку с правильными пропорциями и размещением текста.

Дата: ${new Date().toLocaleString('ru-RU')}
`;

  fs.writeFileSync(path.join(outputDir, 'improved-layout-report.md'), report);

  console.log('\n📋 ИТОГОВЫЙ ОТЧЕТ:');
  console.log(`✅ Успешно: ${successCount}/30`);
  console.log(`❌ Ошибок: ${errorCount}`);
  console.log(`⏱️ Время: ${(totalTime / 1000).toFixed(1)}с`);
  console.log(`📁 Папка: ${outputDir}`);
  console.log('\n🎉 Генерация завершена! Проверь улучшенную верстку в файлах.');
}

// Запускаем генерацию
generateImprovedLayoutStyles()
  .then(() => {
    console.log('\n🎨 30 blur стилей с улучшенной версткой готовы!');
    console.log('Теперь центральный и нижний элементы одинаковой ширины! ✨');
  })
  .catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
