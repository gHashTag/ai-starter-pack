#!/usr/bin/env bun

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import { CarouselSlide } from '../src/types';
import * as fs from 'fs';

const appleTemplates = [
  { template: ColorTemplate.APPLE_GLASS_LIGHT, name: 'Light' },
  { template: ColorTemplate.APPLE_GLASS_DARK, name: 'Dark' },
  { template: ColorTemplate.APPLE_GLASS_BLUE, name: 'Blue' },
  { template: ColorTemplate.APPLE_GLASS_GREEN, name: 'Green' },
  { template: ColorTemplate.APPLE_GLASS_PURPLE, name: 'Purple' },
  { template: ColorTemplate.APPLE_GLASS_PINK, name: 'Pink' },
  { template: ColorTemplate.APPLE_GLASS_GOLD, name: 'Gold' },
];

async function testAllAppleGlass() {
  const service = new InstagramCanvasService();
  console.log('🍎 Тестируем все Apple Glass шаблоны...\n');

  for (const { template, name } of appleTemplates) {
    const testSlide: CarouselSlide[] = [
      {
        order: 1,
        type: 'title',
        title: `🍎 Apple Glass ${name}`,
        content: `Элегантный ${name.toLowerCase()} дизайн\nв стиле Apple с эффектом\nматового стекла`,
        subtitle: `Frosted Glass Template - ${name}`,
      },
    ];

    console.log(`🎨 Генерируем ${name}...`);

    try {
      const images = await service.generateCarouselImages(
        testSlide,
        {},
        template
      );
      const filename = `apple-glass-${name.toLowerCase()}.png`;
      fs.writeFileSync(`./test-outputs/${filename}`, images[0]);
      console.log(`✅ Сохранен: ${filename}`);
    } catch (error) {
      console.error(`❌ Ошибка ${name}:`, error);
    }
  }

  console.log('\n🎉 Все Apple Glass шаблоны готовы!');
  console.log('📁 Проверьте папку test-outputs/');
}

testAllAppleGlass().catch(console.error);
