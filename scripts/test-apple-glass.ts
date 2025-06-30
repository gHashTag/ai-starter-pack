#!/usr/bin/env bun

import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import { CarouselSlide } from '../src/types';
import * as fs from 'fs';

const testSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🍎 Apple Glass',
    content: 'Элегантный дизайн в стиле Apple\nс эффектом матового стекла',
    subtitle: 'Frosted Glass Template',
  },
];

async function testAppleGlass() {
  const service = new InstagramCanvasService();

  // Тестируем Apple Glass Light
  console.log('🍎 Генерируем Apple Glass Light...');
  const images = await service.generateCarouselImages(
    testSlides,
    {},
    ColorTemplate.APPLE_GLASS_LIGHT
  );

  fs.writeFileSync('./test-outputs/apple-glass-light-test.png', images[0]);
  console.log('✅ Сохранен: apple-glass-light-test.png');
}

testAppleGlass().catch(console.error);
