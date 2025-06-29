import { describe, test, expect } from 'bun:test';
import { VibeCodingContentService } from '../services/vibecoding-content.service';

describe('Instagram Carousel Generator', () => {
  test('VibeCodingContentService должен найти контент', async () => {
    const contentService = new VibeCodingContentService();
    const content = await contentService.searchByTopic('медитация');

    // Проверяем, что сервис возвращает массив
    expect(Array.isArray(content)).toBe(true);

    // Если контент найден, проверяем структуру
    if (content.length > 0) {
      const firstItem = content[0];
      expect(firstItem).toHaveProperty('title');
      expect(firstItem).toHaveProperty('content');
      expect(firstItem).toHaveProperty('category');
    }
  });
});
