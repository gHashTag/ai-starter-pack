// Настройка окружения для тестов
process.env.NODE_ENV = 'test';
process.env.TTS_MODEL = 'gpt-4o-mini-tts';
process.env.OPENAI_API_KEY = 'test-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.CACHE_TTL = '3600';
process.env.AUDIO_CACHE_DIR = './test-cache/audio';

// Глобальные переменные для тестов
(global as any).__DATABASE_URL__ = process.env.DATABASE_URL;
(global as any).__NEON_CONNECTION_STRING__ =
  'postgresql://fake:fake@fake.neon.tech/fake';
