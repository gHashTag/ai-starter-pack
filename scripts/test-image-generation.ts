import { InstagramCanvasService } from '../src/services/instagram-canvas.service';
import { CarouselSlide } from '../src/types';
import fs from 'fs';
import path from 'path';

async function testImageGeneration() {
  console.log('🎨 ТЕСТ: Генерация одного изображения для Instagram...');

  try {
    // Создаем сервис генерации изображений
    const canvasService = new InstagramCanvasService();

    // Создаем тестовый слайд
    const testSlide: CarouselSlide = {
      type: 'title',
      title: '🚀 VIBECODING',
      content:
        '🧘‍♂️ Медитативное программирование\n\n⚡ Осознанный подход к коду\n\n🎯 Профессиональная разработка',
      order: 1,
    };

    console.log('📝 Создан тестовый слайд:', testSlide.title);

    // Генерируем изображение
    console.log('🖼️ Генерирую изображение 1080x1350...');
    const imageBuffers = await canvasService.generateCarouselImages([
      testSlide,
    ]);

    if (imageBuffers && imageBuffers.length > 0) {
      // Сохраняем изображение
      const outputPath = path.join(process.cwd(), 'test-output');
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const imagePath = path.join(outputPath, 'test-vibecoding-slide.png');
      fs.writeFileSync(imagePath, imageBuffers[0]);

      const stats = fs.statSync(imagePath);

      console.log('✅ УСПЕХ! Изображение создано:');
      console.log(`📁 Путь: ${imagePath}`);
      console.log(`📊 Размер: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`🎨 Разрешение: 1080x1350 (Instagram Story)`);
      console.log('\n🚀 ТЕХНОЛОГИЯ РАБОТАЕТ! Можно создавать карусели!');
    } else {
      console.error('❌ Изображение не создано - пустой буфер');
    }
  } catch (error) {
    console.error('❌ ОШИБКА при генерации изображения:');
    console.error(error);
  }
}

// Запускаем тест
testImageGeneration();
