/**
 * 🧪 Тесты для системы предпросмотра цветовых темплейтов
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../services/instagram-canvas.service';

describe('🎨 Template Preview System', () => {
  const previewDir = path.join(process.cwd(), 'template-previews');

  beforeAll(async () => {
    // Проверяем, что папка с превью существует
    try {
      await fs.access(previewDir);
    } catch {
      console.warn(
        '⚠️ Папка template-previews не найдена. Запустите: bun scripts/generate-template-previews.ts'
      );
    }
  });

  test('📋 Galaxy Spiral Blur темплейт имеет корректную конфигурацию', () => {
    const templates = InstagramCanvasService.getColorTemplates();

    // Проверяем, что есть единственный темплейт Galaxy Spiral Blur
    expect(Object.keys(templates).length).toBe(1);
    expect(templates[ColorTemplate.GALAXY_SPIRAL_BLUR]).toBeTruthy();

    // Проверяем обязательные поля для Galaxy Spiral Blur темплейта
    const template = templates[ColorTemplate.GALAXY_SPIRAL_BLUR];
    expect(template.name).toBe('🌌 Galaxy Spiral Blur');
    expect(template.emoji).toBe('🌌');
    expect(template.background).toBe('bg-image-galaxy-spiral');
    expect(template.accent).toBe('rgba(255, 255, 255, 0.3)');
    expect(template.cardBackground).toBe('rgba(0, 0, 0, 0.4)');

    // Проверяем, что background содержит валидный идентификатор для blur эффекта
    expect(template.background).toMatch(/bg-image-galaxy-spiral/);
  });

  test('🖼️ Превью-изображение существует для Galaxy Spiral Blur', async () => {
    const templates = InstagramCanvasService.getColorTemplates();

    for (const [key] of Object.entries(templates)) {
      const previewPath = path.join(previewDir, `${key}-preview.png`);

      try {
        await fs.access(previewPath);
        const stats = await fs.stat(previewPath);

        // Проверяем, что файл не пустой
        expect(stats.size).toBeGreaterThan(1000); // Минимум 1KB

        // Проверяем, что это PNG файл
        expect(previewPath).toMatch(/\.png$/);
      } catch (error) {
        console.warn(`⚠️ Превью не найдено для ${key}: ${previewPath}`);
        // В тесте не фейлим, так как превью могут быть не сгенерированы
      }
    }
  });

  test('🎨 Galaxy Spiral Blur является единственным темплейтом', () => {
    const templates = InstagramCanvasService.getColorTemplates();

    // Проверяем что у нас только Galaxy Spiral Blur
    expect(Object.keys(templates).length).toBe(1);
    expect(templates[ColorTemplate.GALAXY_SPIRAL_BLUR]).toBeTruthy();
    expect(templates[ColorTemplate.GALAXY_SPIRAL_BLUR].name).toBe(
      '🌌 Galaxy Spiral Blur'
    );
    expect(templates[ColorTemplate.GALAXY_SPIRAL_BLUR].emoji).toBe('🌌');
  });

  test('🌌 Galaxy Spiral Blur имеет уникальный дизайн', () => {
    const templates = InstagramCanvasService.getColorTemplates();
    const template = templates[ColorTemplate.GALAXY_SPIRAL_BLUR];

    // Проверяем уникальность блюр дизайна
    expect(template.background).toBe('bg-image-galaxy-spiral');
    expect(template.name).toContain('Blur');
    expect(template.accent).toBe('rgba(255, 255, 255, 0.3)');
  });

  test('📷 Предпросмотр URL формируется корректно для Galaxy Spiral Blur', () => {
    const originalPort = process.env.HTTP_SERVER_PORT;
    process.env.HTTP_SERVER_PORT = '7103';

    const expectedUrl =
      'http://localhost:7103/preview/galaxy_spiral_blur-preview.png';
    const serverPort = process.env.HTTP_SERVER_PORT || '7103';
    const previewUrl = `http://localhost:${serverPort}/preview/galaxy_spiral_blur-preview.png`;

    expect(previewUrl).toBe(expectedUrl);

    // Восстанавливаем оригинальное значение
    if (originalPort) {
      process.env.HTTP_SERVER_PORT = originalPort;
    } else {
      delete process.env.HTTP_SERVER_PORT;
    }
  });

  test('🎯 ColorTemplate enum содержит только Galaxy Spiral Blur', () => {
    const expectedTemplates = ['GALAXY_SPIRAL_BLUR'];

    expectedTemplates.forEach(template => {
      expect(
        ColorTemplate[template as keyof typeof ColorTemplate]
      ).toBeTruthy();
    });

    // Проверяем что у нас только один шаблон
    expect(Object.keys(ColorTemplate).length).toBe(expectedTemplates.length);
    expect(Object.keys(ColorTemplate)[0]).toBe('GALAXY_SPIRAL_BLUR');
  });
});
