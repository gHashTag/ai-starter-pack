import nodeHtmlToImage from 'node-html-to-image';
import path from 'path';
import { CarouselSlide, CanvasConfig } from '../types';
import { logger, LogType } from '../utils/logger';

/**
 * 🎨 Цветовые темплейты для карусели
 * Оставлен только идеальный Galaxy Spiral Blur темплейт
 */
export enum ColorTemplate {
  // 🌌 GALAXY SPIRAL BLUR - ЕДИНСТВЕННЫЙ ТЕМПЛЕЙТ
  GALAXY_SPIRAL_BLUR = 'galaxy_spiral_blur',
}

/**
 * 🎨 Конфигурация цветовых темплейтов
 */
interface TemplateDesign {
  name: string;
  emoji: string;
  background: string;
  accent: string;
  cardBackground: string;
}

/**
 * 🧘‍♂️ Кастомный визуальный стиль для VibeCoding
 */
interface CustomVisualStyle {
  background: string;
  cardStyle: string;
  textColor: string;
  animation?: string;
}

/**
 * Сервис для создания ПРОФЕССИОНАЛЬНЫХ изображений из HTML/CSS.
 * Гарантирует идеальный рендеринг шрифтов, эмодзи и верстки.
 */
export class InstagramCanvasService {
  private readonly defaultConfig: CanvasConfig = {
    width: 1080,
    height: 1080,
    quality: 0.9,
    format: 'png',
  };

  private readonly outputDir = path.resolve('./carousel-output');

  /**
   * 🎨 Получить единственный идеальный цветовой темплейт
   */
  public static getColorTemplates(): Record<ColorTemplate, TemplateDesign> {
    return {
      // 🌌 ЕДИНСТВЕННЫЙ ИДЕАЛЬНЫЙ ТЕМПЛЕЙТ
      [ColorTemplate.GALAXY_SPIRAL_BLUR]: {
        name: '🌌 Galaxy Spiral Blur',
        emoji: '🌌',
        background: 'bg-image-galaxy-spiral',
        accent: 'rgba(255, 255, 255, 0.3)',
        cardBackground: 'rgba(0, 0, 0, 0.4)',
      },
    };
  }

  /**
   * Генерирует HTML-шаблон для одного слайда.
   * Использует Google Fonts для элегантных шрифтов и поддержки эмодзи.
   */
  private generateHtmlTemplate(
    slide: CarouselSlide,
    totalSlides: number,
    colorTemplate: ColorTemplate = ColorTemplate.GALAXY_SPIRAL_BLUR,
    customStyle?: CustomVisualStyle
  ): string {
    // 🧘‍♂️ Если передан кастомный стиль, используем его
    if (customStyle) {
      return this.generateCustomStyleTemplate(slide, totalSlides, customStyle);
    }

    const templates = InstagramCanvasService.getColorTemplates();
    const design = templates[colorTemplate];

    // 🎨 Цвета текста для Galaxy Spiral Blur
    const textColor = '#ffffff'; // Белый текст поверх blur изображений
    const textLight = 'rgba(255, 255, 255, 0.95)';

    // 🌌 Galaxy Spiral Blur - единственный темплейт
    const isBlurTemplate = colorTemplate === ColorTemplate.GALAXY_SPIRAL_BLUR;

    // 🌌 Стили для Galaxy Spiral Blur с фоновыми изображениями
    const glassmorphismStyles = `
      /* 🌌 GALAXY SPIRAL BLUR - стеклянный эффект поверх фонового изображения */
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(15px) saturate(150%);
      -webkit-backdrop-filter: blur(15px) saturate(150%);
      border-radius: 25px;
      border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 
        0 10px 20px rgba(0, 0, 0, 0.1),
        0 5px 10px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      position: relative;
      overflow: hidden;
    `;

    // Все остальные условия больше не нужны - используем только Galaxy Spiral Blur

    // 🌌 Определяем фоновое изображение для body
    let bodyBackground = design.background;
    if (isBlurTemplate) {
      // Получаем список всех изображений из папки
      const backgroundImages = [
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_11aa5b66-5b68-422f-b68f-03121eea5b93_0.png',
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_11aa5b66-5b68-422f-b68f-03121eea5b93_1.png',
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_11aa5b66-5b68-422f-b68f-03121eea5b93_2.png',
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_11aa5b66-5b68-422f-b68f-03121eea5b93_3.png',
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_c_e3dbfd21-c97f-4d45-b3b8-3bf00da39f55.png',
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_c_bdaf4c83-c9af-457e-aba2-865b825fb4b6.png',
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_fcb818d8-361d-4c2b-a1d8-8a6c0772c89c_0.png',
        'u2217837778_A_book_hanging_in_the_air_against_the_backdrop_of_fcb818d8-361d-4c2b-a1d8-8a6c0772c89c_1.png',
      ];

      // Выбираем случайное изображение
      const randomImage =
        backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
      // 🌌 Загружаем изображение как base64 для правильной работы в Puppeteer
      try {
        const imagePath = path.resolve(
          './assets/bg-bible-vibecoding',
          randomImage
        );
        const imageBuffer = require('fs').readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const dataUri = `data:image/png;base64,${base64Image}`;
        bodyBackground = `url('${dataUri}') center/cover no-repeat`;
      } catch (error) {
        // Fallback к градиенту если изображение не загрузилось
        bodyBackground = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
      }
    }

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vibecoding Slide</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;700&family=Lora:wght@700&family=Noto+Color+Emoji&display=swap" rel="stylesheet">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: ${this.defaultConfig.width}px;
            height: ${this.defaultConfig.height}px;
            font-family: 'Golos Text', 'Noto Color Emoji', sans-serif;
            background: ${bodyBackground};
            color: ${textColor};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
          }
          
