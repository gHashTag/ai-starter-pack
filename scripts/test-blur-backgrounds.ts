import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import path from 'path';
import fs from 'fs';

// 🌌 Тестовые слайды для демонстрации blur эффектов
const testSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🌌 Blur Эффекты',
    content: 'Демонстрация blur эффектов поверх фоновых изображений',
  },
  {
    order: 2,
    type: 'principle',
    title: '🔮 Мистический Blur',
    content:
      'Создание атмосферного эффекта размытия поверх космических изображений для усиления визуального воздействия',
  },
  {
    order: 3,
    type: 'practice',
    title: '✨ Эфирный Эффект',
    content:
      'Сочетание золотых акцентов с размытыми фоновыми изображениями создает уникальный эфирный стиль',
  },
  {
    order: 4,
    type: 'summary',
    title: '🌠 Небесный Стиль',
    content:
      'Использование различных уровней размытия для создания глубины и фокуса на контенте',
  },
];

// 🎨 Blur стили для тестирования
const blurStyles = [
  {
    template: ColorTemplate.COSMIC_BLUR,
    name: 'cosmic-blur',
    description: '🌌 Космический Blur - белые акценты на темном фоне',
  },
  {
    template: ColorTemplate.MYSTIC_BLUR,
    name: 'mystic-blur',
    description: '🔮 Мистический Blur - фиолетовые акценты и средний blur',
  },
  {
    template: ColorTemplate.ETHEREAL_BLUR,
    name: 'ethereal-blur',
    description: '✨ Эфирный Blur - золотые акценты и сильный blur',
  },
  {
    template: ColorTemplate.CELESTIAL_BLUR,
    name: 'celestial-blur',
    description: '🌠 Небесный Blur - синие акценты и сбалансированный blur',
  },
];

async function generateBlurTests() {
  console.log('🎨 Генерация тестовых blur карточек...');

  const canvasService = new InstagramCanvasService();
  const outputDir = path.resolve('./test-outputs/blur-effects');

  // Создаем папку для результатов
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const style of blurStyles) {
    console.log(`\n🔄 Генерация стиля: ${style.name}`);
    console.log(`📝 ${style.description}`);

    try {
      // Генерируем 4 слайда для каждого стиля
      const images = await canvasService.generateCarouselImages(
        testSlides,
        undefined,
        style.template
      );

      // Сохраняем изображения
      for (let i = 0; i < images.length; i++) {
        const filename = `${style.name}_slide_${i + 1}.png`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, images[i]);

        console.log(`✅ Сохранено: ${filename}`);
      }

      console.log(`🎉 Стиль ${style.name} завершен!`);
    } catch (error) {
      console.error(`❌ Ошибка генерации стиля ${style.name}:`, error);
    }
  }

  console.log('\n🎨 Все blur стили сгенерированы!');
  console.log(`📁 Результаты сохранены в: ${outputDir}`);

  // Выводим анализ результатов
  console.log('\n📊 Анализ сгенерированных стилей:');
  blurStyles.forEach(style => {
    console.log(`\n${style.description}`);
    console.log(
      `- Файлы: ${style.name}_slide_1.png - ${style.name}_slide_4.png`
    );
    console.log(`- Особенности: Случайный фон из папки bg-bible-vibecoding`);
    console.log(`- Blur эффект: Различная интенсивность размытия`);
    console.log(`- Акценты: Уникальные цветовые схемы`);
  });
}

// 🚀 Запуск генерации
generateBlurTests().catch(console.error);
