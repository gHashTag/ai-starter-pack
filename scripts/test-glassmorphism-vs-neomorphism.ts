import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service.js';
import { CarouselSlide } from '../src/types.js';

async function testGlassmorphismVsNeomorphism() {
  console.log('🔥 Тестируем сравнение стилей: Glassmorphism vs Neomorphism');

  const canvasService = new InstagramCanvasService();

  // Создаем тестовый слайд
  const testSlide: CarouselSlide = {
    order: 1,
    type: 'title',
    title: '💎 Сравнение стилей',
    content: 'Фотореализм стекла\\nпротив медитативного\\nsoft UI дизайна',
    subtitle: '#glassmorphism #neomorphism #design',
  };

  try {
    console.log('📸 Генерируем Glassmorphism...');

    // 1. Glassmorphism
    const glassmorphismBuffers = await canvasService.generateCarouselImages(
      [testSlide],
      undefined,
      ColorTemplate.MODERN_GLASSMORPHISM
    );

    console.log('📸 Генерируем Neomorphism...');

    // 2. Neomorphism
    const neomorphismBuffers = await canvasService.generateCarouselImages(
      [testSlide],
      undefined,
      ColorTemplate.NEOMORPHISM
    );

    // Сохраняем результаты для сравнения
    const fs = await import('fs');

    await fs.promises.writeFile(
      'glassmorphism-comparison.png',
      glassmorphismBuffers[0]
    );

    await fs.promises.writeFile(
      'neomorphism-comparison.png',
      neomorphismBuffers[0]
    );

    console.log('✅ Результаты сравнения:');
    console.log('💎 Glassmorphism:', 'glassmorphism-comparison.png');
    console.log('🧘‍♂️ Neomorphism:', 'neomorphism-comparison.png');
    console.log('');
    console.log('🔍 Различия стилей:');
    console.log('💎 Glassmorphism: Фотореализм, темный фон, кодовая подложка');
    console.log('🧘‍♂️ Neomorphism: Soft UI, светлый фон, тактильные тени');
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error);
  }
}

// Запускаем тест
if (import.meta.url === `file://${process.argv[1]}`) {
  testGlassmorphismVsNeomorphism();
}

export { testGlassmorphismVsNeomorphism };
