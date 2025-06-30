import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import path from 'path';
import fs from 'fs';

// 🌌 Простой слайд для тестирования
const testSlide: CarouselSlide = {
  order: 1,
  type: 'title',
  title: '🌌 Тест Base64 Фонов',
  content:
    'Проверяем фоновые изображения через base64 encoding для правильного отображения',
};

async function testBlurWithBase64() {
  console.log('🎨 Тестируем blur с base64 фоновыми изображениями...\n');

  const canvasService = new InstagramCanvasService();
  const outputDir = './test-outputs/blur-base64-test';

  // Создаем директорию для результатов
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 📸 Получаем одно изображение и конвертируем в base64
  const imagePath = path.resolve(
    './assets/bg-bible-vibecoding/u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_11aa5b66-5b68-422f-b68f-03121eea5b93_0.png'
  );

  if (!fs.existsSync(imagePath)) {
    console.error('❌ Изображение не найдено:', imagePath);
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const dataUri = `data:image/png;base64,${base64Image}`;

  console.log(`📸 Изображение загружено: ${path.basename(imagePath)}`);
  console.log(`📊 Размер: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
  console.log(`🔗 Base64 длина: ${base64Image.length} символов\n`);

  // Временно модифицируем HTML template, чтобы использовать base64
  const originalGenerateHtml = (canvasService as any).generateHtmlTemplate;

  (canvasService as any).generateHtmlTemplate = function (
    slide: any,
    totalSlides: any,
    colorTemplate: any,
    customStyle: any
  ) {
    const htmlContent = originalGenerateHtml.call(
      this,
      slide,
      totalSlides,
      colorTemplate,
      customStyle
    );

    // Заменяем placeholder на реальный base64
    if (colorTemplate === ColorTemplate.COSMIC_BLUR) {
      return htmlContent.replace(
        /background: url\('file:\/\/[^']+'\) center\/cover no-repeat/g,
        `background: url('${dataUri}') center/cover no-repeat`
      );
    }

    return htmlContent;
  };

  try {
    console.log('✨ Создаем изображение с base64 фоном...');

    const imageBuffers = await canvasService.generateCarouselImages(
      [testSlide],
      undefined,
      ColorTemplate.COSMIC_BLUR
    );

    // Сохраняем результат
    const resultPath = path.join(outputDir, 'base64-background-test.png');
    fs.writeFileSync(resultPath, imageBuffers[0]);

    const fileSizeKB = Math.round(imageBuffers[0].length / 1024);
    console.log(`  💾 Сохранен: base64-background-test.png (${fileSizeKB}KB)`);

    console.log(`\n🎉 Тест с base64 завершен!`);
    console.log(`📁 Результат в: ${path.resolve(resultPath)}`);
    console.log(`\n💡 Проверьте изображение - фон должен быть виден!`);
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error);
  } finally {
    // Восстанавливаем оригинальный метод
    (canvasService as any).generateHtmlTemplate = originalGenerateHtml;
  }
}

testBlurWithBase64().catch(console.error);
