#!/usr/bin/env bun

/**
 * 🧘‍♂️ A/B Тестирование 30 неоморфизм стилей для Библии VibeCoding
 *
 * Особенности:
 * - Светлые тона (белые, светло-серые)
 * - Квадратный формат 1080x1080
 * - Различные фоновые варианты для библии VibeCoding
 */

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service.js';
import type { CarouselSlide } from '../src/types.js';
import fs from 'fs/promises';
import path from 'path';

const canvasService = new InstagramCanvasService();

// 🧘‍♂️ 30 уникальных неоморфизм стилей для Библии VibeCoding
const VIBECODING_NEOMORPHISM_STYLES = [
  // Базовые белые тона (1-10)
  {
    name: 'Чистый белый',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    card: 'rgba(248, 249, 250, 0.95)',
  },
  {
    name: 'Снежный белый',
    background: 'linear-gradient(145deg, #fefefe 0%, #f5f6f7 100%)',
    card: 'rgba(245, 246, 247, 0.9)',
  },
  {
    name: 'Молочный белый',
    background: 'radial-gradient(circle at center, #fafbfc 0%, #f1f3f4 100%)',
    card: 'rgba(241, 243, 244, 0.92)',
  },
  {
    name: 'Перламутровый белый',
    background:
      'linear-gradient(45deg, #ffffff 0%, #f8f9fa 25%, #ffffff 50%, #f5f6f7 75%, #ffffff 100%)',
    card: 'rgba(248, 249, 250, 0.93)',
  },
  {
    name: 'Облачный белый',
    background:
      'radial-gradient(ellipse at top, #ffffff 0%, #f8f9fa 50%, #ecf0f1 100%)',
    card: 'rgba(236, 240, 241, 0.88)',
  },
  {
    name: 'Матовый белый',
    background: 'linear-gradient(180deg, #fdfdfd 0%, #f7f8f9 100%)',
    card: 'rgba(247, 248, 249, 0.94)',
  },
  {
    name: 'Жемчужный белый',
    background:
      'radial-gradient(circle at center, #ffffff 0%, #f8f9fa 40%, #ecf0f1 100%)',
    card: 'rgba(236, 240, 241, 0.9)',
  },
  {
    name: 'Шелковый белый',
    background:
      'linear-gradient(225deg, #fefefe 0%, #f0f1f2 50%, #f8f9fa 100%)',
    card: 'rgba(240, 241, 242, 0.91)',
  },
  {
    name: 'Мягкий белый',
    background: 'radial-gradient(circle at 30% 70%, #ffffff 0%, #f5f6f7 100%)',
    card: 'rgba(245, 246, 247, 0.89)',
  },
  {
    name: 'Кристальный белый',
    background: 'linear-gradient(315deg, #fefefe 0%, #f1f3f4 100%)',
    card: 'rgba(241, 243, 244, 0.93)',
  },

  // Светло-серые тона (11-20)
  {
    name: 'Светло-серый классик',
    background: 'linear-gradient(135deg, #f5f6f7 0%, #e9ecef 100%)',
    card: 'rgba(233, 236, 239, 0.9)',
  },
  {
    name: 'Серебристый',
    background:
      'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 70%, #dee2e6 100%)',
    card: 'rgba(222, 226, 230, 0.85)',
  },
  {
    name: 'Платиновый',
    background: 'linear-gradient(160deg, #f1f3f4 0%, #e1e5e9 100%)',
    card: 'rgba(225, 229, 233, 0.87)',
  },
  {
    name: 'Дымчатый',
    background:
      'radial-gradient(ellipse at bottom, #f8f9fa 0%, #e9ecef 60%, #ced4da 100%)',
    card: 'rgba(206, 212, 218, 0.8)',
  },
  {
    name: 'Мраморный',
    background:
      'linear-gradient(90deg, #ffffff 0%, #f1f3f4 25%, #e9ecef 50%, #f5f6f7 75%, #ffffff 100%)',
    card: 'rgba(241, 243, 244, 0.88)',
  },
  {
    name: 'Туманный',
    background:
      'radial-gradient(circle at 20% 80%, #f8f9fa 0%, #e9ecef 40%, #ced4da 100%)',
    card: 'rgba(206, 212, 218, 0.82)',
  },
  {
    name: 'Минеральный',
    background:
      'linear-gradient(200deg, #f1f3f4 0%, #dee2e6 50%, #e9ecef 100%)',
    card: 'rgba(222, 226, 230, 0.86)',
  },
  {
    name: 'Кварцевый',
    background:
      'radial-gradient(circle at 60% 40%, #ffffff 0%, #f1f3f4 50%, #dee2e6 100%)',
    card: 'rgba(222, 226, 230, 0.84)',
  },
  {
    name: 'Алмазный',
    background: 'linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%)',
    card: 'rgba(233, 236, 239, 0.87)',
  },
  {
    name: 'Опаловый',
    background: 'radial-gradient(ellipse at center, #f5f6f7 0%, #dee2e6 100%)',
    card: 'rgba(222, 226, 230, 0.83)',
  },

  // Тепло-белые тона (21-26)
  {
    name: 'Кремовый',
    background: 'linear-gradient(145deg, #fffef7 0%, #f7f6f0 100%)',
    card: 'rgba(247, 246, 240, 0.9)',
  },
  {
    name: 'Ванильный',
    background: 'radial-gradient(circle at 50% 20%, #fffef8 0%, #f8f7f1 100%)',
    card: 'rgba(248, 247, 241, 0.91)',
  },
  {
    name: 'Бежевый',
    background: 'linear-gradient(180deg, #faf9f5 0%, #f0efeb 100%)',
    card: 'rgba(240, 239, 235, 0.88)',
  },
  {
    name: 'Песочный',
    background:
      'radial-gradient(ellipse at top left, #faf9f5 0%, #f0efeb 70%, #e8e6e1 100%)',
    card: 'rgba(232, 230, 225, 0.85)',
  },
  {
    name: 'Слоновая кость',
    background:
      'linear-gradient(225deg, #fffef8 0%, #f8f7f1 50%, #f0efeb 100%)',
    card: 'rgba(248, 247, 241, 0.89)',
  },
  {
    name: 'Льняной',
    background: 'linear-gradient(165deg, #f8f7f2 0%, #ebe9e4 100%)',
    card: 'rgba(235, 233, 228, 0.86)',
  },

  // Холодно-белые с оттенками (27-30)
  {
    name: 'Ледяной белый',
    background: 'linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%)',
    card: 'rgba(227, 242, 253, 0.9)',
  },
  {
    name: 'Мятный белый',
    background: 'linear-gradient(160deg, #f1f8e9 0%, #e8f5e8 100%)',
    card: 'rgba(232, 245, 232, 0.88)',
  },
  {
    name: 'Лавандовый белый',
    background:
      'radial-gradient(ellipse at bottom right, #faf4ff 0%, #f3e5f5 100%)',
    card: 'rgba(243, 229, 245, 0.89)',
  },
  {
    name: 'Шампанское',
    background: 'linear-gradient(210deg, #fffbf0 0%, #fff8e1 100%)',
    card: 'rgba(255, 248, 225, 0.85)',
  },
];

