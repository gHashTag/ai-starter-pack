import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service.js';
import { CarouselSlide } from '../src/types.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🧪 A/B Testing для стилей карточек
 * Генерируем 30 вариантов Neomorphism и 30 вариантов Glassmorphism
 */

// 🧘‍♂️ Вариации Neomorphism стилей
const NEOMORPHISM_VARIATIONS = [
  // Базовые цветовые схемы
  {
    name: 'Классический серый',
    bg: 'linear-gradient(145deg, #e0e0e0 0%, #f5f5f5 100%)',
    card: 'rgba(230, 230, 230, 0.9)',
  },
  {
    name: 'Теплый серый',
    bg: 'linear-gradient(145deg, #e8e6e3 0%, #f7f5f2 100%)',
    card: 'rgba(238, 236, 233, 0.9)',
  },
  {
    name: 'Холодный серый',
    bg: 'linear-gradient(145deg, #dee2e6 0%, #f1f3f4 100%)',
    card: 'rgba(228, 232, 236, 0.9)',
  },
  {
    name: 'Молочный',
    bg: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
    card: 'rgba(248, 249, 250, 0.95)',
  },
  {
    name: 'Кремовый',
    bg: 'linear-gradient(145deg, #faf8f5 0%, #ffffff 100%)',
    card: 'rgba(250, 248, 245, 0.95)',
  },

  // Светлые оттенки
  {
    name: 'Светло-бежевый',
    bg: 'linear-gradient(145deg, #f5f4f2 0%, #fdfcfa 100%)',
    card: 'rgba(245, 244, 242, 0.9)',
  },
  {
    name: 'Жемчужный',
    bg: 'linear-gradient(145deg, #f0f2f0 0%, #f8faf8 100%)',
    card: 'rgba(240, 242, 240, 0.9)',
  },
  {
    name: 'Слоновая кость',
    bg: 'linear-gradient(145deg, #f6f4f0 0%, #fefcf8 100%)',
    card: 'rgba(246, 244, 240, 0.9)',
  },
  {
    name: 'Дымчатый',
    bg: 'linear-gradient(145deg, #e9e9e9 0%, #f4f4f4 100%)',
    card: 'rgba(233, 233, 233, 0.9)',
  },
  {
    name: 'Платиновый',
    bg: 'linear-gradient(145deg, #ebebeb 0%, #f6f6f6 100%)',
    card: 'rgba(235, 235, 235, 0.9)',
  },

  // Более темные вариации
  {
    name: 'Средний серый',
    bg: 'linear-gradient(145deg, #d6d6d6 0%, #ebebeb 100%)',
    card: 'rgba(214, 214, 214, 0.9)',
  },
  {
    name: 'Графитовый',
    bg: 'linear-gradient(145deg, #d0d0d0 0%, #e5e5e5 100%)',
    card: 'rgba(208, 208, 208, 0.9)',
  },
  {
    name: 'Каменный',
    bg: 'linear-gradient(145deg, #dadada 0%, #efefef 100%)',
    card: 'rgba(218, 218, 218, 0.9)',
  },
  {
    name: 'Металлик',
    bg: 'linear-gradient(145deg, #dcdcdc 0%, #f1f1f1 100%)',
    card: 'rgba(220, 220, 220, 0.9)',
  },
  {
    name: 'Облачный',
    bg: 'linear-gradient(145deg, #e5e5e5 0%, #f0f0f0 100%)',
    card: 'rgba(229, 229, 229, 0.9)',
  },

  // Тонированные варианты
  {
    name: 'Голубоватый',
    bg: 'linear-gradient(145deg, #e8f0f5 0%, #f5f9fc 100%)',
    card: 'rgba(232, 240, 245, 0.9)',
  },
  {
    name: 'Зеленоватый',
    bg: 'linear-gradient(145deg, #e8f5e8 0%, #f5fcf5 100%)',
    card: 'rgba(232, 245, 232, 0.9)',
  },
  {
    name: 'Розоватый',
    bg: 'linear-gradient(145deg, #f5e8e8 0%, #fcf5f5 100%)',
    card: 'rgba(245, 232, 232, 0.9)',
  },
  {
    name: 'Фиолетовый',
    bg: 'linear-gradient(145deg, #f0e8f5 0%, #f9f5fc 100%)',
    card: 'rgba(240, 232, 245, 0.9)',
  },
  {
    name: 'Желтоватый',
    bg: 'linear-gradient(145deg, #f5f2e8 0%, #fcf9f5 100%)',
    card: 'rgba(245, 242, 232, 0.9)',
  },

  // Контрастные вариации
  {
    name: 'Высокий контраст',
    bg: 'linear-gradient(145deg, #d8d8d8 0%, #f8f8f8 100%)',
    card: 'rgba(216, 216, 216, 0.95)',
  },
  {
    name: 'Мягкий контраст',
    bg: 'linear-gradient(145deg, #e6e6e6 0%, #f2f2f2 100%)',
    card: 'rgba(230, 230, 230, 0.85)',
  },
  {
    name: 'Минимальный',
    bg: 'linear-gradient(145deg, #f2f2f2 0%, #fafafa 100%)',
    card: 'rgba(242, 242, 242, 0.8)',
  },
  {
    name: 'Максимальный',
    bg: 'linear-gradient(145deg, #d0d0d0 0%, #f0f0f0 100%)',
    card: 'rgba(208, 208, 208, 0.95)',
  },
  {
    name: 'Сбалансированный',
    bg: 'linear-gradient(145deg, #e4e4e4 0%, #f6f6f6 100%)',
    card: 'rgba(228, 228, 228, 0.9)',
  },

  // Специальные эффекты
  {
    name: 'Матовый',
    bg: 'linear-gradient(145deg, #e2e2e2 0%, #f4f4f4 100%)',
    card: 'rgba(226, 226, 226, 0.95)',
  },
  {
    name: 'Глянцевый',
    bg: 'linear-gradient(145deg, #e8e8e8 0%, #f8f8f8 100%)',
    card: 'rgba(232, 232, 232, 0.9)',
  },
  {
    name: 'Шелковистый',
    bg: 'linear-gradient(145deg, #eeeeee 0%, #fafafa 100%)',
    card: 'rgba(238, 238, 238, 0.9)',
  },
  {
    name: 'Бархатный',
    bg: 'linear-gradient(145deg, #e0e0e0 0%, #f2f2f2 100%)',
    card: 'rgba(224, 224, 224, 0.9)',
  },
  {
    name: 'Перламутровый',
    bg: 'linear-gradient(145deg, #f0f0f0 0%, #fcfcfc 100%)',
    card: 'rgba(240, 240, 240, 0.9)',
  },
];

