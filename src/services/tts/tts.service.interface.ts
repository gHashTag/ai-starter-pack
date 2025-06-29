import { Emotion, TTSOptions, TTSResult } from './types';

/**
 * Интерфейс сервиса для преобразования текста в речь
 */
export interface TTSService {
  /**
   * Преобразует текст в речь с заданными опциями
   * @param text Текст для преобразования
   * @param options Опции генерации речи
   */
  convertTextToSpeech(text: string, options?: TTSOptions): Promise<TTSResult>;

  /**
   * Генерирует эмоциональную речь
   * @param text Текст для преобразования
   * @param emotion Эмоция
   */
  generateEmotionalSpeech(text: string, emotion: Emotion): Promise<TTSResult>;

  /**
   * Получает аудио из кэша по ключу
   * @param key Ключ кэша
   */
  getCachedAudio(key: string): Promise<TTSResult | null>;

  /**
   * Очищает кэш
   */
  clearCache(): Promise<void>;
}
