/**
 * 🎨 Тестирование 30 новых blur стилей
 *
 * Генерирует примеры карточек со всеми 30 новыми blur эффектами
 * для выбора лучшего стиля.
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import fs from 'fs';
import path from 'path';

const canvasService = new InstagramCanvasService();

// 🎨 Все 30 новых blur стилей для тестирования
const NEW_BLUR_STYLES = [
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

// 📝 Тестовые слайды для демонстрации стилей
const testSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🎨 VibeCoding Стили',
    content: 'Выбери свой идеальный blur эффект для карточек',
  },
  {
    order: 2,
    type: 'principle',
    title: '💫 Медитативное Программирование',
    content: 'Создавай код в состоянии потока и внутренней гармонии',
  },
  {
    order: 3,
    type: 'practice',
    title: '🧘‍♂️ Практика Осознанности',
    content: 'Каждая строка кода - шаг к совершенству',
  },
];

async function generateAllBlurStyles() {
  console.log('🎨 Генерируем 30 новых blur стилей...');

  // Создаем директорию для результатов
  const outputDir = './test-outputs/30-blur-styles';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Статистика
  let successCount = 0;
  let errorCount = 0;
  const generatedFiles: string[] = [];

  // Генерируем для каждого стиля
  for (const style of NEW_BLUR_STYLES) {
    try {
      const templates = InstagramCanvasService.getColorTemplates();
      const styleName = templates[style]?.name || style;

      console.log(`📸 Генерируем стиль: ${styleName}`);

      // Генерируем изображения для всех 3 слайдов
      const imageBuffers = await canvasService.generateCarouselImages(
        testSlides,
        undefined,
        style
      );

      // Сохраняем каждый слайд
      for (let i = 0; i < imageBuffers.length; i++) {
        const fileName = `${style}_slide_${i + 1}.png`;
        const filePath = path.join(outputDir, fileName);

        fs.writeFileSync(filePath, imageBuffers[i]);
        generatedFiles.push(fileName);

        // Проверяем размер файла
        const stats = fs.statSync(filePath);
        const fileSizeKB = Math.round(stats.size / 1024);

        console.log(`  ✅ ${fileName} (${fileSizeKB}KB)`);
      }

      successCount++;

      // Пауза между стилями для стабильности
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Ошибка при генерации стиля ${style}:`, error);
      errorCount++;
    }
  }

  // 📊 Финальная статистика
  console.log('\n🎉 Генерация завершена!');
  console.log(`✅ Успешно: ${successCount}/${NEW_BLUR_STYLES.length} стилей`);
  console.log(`❌ Ошибки: ${errorCount} стилей`);
  console.log(`📁 Файлы сохранены в: ${outputDir}`);
  console.log(`🖼️ Всего файлов: ${generatedFiles.length}`);

  // Создаем отчет
  const reportPath = path.join(outputDir, 'generation-report.md');
  const report = `# 🎨 Отчет по генерации 30 blur стилей

## 📊 Статистика
- **Всего стилей:** ${NEW_BLUR_STYLES.length}
- **Успешно:** ${successCount}
- **Ошибки:** ${errorCount}
- **Всего файлов:** ${generatedFiles.length}

## 📋 Сгенерированные стили

${NEW_BLUR_STYLES.map((style, index) => {
  const templates = InstagramCanvasService.getColorTemplates();
  const styleName = templates[style]?.name || style;
  return `${index + 1}. **${styleName}** (\`${style}\`)`;
}).join('\n')}

## 📁 Структура файлов

${generatedFiles.map(file => `- ${file}`).join('\n')}

---
*Сгенерировано: ${new Date().toLocaleString('ru-RU')}*
`;

  fs.writeFileSync(reportPath, report);
  console.log(`📋 Отчет сохранен: ${reportPath}`);

  return {
    successCount,
    errorCount,
    totalFiles: generatedFiles.length,
    outputDir,
    generatedFiles,
  };
}

// Запускаем генерацию
generateAllBlurStyles()
  .then(() => {
    console.log('\n🎨 30 blur стилей готовы для выбора!');
    console.log('Теперь можешь просмотреть все варианты и выбрать лучший! ✨');
  })
  .catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
