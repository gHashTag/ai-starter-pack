/**
 * 🧪 Прямое тестирование функции генерации карусели
 *
 * Этот скрипт тестирует функцию напрямую, без Telegram и Inngest
 */

import { CarouselContentGeneratorService } from '../src/services/carousel-content-generator.service';
import { InstagramCanvasService } from '../src/services/instagram-canvas.service';

async function testCarouselDirect() {
  console.log('🎨 Прямое тестирование генерации карусели...\n');

  try {
    const topic = 'медитативное программирование';
    console.log(`📝 Тестируем тему: "${topic}"`);

    // Шаг 1: Генерация контента
    console.log('\n🔍 Шаг 1: Генерация контента слайдов...');
    const contentGenerator = new CarouselContentGeneratorService();

    const slides = await contentGenerator.generateCarouselSlides(topic);

    if (!slides || slides.length === 0) {
      throw new Error('Не удалось сгенерировать слайды');
    }

    console.log(`✅ Сгенерировано ${slides.length} слайдов:`);
    slides.forEach((slide, index) => {
      console.log(`  ${index + 1}. ${slide.title} (${slide.type})`);
    });

    // Шаг 2: Генерация изображений
    console.log('\n🎨 Шаг 2: Генерация изображений...');
    const canvasService = new InstagramCanvasService();

    const imagePaths = await canvasService.generateCarouselImageFiles(slides);

    console.log(`✅ Сгенерировано ${imagePaths.length} изображений:`);
    imagePaths.forEach((path, index) => {
      console.log(`  ${index + 1}. ${path}`);
    });

    // Шаг 3: Проверка файлов
    console.log('\n📁 Шаг 3: Проверка созданных файлов...');
    const fs = await import('fs/promises');

    for (const imagePath of imagePaths) {
      try {
        const stats = await fs.stat(imagePath);
        console.log(`  ✅ ${imagePath} (${Math.round(stats.size / 1024)} KB)`);
      } catch (error) {
        console.log(`  ❌ ${imagePath} - файл не найден`);
      }
    }

    console.log('\n🎉 Прямое тестирование завершено успешно!');
    console.log(
      `📊 Результат: ${slides.length} слайдов, ${imagePaths.length} изображений`
    );

    return {
      success: true,
      slidesCount: slides.length,
      imagesCount: imagePaths.length,
      imagePaths,
      slides: slides.map(slide => ({
        title: slide.title,
        type: slide.type,
        order: slide.order,
      })),
    };
  } catch (error) {
    console.error('\n❌ Ошибка при прямом тестировании:', error);

    if (error instanceof Error) {
      console.error('📝 Сообщение ошибки:', error.message);
      console.error('🔍 Стек ошибки:', error.stack);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Запускаем тест
testCarouselDirect()
  .then(result => {
    console.log('\n📋 Финальный результат:', JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });
