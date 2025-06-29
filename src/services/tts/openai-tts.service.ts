import { OpenAI } from 'openai';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { TTSService } from './tts.service.interface';
import {
  TTSOptions,
  TTSResult,
  Emotion,
  TTSVoice,
  AudioFormat,
  TTSError,
  TTSErrorCode,
} from './types';

export class OpenAITTSService implements TTSService {
  private readonly openai: OpenAI;
  private readonly cache: NodeCache;
  private readonly cacheDir: string;

  constructor(
    apiKey: string,
    cacheTTL: number = 3600,
    cacheDir: string = './cache/audio'
  ) {
    this.openai = new OpenAI({ apiKey });
    this.cache = new NodeCache({ stdTTL: cacheTTL });
    this.cacheDir = cacheDir;
    this.ensureCacheDir();
  }

  /**
   * Создает директорию для кэша, если она не существует
   */
  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      throw new TTSError(
        'Failed to create cache directory',
        TTSErrorCode.CACHE_ERROR,
        error as Error
      );
    }
  }

  /**
   * Генерирует ключ кэша для заданного текста и опций
   */
  private generateCacheKey(text: string, options?: TTSOptions): string {
    const data = JSON.stringify({ text, options });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Сохраняет аудио в кэш
   */
  private async cacheAudio(
    key: string,
    audio: Buffer,
    format: AudioFormat
  ): Promise<void> {
    const filePath = path.join(this.cacheDir, `${key}.${format}`);
    try {
      await fs.writeFile(filePath, audio);
      this.cache.set(key, { filePath, format });
    } catch (error) {
      throw new TTSError(
        'Failed to cache audio',
        TTSErrorCode.CACHE_ERROR,
        error as Error
      );
    }
  }

  /**
   * Преобразует эмоцию в инструкции для OpenAI
   */
  private getEmotionInstructions(emotion: Emotion): string {
    const instructions = {
      [Emotion.NEUTRAL]: '',
      [Emotion.HAPPY]: '(happy) Говорить радостно и с энтузиазмом.',
      [Emotion.SAD]: '(sad) Говорить грустно и с сожалением.',
      [Emotion.ANGRY]: '(angry) Говорить с возмущением и негодованием.',
      [Emotion.EXCITED]: '(excited) Говорить с большим воодушевлением!',
      [Emotion.CALM]: '(calm) Говорить спокойно и размеренно.',
    };
    return instructions[emotion] || '';
  }

  public async convertTextToSpeech(
    text: string,
    options: TTSOptions = {}
  ): Promise<TTSResult> {
    if (!text) {
      throw new TTSError('Text is required', TTSErrorCode.INVALID_INPUT);
    }

    const {
      voice = TTSVoice.ALLOY,
      emotion = Emotion.NEUTRAL,
      speed = 1.0,
      format = AudioFormat.MP3,
      useCache = true,
    } = options;

    // Проверяем кэш
    if (useCache) {
      const cacheKey = this.generateCacheKey(text, options);
      const cached = await this.getCachedAudio(cacheKey);
      if (cached) return cached;
    }

    try {
      // Добавляем эмоциональные инструкции к тексту
      const emotionInstructions = this.getEmotionInstructions(emotion);
      const fullText = emotionInstructions
        ? `${emotionInstructions} ${text}`
        : text;

      // Генерируем речь через OpenAI API
      const response = await this.openai.audio.speech.create({
        model: process.env.TTS_MODEL || 'gpt-4o-mini-tts',
        voice,
        input: fullText,
        speed,
        response_format: format as
          | 'mp3'
          | 'opus'
          | 'aac'
          | 'flac'
          | 'wav'
          | 'pcm',
      });

      // Получаем аудио как Buffer
      const buffer = Buffer.from(await response.arrayBuffer());

      // Получаем длительность аудио (заглушка, в реальности нужно использовать библиотеку для анализа аудио)
      const duration = buffer.length / 16000; // Примерная оценка

      const result: TTSResult = {
        audio: buffer,
        duration,
        format,
        cached: false,
      };

      // Кэшируем результат
      if (useCache) {
        const cacheKey = this.generateCacheKey(text, options);
        await this.cacheAudio(cacheKey, buffer, format);
      }

      return result;
    } catch (error) {
      throw new TTSError(
        'Failed to convert text to speech',
        TTSErrorCode.API_ERROR,
        error as Error
      );
    }
  }

  public async generateEmotionalSpeech(
    text: string,
    emotion: Emotion
  ): Promise<TTSResult> {
    return this.convertTextToSpeech(text, { emotion });
  }

  public async getCachedAudio(key: string): Promise<TTSResult | null> {
    try {
      const cached = this.cache.get<{ filePath: string; format: AudioFormat }>(
        key
      );
      if (!cached) return null;

      const { filePath, format } = cached;
      const audio = await fs.readFile(filePath);
      const duration = audio.length / 16000; // Примерная оценка

      return {
        audio,
        duration,
        format,
        cached: true,
      };
    } catch (error) {
      throw new TTSError(
        'Failed to get cached audio',
        TTSErrorCode.CACHE_ERROR,
        error as Error
      );
    }
  }

  public async clearCache(): Promise<void> {
    try {
      this.cache.flushAll();
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
    } catch (error) {
      throw new TTSError(
        'Failed to clear cache',
        TTSErrorCode.CACHE_ERROR,
        error as Error
      );
    }
  }
}
