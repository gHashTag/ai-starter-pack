// Экспорт основных типов и интерфейсов
export * from './types';
export * from './tts.service.interface';

// Экспорт реализации сервиса
export { OpenAITTSService } from './openai-tts.service';

// Экспорт хелперов
export { TelegramTTSHelper } from './telegram-tts.helper';

// Импорт для использования в фабричной функции
import { OpenAITTSService } from './openai-tts.service';

// Фабричная функция для создания TTS сервиса
export function createTTSService(
  apiKey?: string,
  cacheTTL?: number,
  cacheDir?: string
): OpenAITTSService {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it as parameter.'
    );
  }

  return new OpenAITTSService(
    key,
    cacheTTL || parseInt(process.env.CACHE_TTL || '3600'),
    cacheDir || process.env.AUDIO_CACHE_DIR || './cache/audio'
  );
}
