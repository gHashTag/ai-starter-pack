import nodeHtmlToImage from 'node-html-to-image';
import path from 'path';
import { CarouselSlide, CanvasConfig } from '../types';
import { logger, LogType } from '../utils/logger';

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
   * Генерирует HTML-шаблон для одного слайда.
   * Использует Google Fonts для элегантных шрифтов и поддержки эмодзи.
   */
  private generateHtmlTemplate(
    slide: CarouselSlide,
    totalSlides: number
  ): string {
    // 🎨 СТРОГО БЕЛЫЙ ФОН для всех слайдов
    const getSlideColors = () => {
      return {
        background: '#ffffff',
        text: '#2c3e50',
      }; // Только белый фон и темно-серый текст
    };

    const colors = getSlideColors();
    const backgroundColor = slide.colorScheme?.background || colors.background;
    const textColor = slide.colorScheme?.text || colors.text;

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
            background-color: ${backgroundColor};
            color: ${textColor};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
          }
          
          .container {
            width: 100%;
            height: 100%;
            padding: 80px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          
          .emoji {
            font-size: 120px;
            margin-bottom: 30px;
            line-height: 1;
          }
          
          h1 {
            font-family: 'Lora', 'Noto Color Emoji', serif;
            font-size: 84px;
            font-weight: 700;
            margin: 0 0 40px 0;
            line-height: 1.2;
            color: ${textColor};
          }
          
          p {
            font-family: 'Golos Text', 'Noto Color Emoji', sans-serif;
            font-size: 48px;
            line-height: 1.5;
            margin: 0;
            color: ${textColor};
          }
          
          .subtitle {
            font-size: 36px;
            margin-top: 20px;
            color: ${textColor};
            opacity: 0.8;
          }
          
          .footer {
            position: absolute;
            bottom: 50px;
            width: calc(100% - 160px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 28px;
            color: ${textColor};
            opacity: 0.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
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
    config?: Partial<CanvasConfig>
  ): Promise<Buffer[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    logger.info('Начинаем генерацию изображений из HTML/CSS...', {
      type: LogType.BUSINESS_LOGIC,
      data: { slideCount: slides.length },
    });

    const imagePromises = slides.map(async (slide, index) => {
      const html = this.generateHtmlTemplate(slide, slides.length);
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
      data: { generatedImages: buffers.length },
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
    config?: Partial<CanvasConfig>
  ): Promise<string[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    logger.info('Начинаем генерацию файлов изображений из HTML/CSS...', {
      type: LogType.BUSINESS_LOGIC,
      data: { slideCount: slides.length },
    });

    // Создаем директорию если не существует
    const fs = await import('fs/promises');
    await fs.mkdir(this.outputDir, { recursive: true });

    const imagePaths: string[] = [];

    for (let index = 0; index < slides.length; index++) {
      const slide = slides[index];
      const html = this.generateHtmlTemplate(slide, slides.length);
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
      data: { generatedFiles: imagePaths.length },
    });

    return imagePaths;
  }
}