async function generateVibeCodingNeomorphismStyles() {
  console.log('🧘‍♂️ Генерируем 30 неоморфизм стилей для Библии VibeCoding');
  console.log('📱 Квадратный формат 1080x1080 (Instagram)');
  console.log('🤍 Светлые тона для медитативного программирования');

  // Создаем папку если не существует
  await fs.mkdir('ab-test-neomorphism-vibecoding', { recursive: true });

  // Тестовый слайд
  const testSlide: CarouselSlide = {
    order: 1,
    type: 'title',
    title: '📖 Библия VibeCoding',
    content:
      'Медитативное программирование\\nчерез осознанный код\\nи состояние потока',
    subtitle: 'Путь к гармонии разработчика',
  };

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < VIBECODING_NEOMORPHISM_STYLES.length; i++) {
    const style = VIBECODING_NEOMORPHISM_STYLES[i];
    console.log(`   ${i + 1}/30: ${style.name}`);

    try {
      // Временно модифицируем шаблон
      const originalTemplates = InstagramCanvasService.getColorTemplates();
      const modifiedTemplates = {
        ...originalTemplates,
        [ColorTemplate.NEOMORPHISM]: {
          name: `🧘‍♂️ ${style.name}`,
          emoji: '🧘‍♂️',
          background: style.background,
          accent: 'rgba(163, 177, 198, 0.2)',
          cardBackground: style.card,
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
      const filename = `neomorphism-vibecoding-${String(i + 1).padStart(2, '0')}-${style.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await fs.writeFile(
        path.join('ab-test-neomorphism-vibecoding', filename),
        buffers[0]
      );

      // Восстанавливаем оригинальные шаблоны
      (InstagramCanvasService as any).getColorTemplates = () =>
        originalTemplates;

      successCount++;
    } catch (error) {
      console.error(`   ❌ Ошибка в стиле ${i + 1}:`, error);
      errorCount++;
    }
  }

  console.log('\\n✅ Генерация неоморфизм стилей завершена!');
  console.log(`📊 Статистика: ${successCount} успешно, ${errorCount} ошибок`);
  console.log('📁 Результаты сохранены в: ab-test-neomorphism-vibecoding/');
  console.log('\\n🎯 Особенности стилей:');
  console.log('🤍 Светлые тона от белого до светло-серого');
  console.log('🧘‍♂️ Мягкие неоморфные тени и подсветка');
  console.log('📱 Квадратный формат для Instagram');
  console.log('📖 Идеально для Библии VibeCoding');
}

// Запускаем генерацию
generateVibeCodingNeomorphismStyles();

export { generateVibeCodingNeomorphismStyles };
