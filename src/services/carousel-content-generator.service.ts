import OpenAI from 'openai';
import { CarouselSlide } from '../types';
import { logger, LogType } from '../utils/logger';

/**
 * Сервис для генерации контента карусели с помощью OpenAI на основе заданной темы.
 */
export class CarouselContentGeneratorService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY не найден в переменных окружения');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Генерация 10 слайдов карусели на основе предоставленной пользователем темы.
   * @param topic Тема, заданная пользователем.
   * @returns Промис, который разрешается массивом из 10 слайдов.
   */
  async generateCarouselSlides(topic: string): Promise<CarouselSlide[]> {
    try {
      logger.info('Начинаем генерацию слайдов карусели по теме', {
        type: LogType.BUSINESS_LOGIC,
        data: { topic },
      });

      const slides = await this.generateSlidesWithAI(topic);

      logger.info('Слайды карусели успешно сгенерированы', {
        type: LogType.BUSINESS_LOGIC,
        data: { generatedSlides: slides.length, topic },
      });

      return slides;
    } catch (error) {
      logger.error('Ошибка генерации слайдов карусели', {
        type: LogType.BUSINESS_LOGIC,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { topic },
      });
      // В случае ошибки возвращаем осмысленные fallback-слайды
      return this.getFallbackSlides(topic);
    }
  }

  /**
   * Генерация слайдов с помощью OpenAI.
   */
  private async generateSlidesWithAI(topic: string): Promise<CarouselSlide[]> {
    const prompt = this.buildPrompt(topic);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI вернул пустой ответ');
      }

      return this.parseAIResponse(content);
    } catch (error) {
      logger.error('Ошибка вызова OpenAI API', {
        type: LogType.EXTERNAL_SERVICE,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error; // Ошибка будет поймана в вызывающем методе
    }
  }

  /**
   * Системный промпт для OpenAI.
   */
  private getSystemPrompt(): string {
    return `Ты — креативный копирайтер и эксперт по созданию вовлекающего контента для Instagram. Твоя задача — создавать структурированные, информативные и вдохновляющие карусели из 10 слайдов на заданную тему. Ты должен мыслить как маркетолог, который хочет донести идею до аудитории максимально понятно и интересно.`;
  }

  /**
   * Построение промпта для генерации.
   */
  private buildPrompt(topic: string): string {
    return `Создай контент для карусели Instagram из 10 слайдов на тему: "${topic}".

**СТРУКТУРА КАРУСЕЛИ (строго 10 слайдов):**
- **Слайд 1:** Титульный. Яркий, интригующий заголовок, раскрывающий тему.
- **Слайды 2-3:** Проблема/Контекст. Опиши проблему, которую решает тема, или контекст, почему это важно.
- **Слайды 4-6:** Ключевые идеи/Решения. Предложи 2-3 ключевые идеи, шага или принципа, которые являются решением проблемы.
- **Слайды 7-8:** Практический пример/Кейс. Приведи короткий, понятный пример, как это работает на практике.
- **Слайд 9:** Вдохновляющая цитата или мощный факт по теме.
- **Слайд 10:** Заключение и Призыв к действию (CTA). Подведи итог и предложи пользователю что-то сделать (например, "Напиши Вайбкодинг в комментариях и получи доступ к бесплатной книге").

**ТРЕБОВАНИЯ К ТЕКСТУ:**
- **Язык:** Русский.
- **Заголовки:** ОБЯЗАТЕЛЬНО начинай с подходящего эмодзи, затем короткие, ясные и цепляющие (3-7 слов).
- **Основной текст:** Легко читаемый, не более 2-3 коротких предложений на слайде.
- **Эмодзи:** Используй эмодзи уместно в заголовках и тексте для улучшения визуального восприятия.

**ТИПЫ СЛАЙДОВ:**
- **title** - титульный слайд
- **principle** - ключевые принципы/идеи  
- **practice** - практические примеры
- **quote** - цитаты и мудрость
- **summary** - заключение и призыв к действию

**ФОРМАТ ОТВЕТА (строго JSON-объект):**
Верни ТОЛЬКО JSON-объект в следующем формате. Никакого текста до или после JSON.

\`\`\`json
{
  "slides": [
    {
      "order": 1,
      "type": "title",
      "title": "Заголовок для слайда 1",
      "content": "Текст для слайда 1."
    },
    {
      "order": 2,
      "type": "principle",
      "title": "Заголовок для слайда 2",
      "content": "Текст для слайда 2."
    },
    // ... и так далее для всех 10 слайдов ...
    {
      "order": 10,
      "type": "summary",
      "title": "Заголовок для слайда 10",
      "content": "Текст для слайда 10."
    }
  ]
}
\`\`\`
`;
  }

  /**
   * Парсинг ответа от AI.
   */
  private parseAIResponse(response: string): CarouselSlide[] {
    try {
      const parsed = JSON.parse(response);

      if (
        !parsed.slides ||
        !Array.isArray(parsed.slides) ||
        parsed.slides.length === 0
      ) {
        throw new Error(
          'Неверная структура ответа AI или пустой массив слайдов'
        );
      }

      // Возвращаем как есть, так как цвет больше не нужен
      return parsed.slides.map((slide: any, index: number) => ({
        order: slide.order || index + 1,
        type: slide.type || 'text',
        title: slide.title || 'Интересная мысль',
        content: slide.content || '...',
        subtitle: slide.subtitle, // может быть undefined, это нормально
      }));
    } catch (error) {
      logger.error('Ошибка парсинга ответа AI', {
        type: LogType.BUSINESS_LOGIC,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { response: response.slice(0, 500) },
      });
      throw new Error('Не удалось разобрать ответ от AI.');
    }
  }

  /**
   * Возвращает слайды по умолчанию в случае ошибки.
   */
  private getFallbackSlides(topic: string): CarouselSlide[] {
    return [
      {
        order: 1,
        type: 'title',
        title: `Ошибка генерации на тему: "${topic}"`,
        content:
          'К сожалению, произошла ошибка при создании контента. Попробуйте позже.',
      },
    ];
  }
}
