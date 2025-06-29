import nodeHtmlToImage from 'node-html-to-image';
import path from 'path';
import { CarouselSlide, CanvasConfig } from '../types';
import { logger, LogType } from '../utils/logger';

/**
 * 🎨 Цветовые темплейты для карусели
 */
export enum ColorTemplate {
  WHITE = 'white',
  MORNING = 'morning',
  OCEAN = 'ocean',
  SUNSET = 'sunset',
  NATURE = 'nature',
  FIRE = 'fire',
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
 * Сервис для создания ПРОФЕССИОНАЛЬНЫХ изображений из HTML/CSS.
 * Гарантирует идеальный рендеринг шрифтов, эмодзи и верстки.
 */
export class InstagramCanvasService {
  private readonly defaultConfig: CanvasConfig = {
    width: 1080,
    height: 1350,
    quality: 0.9,
    format: 'png',
  };

  private readonly outputDir = path.resolve('./carousel-output');

  /**
   * 🎨 Получить все доступные цветовые темплейты
   */
  public static getColorTemplates(): Record<ColorTemplate, TemplateDesign> {
    return {
      [ColorTemplate.WHITE]: {
        name: 'Белоснежный',
        emoji: '🤍',
        background: '#ffffff',
        accent: 'rgba(44, 62, 80, 0.1)',
        cardBackground: 'rgba(255, 255, 255, 0.95)',
      },
      [ColorTemplate.MORNING]: {
        name: 'Утренний',
        emoji: '🌅',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accent: 'rgba(102, 126, 234, 0.3)',
        cardBackground: 'rgba(255, 255, 255, 0.18)',
      },
      [ColorTemplate.OCEAN]: {
        name: 'Океанский',
        emoji: '🌊',
        background:
          'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #6c5ce7 100%)',
        accent: 'rgba(116, 185, 255, 0.3)',
        cardBackground: 'rgba(255, 255, 255, 0.18)',
      },
      [ColorTemplate.SUNSET]: {
        name: 'Розовый закат',
        emoji: '🌸',
        background:
          'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e84393 100%)',
        accent: 'rgba(253, 121, 168, 0.3)',
        cardBackground: 'rgba(255, 255, 255, 0.18)',
      },
      [ColorTemplate.NATURE]: {
        name: 'Природный',
        emoji: '🍃',
        background:
          'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #74b9ff 100%)',
        accent: 'rgba(0, 184, 148, 0.3)',
        cardBackground: 'rgba(255, 255, 255, 0.18)',
      },
      [ColorTemplate.FIRE]: {
        name: 'Огненный',
        emoji: '🔥',
        background:
          'linear-gradient(135deg, #fd79a8 0%, #ff7675 50%, #e84393 100%)',
        accent: 'rgba(255, 118, 117, 0.3)',
        cardBackground: 'rgba(255, 255, 255, 0.18)',
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
    colorTemplate: ColorTemplate = ColorTemplate.MORNING
  ): string {
    const templates = InstagramCanvasService.getColorTemplates();
    const design = templates[colorTemplate];
    const textColor =
      colorTemplate === ColorTemplate.WHITE ? '#2c3e50' : '#2c3e50';
    const textLight =
      colorTemplate === ColorTemplate.WHITE
        ? 'rgba(44, 62, 80, 0.8)'
        : 'rgba(44, 62, 80, 0.8)';

    // Специальная логика для белого темплейта
    const isWhiteTemplate = colorTemplate === ColorTemplate.WHITE;
    const glassmorphismStyles = isWhiteTemplate
      ? `
        /* 🤍 БЕЛЫЙ ТЕМПЛЕЙТ - минималистичный дизайн */
        background: ${design.cardBackground};
        border-radius: 40px;
        border: 2px solid rgba(44, 62, 80, 0.1);
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.08),
          0 10px 20px rgba(0, 0, 0, 0.04),
          0 2px 8px rgba(0, 0, 0, 0.02);
      `
      : `
        /* 🪟 ПРОДВИНУТЫЙ APPLE GLASSMORPHISM */
        background: ${design.cardBackground};
        backdrop-filter: blur(25px) saturate(200%);
        -webkit-backdrop-filter: blur(25px) saturate(200%);
        border-radius: 40px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 
          0 30px 60px rgba(0, 0, 0, 0.12),
          0 15px 30px rgba(0, 0, 0, 0.08),
          0 5px 15px rgba(0, 0, 0, 0.05),
          inset 0 2px 0 rgba(255, 255, 255, 0.5),
          inset 0 -2px 0 rgba(255, 255, 255, 0.2);
      `;

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
            background: ${design.background};
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
          
          ${
            !isWhiteTemplate
              ? `
          /* 🌟 Декоративные элементы только для цветных темплейтов */
          body::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: 
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 60% 20%, ${design.accent} 0%, transparent 40%);
            animation: float 25s ease-in-out infinite;
            pointer-events: none;
          }
          
          body::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 10% 90%, rgba(255, 255, 255, 0.05) 0%, transparent 60%),
              radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
            animation: float 30s ease-in-out infinite reverse;
            pointer-events: none;
          }
          
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1); 
              opacity: 1;
            }
            33% { 
              transform: translateY(-15px) rotate(120deg) scale(1.05); 
              opacity: 0.8;
            }
            66% { 
              transform: translateY(10px) rotate(240deg) scale(0.95); 
              opacity: 0.9;
            }
          }
          `
              : ''
          }
          
          .glass-container {
            width: 90%;
            max-width: 900px;
            height: auto;
            min-height: 80%;
            padding: 60px 80px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            
            ${glassmorphismStyles}
          }
          
          ${
            !isWhiteTemplate
              ? `
          /* ✨ Shine эффект только для цветных темплейтов */
          .glass-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, 
              transparent 0%, 
              rgba(255, 255, 255, 0.8) 20%,
              rgba(255, 255, 255, 0.9) 50%, 
              rgba(255, 255, 255, 0.8) 80%,
              transparent 100%);
            border-radius: 40px 40px 0 0;
          }
          
          /* 🌈 Accent border для цветных темплейтов */
          .glass-container::after {
            content: '';
            position: absolute;
            inset: -1px;
            padding: 1px;
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.6), 
              rgba(255, 255, 255, 0.2), 
              rgba(255, 255, 255, 0.4));
            border-radius: 40px;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: destination-out;
            z-index: -1;
          }
          `
              : ''
          }
          
          .emoji {
            font-size: 120px;
            margin-bottom: 30px;
            line-height: 1;
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
            animation: gentle-bounce 3s ease-in-out infinite;
          }
          
          @keyframes gentle-bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          h1 {
            font-family: 'Lora', 'Noto Color Emoji', serif;
            font-size: 84px;
            font-weight: 700;
            margin: 0 0 40px 0;
            line-height: 1.2;
            color: ${textColor};
            text-shadow: 
              0 2px 4px rgba(0, 0, 0, 0.1),
              0 4px 8px rgba(0, 0, 0, 0.05);
          }
          
          p {
            font-family: 'Golos Text', 'Noto Color Emoji', sans-serif;
            font-size: 48px;
            line-height: 1.5;
            margin: 0;
            color: ${textColor};
            text-shadow: 
              0 1px 2px rgba(0, 0, 0, 0.1),
              0 2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .subtitle {
            font-size: 36px;
            margin-top: 20px;
            color: ${textLight};
            text-shadow: 
              0 1px 2px rgba(0, 0, 0, 0.1),
              0 2px 4px rgba(0, 0, 0, 0.05);
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
            color: ${isWhiteTemplate ? 'rgba(44, 62, 80, 0.8)' : 'rgba(255, 255, 255, 0.95)'};
            
            /* 🔹 Footer glassmorphism */
            background: ${isWhiteTemplate ? 'rgba(44, 62, 80, 0.05)' : 'rgba(255, 255, 255, 0.15)'};
            ${!isWhiteTemplate ? 'backdrop-filter: blur(15px) saturate(150%); -webkit-backdrop-filter: blur(15px) saturate(150%);' : ''}
            padding: 18px 35px;
            border-radius: 25px;
            border: 1px solid ${isWhiteTemplate ? 'rgba(44, 62, 80, 0.1)' : 'rgba(255, 255, 255, 0.3)'};
            box-shadow: 
              0 10px 20px rgba(0, 0, 0, 0.1),
              0 5px 10px rgba(0, 0, 0, 0.05),
              ${!isWhiteTemplate ? 'inset 0 1px 0 rgba(255, 255, 255, 0.3)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.5)'};
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

  public async generateCarouselImages(
    slides: CarouselSlide[],
    config?: Partial<CanvasConfig>,
    colorTemplate: ColorTemplate = ColorTemplate.MORNING
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
        colorTemplate
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
    colorTemplate: ColorTemplate = ColorTemplate.MORNING
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
        colorTemplate
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
