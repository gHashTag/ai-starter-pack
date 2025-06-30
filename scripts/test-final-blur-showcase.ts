import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';
import path from 'path';
import fs from 'fs';

// 🌌 Красивые слайды для демонстрации blur эффектов
const showcaseSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🌌 VibeCoding с Blur Эффектами',
    content:
      'Инновационные карточки с фоновыми изображениями и glassmorphism эффектами для максимального визуального воздействия',
  },
  {
    order: 2,
    type: 'principle',
    title: '🔮 Мистика Кода',
    content:
      'Программирование — это искусство создания цифровых миров. Каждый алгоритм — это заклинание, каждая функция — магический ритуал, превращающий идеи в реальность.',
  },
  {
    order: 3,
    type: 'practice',
    title: '✨ Практика Просветления',
    content:
      'Медитируй перед кодингом. Войди в состояние потока. Позволь коду течь через тебя, как река мудрости. Каждая строка должна нести гармонию и красоту.',
  },
];

async function finalBlurShowcase() {
  console.log('🎨 Создаем финальную демонстрацию blur эффектов...\n');

  const canvasService = new InstagramCanvasService();
  const outputDir = './test-outputs/final-blur-showcase';

  // Создаем директорию для результатов
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 🌈 Все 4 blur стиля
  const blurStyles = [
    {
      template: ColorTemplate.COSMIC_BLUR,
      name: 'cosmic-final',
      title: '🌌 Космический Blur',
      description: 'Белые акценты с космическими фонами',
    },
    {
      template: ColorTemplate.MYSTIC_BLUR,
      name: 'mystic-final',
      title: '🔮 Мистический Blur',
      description: 'Фиолетовые акценты с магическими фонами',
    },
    {
      template: ColorTemplate.ETHEREAL_BLUR,
      name: 'ethereal-final',
      title: '✨ Эфирный Blur',
      description: 'Золотые акценты с эфирными фонами',
    },
    {
      template: ColorTemplate.CELESTIAL_BLUR,
      name: 'celestial-final',
      title: '🌠 Небесный Blur',
      description: 'Синие акценты с небесными фонами',
    },
  ];

  for (const style of blurStyles) {
    console.log(`✨ Создаем ${style.title}...`);
    console.log(`   📝 ${style.description}`);

    // Генерируем полную карусель (3 слайда)
    const imageBuffers = await canvasService.generateCarouselImages(
      showcaseSlides,
      undefined,
      style.template
    );

    // Сохраняем каждый слайд
    for (let i = 0; i < imageBuffers.length; i++) {
      const slidePath = path.join(
        outputDir,
        `${style.name}_slide_${i + 1}.png`
      );
      fs.writeFileSync(slidePath, imageBuffers[i]);

      const fileSizeKB = Math.round(imageBuffers[i].length / 1024);
      console.log(
        `  💾 Слайд ${i + 1}: ${style.name}_slide_${i + 1}.png (${fileSizeKB}KB)`
      );
    }

    console.log(''); // Пустая строка для красоты
  }

  console.log(`🎉 Финальная демонстрация завершена!`);
  console.log(`📁 Результаты в: ${path.resolve(outputDir)}`);
  console.log(
    `\n🌟 Создано ${blurStyles.length * showcaseSlides.length} изображений с фоновыми картинками!`
  );
  console.log(
    `💡 Теперь фоновые изображения из папки bg-bible-vibecoding точно видны под blur эффектом!`
  );
}

finalBlurShowcase().catch(console.error);