// 💎 Вариации Glassmorphism стилей
const GLASSMORPHISM_VARIATIONS = [
  // Темные фоны с кодом
  {
    name: 'Классический темный',
    bg: 'radial-gradient(circle at 20% 30%, #0f0f23 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    blur: 25,
  },
  {
    name: 'Синий космос',
    bg: 'radial-gradient(circle at 30% 40%, #001122 0%, #000011 100%)',
    card: 'rgba(255, 255, 255, 0.10)',
    blur: 30,
  },
  {
    name: 'Фиолетовая бездна',
    bg: 'radial-gradient(circle at 25% 35%, #110022 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.09)',
    blur: 28,
  },
  {
    name: 'Зеленая матрица',
    bg: 'radial-gradient(circle at 40% 20%, #002200 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.11)',
    blur: 32,
  },
  {
    name: 'Красный киберпанк',
    bg: 'radial-gradient(circle at 15% 50%, #220000 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.07)',
    blur: 24,
  },

  // Градиентные фоны
  {
    name: 'Синий градиент',
    bg: 'linear-gradient(135deg, #0c1445 0%, #000000 70%)',
    card: 'rgba(255, 255, 255, 0.12)',
    blur: 35,
  },
  {
    name: 'Фиолетовый градиент',
    bg: 'linear-gradient(135deg, #2d1b69 0%, #000000 70%)',
    card: 'rgba(255, 255, 255, 0.10)',
    blur: 26,
  },
  {
    name: 'Темно-синий',
    bg: 'linear-gradient(135deg, #0f1419 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    blur: 22,
  },
  {
    name: 'Индиго',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.09)',
    blur: 27,
  },
  {
    name: 'Аквамарин',
    bg: 'linear-gradient(135deg, #0f1b1c 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.11)',
    blur: 29,
  },

  // Средние тона
  {
    name: 'Серый туман',
    bg: 'radial-gradient(circle at 50% 50%, #2a2a2a 0%, #0a0a0a 100%)',
    card: 'rgba(255, 255, 255, 0.15)',
    blur: 20,
  },
  {
    name: 'Серебряный',
    bg: 'radial-gradient(circle at 60% 30%, #1a1a1a 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.13)',
    blur: 18,
  },
  {
    name: 'Стальной',
    bg: 'linear-gradient(145deg, #1c1c1c 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.14)',
    blur: 23,
  },
  {
    name: 'Угольный',
    bg: 'radial-gradient(circle at 35% 65%, #191919 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.12)',
    blur: 21,
  },
  {
    name: 'Антрацит',
    bg: 'linear-gradient(135deg, #151515 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.16)',
    blur: 19,
  },

  // Яркие акценты
  {
    name: 'Неоновый синий',
    bg: 'radial-gradient(circle at 20% 20%, #001a3d 0%, #000000 100%)',
    card: 'rgba(0, 150, 255, 0.08)',
    blur: 33,
  },
  {
    name: 'Кислотный зеленый',
    bg: 'radial-gradient(circle at 80% 80%, #003d1a 0%, #000000 100%)',
    card: 'rgba(0, 255, 150, 0.07)',
    blur: 31,
  },
  {
    name: 'Электрический пурпур',
    bg: 'radial-gradient(circle at 50% 20%, #3d001a 0%, #000000 100%)',
    card: 'rgba(255, 0, 150, 0.06)',
    blur: 28,
  },
  {
    name: 'Лазерный красный',
    bg: 'radial-gradient(circle at 10% 90%, #3d0000 0%, #000000 100%)',
    card: 'rgba(255, 50, 50, 0.08)',
    blur: 26,
  },
  {
    name: 'Плазменный желтый',
    bg: 'radial-gradient(circle at 70% 30%, #3d3d00 0%, #000000 100%)',
    card: 'rgba(255, 255, 0, 0.05)',
    blur: 34,
  },

  // Многослойные эффекты
  {
    name: 'Глубокий космос',
    bg: 'radial-gradient(circle at 25% 25%, #000033 0%, #000000 60%, #001122 100%)',
    card: 'rgba(255, 255, 255, 0.09)',
    blur: 40,
  },
  {
    name: 'Киберпространство',
    bg: 'radial-gradient(circle at 75% 75%, #003300 0%, #000000 60%, #002200 100%)',
    card: 'rgba(255, 255, 255, 0.10)',
    blur: 38,
  },
  {
    name: 'Цифровая реальность',
    bg: 'radial-gradient(circle at 50% 10%, #330000 0%, #000000 50%, #220011 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    blur: 36,
  },
  {
    name: 'Голографический',
    bg: 'radial-gradient(circle at 10% 50%, #003333 0%, #000000 50%, #001133 100%)',
    card: 'rgba(255, 255, 255, 0.11)',
    blur: 42,
  },
  {
    name: 'Квантовый',
    bg: 'radial-gradient(circle at 90% 10%, #330033 0%, #000000 50%, #110022 100%)',
    card: 'rgba(255, 255, 255, 0.07)',
    blur: 44,
  },

  // Минимальные варианты
  {
    name: 'Чистый черный',
    bg: '#000000',
    card: 'rgba(255, 255, 255, 0.05)',
    blur: 15,
  },
  {
    name: 'Мягкий черный',
    bg: 'linear-gradient(45deg, #0a0a0a 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.06)',
    blur: 16,
  },
  {
    name: 'Глубокий черный',
    bg: 'radial-gradient(circle at center, #050505 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.04)',
    blur: 14,
  },
  {
    name: 'Абсолютный черный',
    bg: '#000000',
    card: 'rgba(255, 255, 255, 0.03)',
    blur: 12,
  },
  {
    name: 'Космическая тьма',
    bg: 'radial-gradient(circle at 50% 50%, #000000 0%, #000000 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    blur: 18,
  },
];

