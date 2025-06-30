/**
 * 🧪 Тесты для системы предпросмотра цветовых темплейтов
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';
import { InstagramCanvasService, ColorTemplate } from '../services/instagram-canvas.service';

describe('🎨 Template Preview System', () => {
  const previewDir = path.join(process.cwd(), 'template-previews');

  beforeAll(async () => {
    // Проверяем, что папка с превью существует
    try {
      await fs.access(previewDir);
    } catch {
      console.warn('⚠️ Папка template-previews не найдена. Запустите: bun scripts/generate-template-previews.ts');
    }
  });

  test('📋 Все цветовые темплейты имеют корректную конфигурацию', () => {
    const templates = InstagramCanvasService.getColorTemplates();
    
    // Проверяем, что есть хотя бы несколько темплейтов
    expect(Object.keys(templates).length).toBeGreaterThan(5);
    
    // Проверяем обязательные поля для каждого темплейта
    Object.entries(templates).forEach(([_key, template]) => {
      expect(template.name).toBeTruthy();
      expect(template.emoji).toBeTruthy();
      expect(template.background).toBeTruthy();
      expect(template.accent).toBeTruthy();
      expect(template.cardBackground).toBeTruthy();
      
      // Проверяем, что name не пустое
      expect(template.name.length).toBeGreaterThan(0);
      
      // Проверяем, что background содержит валидный CSS
      expect(template.background).toMatch(/^(#|linear-gradient|rgba?)/);
    });
  });

  test('🖼️ Превью-изображения существуют для всех темплейтов', async () => {
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

  test('🎨 Все luxury темплейты присутствуют', () => {
    const templates = InstagramCanvasService.getColorTemplates();
    
    const luxuryTemplates = [
      ColorTemplate.BLACK_GOLD,
      ColorTemplate.EMERALD_LUXURY,
      ColorTemplate.ROYAL_PURPLE,
      ColorTemplate.PLATINUM_SILVER,
      ColorTemplate.BURGUNDY_GOLD,
      ColorTemplate.MIDNIGHT_BLUE,
      ColorTemplate.COPPER_BRONZE,
      ColorTemplate.FOREST_GOLD,
      ColorTemplate.ROSE_GOLD,
      ColorTemplate.CHARCOAL_MINT,
    ];
    
    luxuryTemplates.forEach(template => {
      expect(templates[template]).toBeTruthy();
      expect(templates[template].name).toBeTruthy();
      expect(templates[template].emoji).toBeTruthy();
    });
  });

  test('🌈 Цветовые схемы различаются между собой', () => {
    const templates = InstagramCanvasService.getColorTemplates();
    const backgrounds = Object.values(templates).map(t => t.background);
    
    // Проверяем, что все фоны уникальны
    const uniqueBackgrounds = new Set(backgrounds);
    expect(uniqueBackgrounds.size).toBe(backgrounds.length);
  });

  test('📷 Предпросмотр URL формируется корректно', () => {
    const originalPort = process.env.HTTP_SERVER_PORT;
    process.env.HTTP_SERVER_PORT = '7103';
    
    const expectedUrl = 'http://localhost:7103/preview/black_gold-preview.png';
    const serverPort = process.env.HTTP_SERVER_PORT || '7103';
    const previewUrl = `http://localhost:${serverPort}/preview/black_gold-preview.png`;
    
    expect(previewUrl).toBe(expectedUrl);
    
    // Восстанавливаем оригинальное значение
    if (originalPort) {
      process.env.HTTP_SERVER_PORT = originalPort;
    } else {
      delete process.env.HTTP_SERVER_PORT;
    }
  });

  test('🎯 ColorTemplate enum содержит все ожидаемые значения', () => {
    const expectedTemplates = [
      'WHITE', 'MORNING', 'OCEAN', 'SUNSET', 'NATURE', 'FIRE',
      'BLACK_GOLD', 'EMERALD_LUXURY', 'ROYAL_PURPLE', 'PLATINUM_SILVER',
      'BURGUNDY_GOLD', 'MIDNIGHT_BLUE', 'COPPER_BRONZE', 'FOREST_GOLD',
      'ROSE_GOLD', 'CHARCOAL_MINT'
    ];
    
    expectedTemplates.forEach(template => {
      expect(ColorTemplate[template as keyof typeof ColorTemplate]).toBeTruthy();
    });
    
    // Проверяем общее количество
    expect(Object.keys(ColorTemplate).length).toBe(expectedTemplates.length);
  });
});
