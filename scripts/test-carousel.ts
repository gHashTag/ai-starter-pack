#!/usr/bin/env bun

/**
 * Тестовый скрипт для проверки генерации Instagram карусели
 */

import { InstagramCanvasService } from '../src/services/instagram-canvas.service';
import { CarouselSlide } from '../src/types';
// import { logger, LogType } from "../src/utils/logger"; // не используется
import { promises as fs } from 'fs';
import path from 'path';

async function testProfessionalCarousel() {
  console.log('🎨 Тестируем профессиональный дизайн карусели...');

  const canvasService = new InstagramCanvasService();

  const testSlides: CarouselSlide[] = [
    {
      order: 1,
      type: 'title',
      title: '🌸 VIBECODING',
      content:
        'Революционный подход к программированию через состояние потока и медитативное кодирование.',
      colorScheme: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '',
        secondary: '',
      },
    },
    {
      order: 2,
      type: 'principle',
      title: '💎 Принцип Чистоты',
      content:
        'Код должен быть как кристалл - прозрачным, структурированным и излучающим внутреннюю красоту.',
      colorScheme: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '',
        secondary: '',
      },
    },
    {
      order: 3,
      type: 'quote',
      title: '⚡ Цитата Мудрости',
      content:
        '"Программирование - это искусство превращения хаоса в порядок, мыслей в код, идей в реальность."',
      subtitle: '— Неизвестный мудрец',
      colorScheme: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '',
        secondary: '',
      },
    },
    {
      order: 4,
      type: 'practice',
      title: '🚀 Практика TDD',
      content:
        'Тест-Драйвен Разработка как путь к совершенству:\n\n🔴 Красный → 🟢 Зеленый → ♻️ Рефакторинг',
      colorScheme: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '',
        secondary: '',
      },
    },
    {
      order: 5,
      type: 'summary',
      title: '🙏 Заключение',
      content:
        'VIBECODING объединяет технические навыки с духовными практиками для создания гармоничного кода.',
      colorScheme: {
        background: '#FFFFFF',
        text: '#000000',
        primary: '',
        secondary: '',
      },
    },
  ];

  try {
    console.log('🖼️ Генерируем изображения с Lora & Golos Text...');
    const imageBuffers = await canvasService.generateCarouselImages(testSlides);

    const outputDir = path.join(process.cwd(), 'carousel-output');
    await fs.rm(outputDir, { recursive: true, force: true }); // Очищаем папку перед генерацией
    await fs.mkdir(outputDir, { recursive: true });

    for (let i = 0; i < imageBuffers.length; i++) {
      const filename = `slide-${i + 1}.png`;
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(filepath, imageBuffers[i]);

      const sizeKB = Math.round(imageBuffers[i].length / 1024);
      console.log(`✅ Сохранен ${filename} (${sizeKB} KB)`);
    }

    console.log(`\n🎉 Успешно создано ${imageBuffers.length} изображений!`);
    console.log(`📁 Результаты сохранены в: ${outputDir}`);
    console.log('\n✨ Особенности дизайна:');
    console.log('   • Шрифты: Lora (заголовки), Golos Text (текст)');
    console.log('   • Фон: Чистый белый (#FFFFFF)');
    console.log('   • Текст: Глубокий черный (#000000)');
    console.log('   • Полная поддержка кириллицы и эмодзи');
    console.log('   • Размер: 1080x1350 (Instagram Portrait)');
  } catch (error) {
    console.error('❌ Ошибка при генерации изображений:', error);
    process.exit(1);
  }
}

testProfessionalCarousel().catch(console.error);