          /* 🌌 Минимальные декоративные элементы для Galaxy Spiral Blur */
          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            background: 
              radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
            animation: slowFloat 45s ease-in-out infinite;
          }
          
          @keyframes slowFloat {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
            50% { transform: scale(1.02) rotate(180deg); opacity: 0.3; }
          }
          
          .glass-container {
            width: 800px;
            height: 800px; /* 🔲 КВАДРАТНЫЙ центральный элемент */
            max-width: 800px;
            max-height: 800px;
            aspect-ratio: 1/1; /* ⭐ Принудительный квадрат */
            padding: 60px 50px;
            margin-bottom: 80px; /* 🔧 Отступ для footer */
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            word-wrap: break-word;
            overflow-wrap: break-word;
            
            ${glassmorphismStyles}
          }
          
          /* 🌌 Простые стили для Galaxy Spiral Blur */
          
          
          .emoji {
            font-size: 120px;
            margin-bottom: 30px;
            line-height: 1;
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
            animation: gentle-bounce 3s ease-in-out infinite;
            position: relative;
            z-index: 3;
          }
          
          @keyframes gentle-bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          h1 {
            font-family: 'Lora', 'Noto Color Emoji', serif;
            font-size: 72px;
            font-weight: 700;
            margin: 0 0 30px 0;
            line-height: 1.3;
            color: ${textColor};
            text-shadow: 
              0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 3;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            text-align: center;
            max-width: 100%;
          }
          
          p {
            font-family: 'Golos Text', 'Noto Color Emoji', sans-serif;
            font-size: 42px;
            line-height: 1.6;
            margin: 0;
            color: ${textColor};
            text-shadow: 
              0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 3;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            text-align: center;
            max-width: 100%;
            white-space: pre-wrap;
          }
          
          .subtitle {
            font-size: 36px;
            margin-top: 20px;
            color: ${textLight};
            text-shadow: 
              0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 3;
          }
          
          .footer {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            width: 720px; /* 🔹 Золотая середина - меньше центрального на 80px */
            max-width: 720px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 28px;
            color: rgba(255, 255, 255, 0.95);
            
            /* 🔹 Footer glassmorphism - Galaxy Spiral Blur стиль */
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(15px) saturate(150%);
            -webkit-backdrop-filter: blur(15px) saturate(150%);
            padding: 18px 35px;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 
              0 10px 20px rgba(0, 0, 0, 0.1),
              0 5px 10px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          
          /* 🌊 Дополнительные анимации для VibeCoding стилей */
          @keyframes waveMotion {
            0%, 100% { 
              transform: translateY(0px) scale(1);
              border-radius: 35px;
            }
            25% { 
              transform: translateY(-3px) scale(1.01);
              border-radius: 40px 30px 35px 45px;
            }
            50% { 
              transform: translateY(-5px) scale(1.02);
              border-radius: 30px 40px 30px 40px;
            }
            75% { 
              transform: translateY(-3px) scale(1.01);
              border-radius: 45px 35px 40px 30px;
            }
          }
          
          @keyframes codeFloat {
            0%, 100% { 
              transform: translateX(0px) translateY(0px);
              opacity: 0.15;
            }
            25% { 
              transform: translateX(-2px) translateY(-1px);
              opacity: 0.12;
            }
            50% { 
              transform: translateX(-1px) translateY(-2px);
              opacity: 0.18;
            }
            75% { 
              transform: translateX(1px) translateY(-1px);
              opacity: 0.14;
            }
          }
        </style>
      </head>
      <body>
        <div class="glass-container">
          <div class="emoji">${this.extractEmoji(slide.title)}</div>
          <h1>${this.removeEmoji(slide.title)}</h1>
          <p>${slide.content.replace(/\n/g, '<br>')}</p>
          ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ''}
        </div>
        <div class="footer">
          <span>@bible_vibecoder_bot</span>
          <span>${slide.order}/${totalSlides}</span>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 🧘‍♂️ Генерирует HTML с кастомным VibeCoding стилем
   */
  private generateCustomStyleTemplate(
    slide: CarouselSlide,
    totalSlides: number,
    customStyle: CustomVisualStyle
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VibeCoding Slide</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;700&family=Lora:wght@700&family=Noto+Color+Emoji&display=swap" rel="stylesheet">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: ${this.defaultConfig.width}px;
            height: ${this.defaultConfig.height}px;
            font-family: 'Golos Text', 'Noto Color Emoji', sans-serif;
            background: ${customStyle.background};
            color: ${customStyle.textColor};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
          }
          
          .card {
            position: relative;
            width: calc(90% - 80px);
            max-width: 800px;
            padding: 80px 60px;
            ${customStyle.cardStyle}
          }
          
          .emoji {
            font-size: 120px;
            margin-bottom: 40px;
            display: block;
            position: relative;
            z-index: 3;
          }
          
          h1 {
            font-family: 'Lora', serif;
            font-size: 64px;
            font-weight: 700;
            line-height: 1.2;
            margin: 0 0 40px 0;
            color: ${customStyle.textColor};
            position: relative;
            z-index: 3;
          }
          
          p {
            font-size: 42px;
            font-weight: 400;
            line-height: 1.5;
            margin: 0;
            color: ${customStyle.textColor};
            position: relative;
            z-index: 3;
          }
          
          .footer {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            width: calc(90% - 160px);
            max-width: 800px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 28px;
            color: ${customStyle.textColor};
            opacity: 0.8;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 18px 35px;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          ${customStyle.animation || ''}
        </style>
      </head>
      <body>
        <div class="card">
          <div class="emoji">${this.extractEmoji(slide.title)}</div>
          <h1>${this.removeEmoji(slide.title)}</h1>
          <p>${slide.content.replace(/\n/g, '<br>')}</p>
          ${slide.subtitle ? `<p class="subtitle">${slide.subtitle}</p>` : ''}
        </div>
        <div class="footer">
          <span>@bible_vibecoder_bot</span>
          <span>${slide.order}/${totalSlides}</span>
        </div>
      </body>
      </html>
    `;
  }

  public async generateCarouselImages(
    slides: CarouselSlide[],
    config?: Partial<CanvasConfig>,
    colorTemplate: ColorTemplate = ColorTemplate.GALAXY_SPIRAL_BLUR,
    customStyle?: CustomVisualStyle
  ): Promise<Buffer[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    logger.info('Начинаем генерацию изображений из HTML/CSS...', {
      type: LogType.BUSINESS_LOGIC,
      data: { slideCount: slides.length, colorTemplate },
    });

    const imagePromises = slides.map(async (slide, index) => {
      const html = this.generateHtmlTemplate(
        slide,
        slides.length,
        colorTemplate,
        customStyle
      );
      const output = path.join(this.outputDir, `slide-${index + 1}.png`);

      const imageBuffer = await nodeHtmlToImage({
        output,
        html,
        puppeteerArgs: {
          defaultViewport: {
            width: finalConfig.width,
            height: finalConfig.height,
          },
        },
      });

      return imageBuffer as Buffer;
    });

    const buffers = await Promise.all(imagePromises);
    logger.info('Изображения успешно сгенерированы из HTML.', {
      type: LogType.BUSINESS_LOGIC,
      data: { generatedImages: buffers.length, colorTemplate },
    });

    return buffers;
  }

  /**
   * Извлекает эмодзи из начала строки
   */
  private extractEmoji(text: string): string {
    // Более точный регекс для всех эмодзи, включая составные
    const emojiRegex =
      /^[\u{1F300}-\u{1F9FF}][\u{200D}\u{FE0F}]*[\u{1F300}-\u{1F9FF}]*|^[\u{2600}-\u{27BF}][\u{FE0F}]*|^[\u{1F100}-\u{1F1FF}]/u;
    const match = text.match(emojiRegex);
    return match ? match[0] : '✨';
  }

  /**
   * Удаляет эмодзи из начала строки
   */
  private removeEmoji(text: string): string {
    // Удаляем ВСЕ эмодзи с начала строки, включая составные типа 🧘‍♂️
    const emojiRegex =
      /^[\u{1F300}-\u{1F9FF}][\u{200D}\u{FE0F}]*[\u{1F300}-\u{1F9FF}]*|^[\u{2600}-\u{27BF}][\u{FE0F}]*|^[\u{1F100}-\u{1F1FF}]/u;
    return text.replace(emojiRegex, '').trim();
  }

  /**
   * Генерирует изображения и возвращает пути к файлам
   */
  public async generateCarouselImageFiles(
    slides: CarouselSlide[],
    config?: Partial<CanvasConfig>,
    colorTemplate: ColorTemplate = ColorTemplate.GALAXY_SPIRAL_BLUR
  ): Promise<string[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    logger.info('Начинаем генерацию файлов изображений из HTML/CSS...', {
      type: LogType.BUSINESS_LOGIC,
      data: { slideCount: slides.length, colorTemplate },
    });

    // Создаем директорию если не существует
    const fs = await import('fs/promises');
    await fs.mkdir(this.outputDir, { recursive: true });

    const imagePaths: string[] = [];

    for (let index = 0; index < slides.length; index++) {
      const slide = slides[index];
      const html = this.generateHtmlTemplate(
        slide,
        slides.length,
        colorTemplate,
        undefined
      );
      const output = path.join(this.outputDir, `slide-${index + 1}.png`);

      await nodeHtmlToImage({
        output,
        html,
        puppeteerArgs: {
          defaultViewport: {
            width: finalConfig.width,
            height: finalConfig.height,
          },
        },
      });

      // 🔧 КРИТИЧЕСКИ ВАЖНО: Проверяем что файл действительно создан!
      try {
        await fs.access(output);
        const stats = await fs.stat(output);
        if (stats.size === 0) {
          throw new Error(`Файл ${output} создан, но пустой!`);
        }
        logger.info(
          `✅ Файл создан и проверен: ${output} (${stats.size} bytes)`,
          {
            type: LogType.BUSINESS_LOGIC,
          }
        );
      } catch (error) {
        logger.error(`❌ Файл не создан или поврежден: ${output}`, {
          type: LogType.BUSINESS_LOGIC,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        throw new Error(`Не удалось создать файл изображения: ${output}`);
      }

      imagePaths.push(output);
    }

    logger.info('Файлы изображений успешно сгенерированы из HTML.', {
      type: LogType.BUSINESS_LOGIC,
      data: { generatedFiles: imagePaths.length, colorTemplate },
    });

    return imagePaths;
  }
}

// 🏭 Экспорт singleton instance
export const instagramCanvasService = new InstagramCanvasService();