async function generateABTestVariants() {
  console.log('🧪 Запускаем A/B тестирование стилей карточек');
  console.log(
    '📊 Генерируем 30 вариантов Neomorphism + 30 вариантов Glassmorphism'
  );

  const canvasService = new InstagramCanvasService();

  // Тестовый слайд
  const testSlide: CarouselSlide = {
    order: 1,
    type: 'title',
    title: '💎 A/B Тест стилей',
    content:
      'Библия VibeCoding\\nМедитативное программирование\\nв красивых карточках',
    subtitle: '#vibecoding #design #test',
  };

  // 🧘‍♂️ Генерируем 30 вариантов Neomorphism
  console.log('\n🧘‍♂️ Генерируем варианты Neomorphism...');
  for (let i = 0; i < 30; i++) {
    const variant = NEOMORPHISM_VARIATIONS[i];
    console.log(`   ${i + 1}/30: ${variant.name}`);

    try {
      // Временно модифицируем шаблон
      const originalTemplates = InstagramCanvasService.getColorTemplates();
      const modifiedTemplates = {
        ...originalTemplates,
        [ColorTemplate.NEOMORPHISM]: {
          name: `🧘‍♂️ ${variant.name}`,
          emoji: '🧘‍♂️',
          background: variant.bg,
          accent: 'rgba(163, 177, 198, 0.3)',
          cardBackground: variant.card,
        },
      };

      // Подменяем метод
      (InstagramCanvasService as any).getColorTemplates = () =>
        modifiedTemplates;

      // Генерируем изображение
      const buffers = await canvasService.generateCarouselImages(
        [testSlide],
        undefined,
        ColorTemplate.NEOMORPHISM
      );

      // Сохраняем
      const filename = `neomorphism-${String(i + 1).padStart(2, '0')}-${variant.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await fs.promises.writeFile(
        path.join('ab-test-neomorphism', filename),
        buffers[0]
      );

      // Восстанавливаем оригинальные шаблоны
      (InstagramCanvasService as any).getColorTemplates = () =>
        originalTemplates;
    } catch (error) {
      console.error(`   ❌ Ошибка в варианте ${i + 1}:`, error);
    }
  }

  // 💎 Генерируем 30 вариантов Glassmorphism
  console.log('\n💎 Генерируем варианты Glassmorphism...');
  for (let i = 0; i < 30; i++) {
    const variant = GLASSMORPHISM_VARIATIONS[i];
    console.log(`   ${i + 1}/30: ${variant.name}`);

    try {
      // Временно модифицируем шаблон
      const originalTemplates = InstagramCanvasService.getColorTemplates();
      const modifiedTemplates = {
        ...originalTemplates,
        [ColorTemplate.MODERN_GLASSMORPHISM]: {
          name: `💎 ${variant.name}`,
          emoji: '💎',
          background: variant.bg,
          accent: 'rgba(100, 255, 218, 0.8)',
          cardBackground: variant.card,
        },
      };

      // Подменяем метод
      (InstagramCanvasService as any).getColorTemplates = () =>
        modifiedTemplates;

      // Генерируем изображение
      const buffers = await canvasService.generateCarouselImages(
        [testSlide],
        undefined,
        ColorTemplate.MODERN_GLASSMORPHISM
      );

      // Сохраняем
      const filename = `glassmorphism-${String(i + 1).padStart(2, '0')}-${variant.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await fs.promises.writeFile(
        path.join('ab-test-glassmorphism', filename),
        buffers[0]
      );

      // Восстанавливаем оригинальные шаблоны
      (InstagramCanvasService as any).getColorTemplates = () =>
        originalTemplates;
    } catch (error) {
      console.error(`   ❌ Ошибка в варианте ${i + 1}:`, error);
    }
  }

  console.log('\n✅ A/B тестирование завершено!');
  console.log('📁 Результаты сохранены в:');
  console.log('   🧘‍♂️ ab-test-neomorphism/ - 30 вариантов Neomorphism');
  console.log('   💎 ab-test-glassmorphism/ - 30 вариантов Glassmorphism');
  console.log('\n🎯 Выберите лучшие варианты и сообщите номера!');
}

// Запускаем тест
if (import.meta.url === `file://${process.argv[1]}`) {
  generateABTestVariants();
}

export { generateABTestVariants };
