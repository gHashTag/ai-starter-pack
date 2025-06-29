import { describe, it, expect } from 'vitest';
import {
  Emotion,
  TTSVoice,
  AudioFormat,
  TTSError,
  TTSErrorCode,
} from '../../../../services/tts/types';

describe('TTS Types and Enums', () => {
  describe('Emotion enum', () => {
    it('должен содержать все необходимые эмоции', () => {
      expect(Emotion.NEUTRAL).toBe('neutral');
      expect(Emotion.HAPPY).toBe('happy');
      expect(Emotion.SAD).toBe('sad');
      expect(Emotion.ANGRY).toBe('angry');
      expect(Emotion.EXCITED).toBe('excited');
      expect(Emotion.CALM).toBe('calm');
    });
  });

  describe('TTSVoice enum', () => {
    it('должен содержать все доступные голоса', () => {
      expect(TTSVoice.ALLOY).toBe('alloy');
      expect(TTSVoice.ECHO).toBe('echo');
      expect(TTSVoice.FABLE).toBe('fable');
      expect(TTSVoice.ONYX).toBe('onyx');
      expect(TTSVoice.NOVA).toBe('nova');
      expect(TTSVoice.SHIMMER).toBe('shimmer');
    });
  });

  describe('AudioFormat enum', () => {
    it('должен содержать все поддерживаемые форматы', () => {
      expect(AudioFormat.MP3).toBe('mp3');
      expect(AudioFormat.WAV).toBe('wav');
      expect(AudioFormat.OGG).toBe('ogg');
    });
  });

  describe('TTSError', () => {
    it('должен создавать ошибку с правильными параметрами', () => {
      const originalError = new Error('Original error');
      const ttsError = new TTSError(
        'Test error message',
        TTSErrorCode.API_ERROR,
        originalError
      );

      expect(ttsError.message).toBe('Test error message');
      expect(ttsError.code).toBe(TTSErrorCode.API_ERROR);
      expect(ttsError.originalError).toBe(originalError);
      expect(ttsError.name).toBe('TTSError');
    });
  });
});
