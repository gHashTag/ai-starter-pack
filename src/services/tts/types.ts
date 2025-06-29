/**
 * Типы эмоций для генерации речи
 */
export enum Emotion {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  EXCITED = 'excited',
  CALM = 'calm',
}

/**
 * Доступные голоса OpenAI TTS
 */
export enum TTSVoice {
  ALLOY = 'alloy',
  ECHO = 'echo',
  FABLE = 'fable',
  ONYX = 'onyx',
  NOVA = 'nova',
  SHIMMER = 'shimmer',
}

/**
 * Формат выходного аудио
 */
export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
}

/**
 * Опции для генерации речи
 */
export interface TTSOptions {
  voice?: TTSVoice;
  emotion?: Emotion;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // -20 to +20
  format?: AudioFormat;
  useCache?: boolean;
}

/**
 * Результат генерации речи
 */
export interface TTSResult {
  audio: Buffer;
  duration: number;
  format: AudioFormat;
  cached: boolean;
}

/**
 * Ошибки TTS сервиса
 */
export class TTSError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'TTSError';
  }
}

/**
 * Коды ошибок TTS сервиса
 */
export enum TTSErrorCode {
  API_ERROR = 'TTS_API_ERROR',
  INVALID_INPUT = 'TTS_INVALID_INPUT',
  CACHE_ERROR = 'TTS_CACHE_ERROR',
  RATE_LIMIT = 'TTS_RATE_LIMIT',
  UNKNOWN = 'TTS_UNKNOWN_ERROR',
}
