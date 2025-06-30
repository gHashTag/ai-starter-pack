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
  // 🔥 НОВЫЕ LUXURY ТЕМПЛЕЙТЫ
  BLACK_GOLD = 'black_gold',
  EMERALD_LUXURY = 'emerald_luxury',
  ROYAL_PURPLE = 'royal_purple',
  PLATINUM_SILVER = 'platinum_silver',
  BURGUNDY_GOLD = 'burgundy_gold',
  MIDNIGHT_BLUE = 'midnight_blue',
  COPPER_BRONZE = 'copper_bronze',
  FOREST_GOLD = 'forest_gold',
  ROSE_GOLD = 'rose_gold',
  CHARCOAL_MINT = 'charcoal_mint',
  // 🍎 APPLE FROSTED GLASS ТЕМПЛЕЙТЫ
  APPLE_GLASS_LIGHT = 'apple_glass_light',
  APPLE_GLASS_DARK = 'apple_glass_dark',
  APPLE_GLASS_BLUE = 'apple_glass_blue',
  APPLE_GLASS_GREEN = 'apple_glass_green',
  APPLE_GLASS_PURPLE = 'apple_glass_purple',
  APPLE_GLASS_PINK = 'apple_glass_pink',
  APPLE_GLASS_GOLD = 'apple_glass_gold',
  // 🪟 СОВРЕМЕННЫЙ GLASSMORPHISM
  MODERN_GLASSMORPHISM = 'modern_glassmorphism',
  // 🧘‍♂️ МЕДИТАТИВНЫЙ NEOMORPHISM
  NEOMORPHISM = 'neomorphism',
  // 🌙 VIBECODING СТИЛИ
  NIGHT_FLOW = 'night_flow',
  WAVE_TECHNIQUE = 'wave_technique',
  // 💻 VIBECODING С КОДОМ
  CODE_MATRIX = 'code_matrix',
  CODE_PERSPECTIVE = 'code_perspective',
  CODE_HOLOGRAM = 'code_hologram',
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
      // 🔥 НОВЫЕ LUXURY ТЕМПЛЕЙТЫ
      [ColorTemplate.BLACK_GOLD]: {
        name: 'Черное золото',
        emoji: '🖤',
        background:
          'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2c2c2c 100%)',
        accent: 'rgba(255, 215, 0, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.08)',
      },
      [ColorTemplate.EMERALD_LUXURY]: {
        name: 'Изумрудная роскошь',
        emoji: '💎',
        background:
          'linear-gradient(135deg, #0D2B1D 0%, #345635 50%, #6B8F71 100%)',
        accent: 'rgba(174, 195, 176, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      [ColorTemplate.ROYAL_PURPLE]: {
        name: 'Королевский пурпур',
        emoji: '👑',
        background:
          'linear-gradient(135deg, #4A235A 0%, #6C3483 50%, #A569BD 100%)',
        accent: 'rgba(165, 105, 189, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      [ColorTemplate.PLATINUM_SILVER]: {
        name: 'Платиновое серебро',
        emoji: '🥈',
        background:
          'linear-gradient(135deg, #2C3E50 0%, #4A6741 50%, #95A5A6 100%)',
        accent: 'rgba(149, 165, 166, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.12)',
      },
      [ColorTemplate.BURGUNDY_GOLD]: {
        name: 'Бургундия с золотом',
        emoji: '🍷',
        background:
          'linear-gradient(135deg, #7E102C 0%, #A0522D 50%, #D4AC0D 100%)',
        accent: 'rgba(212, 172, 13, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      [ColorTemplate.MIDNIGHT_BLUE]: {
        name: 'Полуночный синий',
        emoji: '🌙',
        background:
          'linear-gradient(135deg, #1A5276 0%, #2980B9 50%, #85C1E9 100%)',
        accent: 'rgba(133, 193, 233, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      [ColorTemplate.COPPER_BRONZE]: {
        name: 'Медная бронза',
        emoji: '🔶',
        background:
          'linear-gradient(135deg, #804E27 0%, #BF7D3A 50%, #F7CA79 100%)',
        accent: 'rgba(247, 202, 121, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      [ColorTemplate.FOREST_GOLD]: {
        name: 'Лесное золото',
        emoji: '🌲',
        background:
          'linear-gradient(135deg, #0A4D3A 0%, #1B6B47 50%, #D4AC0D 100%)',
        accent: 'rgba(212, 172, 13, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      [ColorTemplate.ROSE_GOLD]: {
        name: 'Розовое золото',
        emoji: '🌹',
        background:
          'linear-gradient(135deg, #E91E63 0%, #F06292 50%, #FFB74D 100%)',
        accent: 'rgba(255, 183, 77, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      [ColorTemplate.CHARCOAL_MINT]: {
        name: 'Угольная мята',
        emoji: '🌿',
        background:
          'linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1ABC9C 100%)',
        accent: 'rgba(26, 188, 156, 0.4)',
        cardBackground: 'rgba(255, 255, 255, 0.15)',
      },
      // 🍎 APPLE FROSTED GLASS ТЕМПЛЕЙТЫ
      [ColorTemplate.APPLE_GLASS_LIGHT]: {
        name: 'Apple Glass Light',
        emoji: '🤍',
        background:
          'linear-gradient(145deg, rgba(248, 249, 250, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        accent: 'rgba(108, 117, 125, 0.15)',
        cardBackground: 'rgba(255, 255, 255, 0.85)',
      },
      [ColorTemplate.APPLE_GLASS_DARK]: {
        name: 'Apple Glass Dark',
        emoji: '🖤',
        background:
          'linear-gradient(145deg, rgba(33, 37, 41, 0.95) 0%, rgba(52, 58, 64, 0.9) 100%)',
        accent: 'rgba(173, 181, 189, 0.2)',
        cardBackground: 'rgba(52, 58, 64, 0.8)',
      },
      [ColorTemplate.APPLE_GLASS_BLUE]: {
        name: 'Apple Glass Blue',
        emoji: '💙',
        background:
          'linear-gradient(145deg, rgba(240, 248, 255, 0.95) 0%, rgba(230, 244, 255, 0.9) 100%)',
        accent: 'rgba(13, 110, 253, 0.15)',
        cardBackground: 'rgba(240, 248, 255, 0.85)',
      },
      [ColorTemplate.APPLE_GLASS_GREEN]: {
        name: 'Apple Glass Green',
        emoji: '💚',
        background:
          'linear-gradient(145deg, rgba(240, 253, 244, 0.95) 0%, rgba(230, 252, 245, 0.9) 100%)',
        accent: 'rgba(25, 135, 84, 0.15)',
        cardBackground: 'rgba(240, 253, 244, 0.85)',
      },
      [ColorTemplate.APPLE_GLASS_PURPLE]: {
        name: 'Apple Glass Purple',
        emoji: '💜',
        background:
          'linear-gradient(145deg, rgba(248, 240, 252, 0.95) 0%, rgba(243, 232, 255, 0.9) 100%)',
        accent: 'rgba(111, 66, 193, 0.15)',
        cardBackground: 'rgba(248, 240, 252, 0.85)',
      },
      [ColorTemplate.APPLE_GLASS_PINK]: {
        name: 'Apple Glass Pink',
        emoji: '🩷',
        background:
          'linear-gradient(145deg, rgba(255, 240, 245, 0.95) 0%, rgba(255, 228, 230, 0.9) 100%)',
        accent: 'rgba(214, 51, 108, 0.15)',
        cardBackground: 'rgba(255, 240, 245, 0.85)',
      },
      [ColorTemplate.APPLE_GLASS_GOLD]: {
        name: 'Apple Glass Gold',
        emoji: '🧡',
        background:
          'linear-gradient(145deg, rgba(255, 248, 240, 0.95) 0%, rgba(254, 243, 199, 0.9) 100%)',
        accent: 'rgba(255, 193, 7, 0.2)',
        cardBackground: 'rgba(255, 248, 240, 0.85)',
      },
      // 🪟 СОВРЕМЕННЫЙ GLASSMORPHISM
      [ColorTemplate.MODERN_GLASSMORPHISM]: {
        name: '💎 Фотореализм Стекло',
        emoji: '💎',
        background:
          'radial-gradient(circle at 20% 30%, #0f0f23 0%, #000000 100%)',
        accent: 'rgba(100, 255, 218, 0.8)',
        cardBackground: 'rgba(255, 255, 255, 0.08)',
      },
      // 🧘‍♂️ МЕДИТАТИВНЫЙ NEOMORPHISM
      [ColorTemplate.NEOMORPHISM]: {
        name: '🧘‍♂️ Медитативный Neomorphism',
        emoji: '🧘‍♂️',
        background: 'linear-gradient(145deg, #e0e0e0 0%, #c9c9c9 100%)',
        accent: 'rgba(200, 200, 200, 0.3)',
        cardBackground: '#e0e0e0',
      },
      // 🌙 VIBECODING СТИЛИ
      [ColorTemplate.NIGHT_FLOW]: {
        name: '🌙 Ночной Поток',
        emoji: '🌙',
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        accent: 'rgba(255, 255, 255, 0.1)',
        cardBackground: 'rgba(255, 255, 255, 0.05)',
      },
      [ColorTemplate.WAVE_TECHNIQUE]: {
        name: '🌊 Волновая Техника',
        emoji: '🌊',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        accent: 'rgba(255, 255, 255, 0.3)',
        cardBackground: 'rgba(255, 255, 255, 0.12)',
      },
      // 💻 VIBECODING С КОДОМ
      [ColorTemplate.CODE_MATRIX]: {
        name: '💻 Code Matrix',
        emoji: '💻',
        background: 'linear-gradient(135deg, #0d1421 0%, #1a2332 100%)',
        accent: 'rgba(0, 255, 127, 0.3)',
        cardBackground: 'rgba(0, 0, 0, 0.7)',
      },
      [ColorTemplate.CODE_PERSPECTIVE]: {
        name: '📐 Code Perspective',
        emoji: '📐',
        background: 'linear-gradient(135deg, #2c1810 0%, #4a2c17 100%)',
        accent: 'rgba(255, 165, 0, 0.3)',
        cardBackground: 'rgba(0, 0, 0, 0.6)',
      },
      [ColorTemplate.CODE_HOLOGRAM]: {
        name: '🔮 Code Hologram',
        emoji: '🔮',
        background: 'linear-gradient(135deg, #1a0033 0%, #330066 100%)',
        accent: 'rgba(186, 85, 255, 0.3)',
        cardBackground: 'rgba(255, 255, 255, 0.08)',
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
    colorTemplate: ColorTemplate = ColorTemplate.MORNING,
    customStyle?: CustomVisualStyle
  ): string {
    // 🧘‍♂️ Если передан кастомный стиль, используем его
    if (customStyle) {
      return this.generateCustomStyleTemplate(slide, totalSlides, customStyle);
    }

    const templates = InstagramCanvasService.getColorTemplates();
    const design = templates[colorTemplate];

    // 🎨 Специальные цвета текста для разных темплейтов
    let textColor = '#2c3e50';
    let textLight = 'rgba(44, 62, 80, 0.8)';

    // Темные темплейты с золотым/светлым текстом
    if (colorTemplate === ColorTemplate.BLACK_GOLD) {
      textColor = '#FFD700'; // Золотой текст
      textLight = 'rgba(255, 215, 0, 0.8)';
    } else if (
      colorTemplate === ColorTemplate.EMERALD_LUXURY ||
      colorTemplate === ColorTemplate.ROYAL_PURPLE ||
      colorTemplate === ColorTemplate.MIDNIGHT_BLUE ||
      colorTemplate === ColorTemplate.CHARCOAL_MINT
    ) {
      textColor = '#ffffff'; // Белый текст для темных фонов
      textLight = 'rgba(255, 255, 255, 0.8)';
    } else if (
      colorTemplate === ColorTemplate.BURGUNDY_GOLD ||
      colorTemplate === ColorTemplate.FOREST_GOLD
    ) {
      textColor = '#FFD700'; // Золотой текст
      textLight = 'rgba(255, 215, 0, 0.8)';
    } else if (
      colorTemplate === ColorTemplate.COPPER_BRONZE ||
      colorTemplate === ColorTemplate.ROSE_GOLD
    ) {
      textColor = '#ffffff'; // Белый текст
      textLight = 'rgba(255, 255, 255, 0.8)';
    } else if (colorTemplate === ColorTemplate.PLATINUM_SILVER) {
      textColor = '#E8E8E8'; // Светло-серый
      textLight = 'rgba(232, 232, 232, 0.8)';
    }
    // 🍎 Apple Glass темплейты
    else if (colorTemplate === ColorTemplate.APPLE_GLASS_DARK) {
      textColor = '#ffffff'; // Белый текст для темного glass
      textLight = 'rgba(255, 255, 255, 0.8)';
    } else if (
      colorTemplate === ColorTemplate.APPLE_GLASS_LIGHT ||
      colorTemplate === ColorTemplate.APPLE_GLASS_BLUE ||
      colorTemplate === ColorTemplate.APPLE_GLASS_GREEN ||
      colorTemplate === ColorTemplate.APPLE_GLASS_PURPLE ||
      colorTemplate === ColorTemplate.APPLE_GLASS_PINK ||
      colorTemplate === ColorTemplate.APPLE_GLASS_GOLD
    ) {
      textColor = '#1d1d1f'; // Apple-стиль темно-серый текст
      textLight = 'rgba(29, 29, 31, 0.8)';
    }
    // 🪟 Современный Glassmorphism
    else if (colorTemplate === ColorTemplate.MODERN_GLASSMORPHISM) {
      textColor = '#ffffff'; // Белый текст для темного фона
      textLight = 'rgba(255, 255, 255, 0.9)';
    }
    // 🧘‍♂️ Медитативный Neomorphism
    else if (colorTemplate === ColorTemplate.NEOMORPHISM) {
      textColor = '#4a4a4a'; // Темно-серый текст для светлого нейроморфизма
      textLight = 'rgba(74, 74, 74, 0.8)';
    }
    // 🌙 VibeCoding стили
    else if (colorTemplate === ColorTemplate.NIGHT_FLOW) {
      textColor = '#c9c9c9'; // Светло-серый для ночного потока
      textLight = 'rgba(201, 201, 201, 0.8)';
    } else if (colorTemplate === ColorTemplate.WAVE_TECHNIQUE) {
      textColor = '#ffffff'; // Белый для волновой техники
      textLight = 'rgba(255, 255, 255, 0.9)';
    }
    // 💻 VibeCoding с кодом
    else if (
      colorTemplate === ColorTemplate.CODE_MATRIX ||
      colorTemplate === ColorTemplate.CODE_PERSPECTIVE ||
      colorTemplate === ColorTemplate.CODE_HOLOGRAM
    ) {
      textColor = '#ffffff'; // Белый текст для темных code стилей
      textLight = 'rgba(255, 255, 255, 0.9)';
    }

    // Специальная логика для разных типов темплейтов
    const isWhiteTemplate = colorTemplate === ColorTemplate.WHITE;
    const isAppleGlassTemplate = [
      ColorTemplate.APPLE_GLASS_LIGHT,
      ColorTemplate.APPLE_GLASS_DARK,
      ColorTemplate.APPLE_GLASS_BLUE,
      ColorTemplate.APPLE_GLASS_GREEN,
      ColorTemplate.APPLE_GLASS_PURPLE,
      ColorTemplate.APPLE_GLASS_PINK,
      ColorTemplate.APPLE_GLASS_GOLD,
    ].includes(colorTemplate);
    const isModernGlassmorphismTemplate =
      colorTemplate === ColorTemplate.MODERN_GLASSMORPHISM;
    const isNeomorphismTemplate = colorTemplate === ColorTemplate.NEOMORPHISM;
    const isNightFlowTemplate = colorTemplate === ColorTemplate.NIGHT_FLOW;
    const isWaveTechniqueTemplate =
      colorTemplate === ColorTemplate.WAVE_TECHNIQUE;
    const isCodeTemplate = [
      ColorTemplate.CODE_MATRIX,
      ColorTemplate.CODE_PERSPECTIVE,
      ColorTemplate.CODE_HOLOGRAM,
    ].includes(colorTemplate);

    let glassmorphismStyles = '';

    if (isWhiteTemplate) {
      glassmorphismStyles = `
        /* 🤍 БЕЛЫЙ ТЕМПЛЕЙТ - минималистичный дизайн */
        background: ${design.cardBackground};
        border-radius: 40px;
        border: 2px solid rgba(44, 62, 80, 0.1);
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.08),
          0 10px 20px rgba(0, 0, 0, 0.04),
          0 2px 8px rgba(0, 0, 0, 0.02);
      `;
    } else if (isAppleGlassTemplate) {
      glassmorphismStyles = `
        /* 🍎 APPLE FROSTED GLASS - как в macOS/iOS */
        background: ${design.cardBackground};
        backdrop-filter: blur(30px) saturate(180%);
        -webkit-backdrop-filter: blur(30px) saturate(180%);
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 
          0 25px 50px rgba(0, 0, 0, 0.1),
          0 12px 25px rgba(0, 0, 0, 0.05),
          0 6px 12px rgba(0, 0, 0, 0.03),
          inset 0 1px 0 rgba(255, 255, 255, 0.8),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1);
      `;
    } else if (isModernGlassmorphismTemplate) {
      glassmorphismStyles = `
        /* 💎 ФОТОРЕАЛИСТИЧНОЕ СТЕКЛО - многослойный эффект */
        background: ${design.cardBackground};
        backdrop-filter: blur(25px) saturate(150%);
        -webkit-backdrop-filter: blur(25px) saturate(150%);
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 
          0 25px 50px rgba(0, 0, 0, 0.6),
          0 12px 24px rgba(0, 0, 0, 0.4),
          0 6px 12px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        position: relative;
        transform: perspective(1000px) rotateX(2deg);
        overflow: hidden;
      `;
    } else if (isNeomorphismTemplate) {
      glassmorphismStyles = `
        /* 🧘‍♂️ МЕДИТАТИВНЫЙ NEOMORPHISM - soft UI эффект */
        background: ${design.cardBackground};
        border-radius: 30px;
        border: none;
        box-shadow: 
          15px 15px 30px rgba(163, 177, 198, 0.6),
          -15px -15px 30px rgba(255, 255, 255, 0.8),
          inset 2px 2px 4px rgba(163, 177, 198, 0.2),
          inset -2px -2px 4px rgba(255, 255, 255, 0.5);
        position: relative;
      `;
    } else if (isNightFlowTemplate) {
      glassmorphismStyles = `
        /* 🌙 НОЧНОЙ ПОТОК - темный медитативный стиль */
        background: ${design.cardBackground};
        backdrop-filter: blur(25px) saturate(120%);
        -webkit-backdrop-filter: blur(25px) saturate(120%);
        border-radius: 35px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 
          0 40px 80px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        position: relative;
      `;
    } else if (isWaveTechniqueTemplate) {
      glassmorphismStyles = `
        /* 🌊 ВОЛНОВАЯ ТЕХНИКА - плавные движения */
        background: ${design.cardBackground};
        backdrop-filter: blur(25px) saturate(170%);
        -webkit-backdrop-filter: blur(25px) saturate(170%);
        border-radius: 35px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 30px 60px rgba(79, 172, 254, 0.4);
        animation: waveMotion 8s ease-in-out infinite;
      `;
    } else if (isCodeTemplate) {
      // 💻 Специальные стили с кодом в фоне
      let codeBackground = '';
      let codeColor = '';
      let perspective = '';

      if (colorTemplate === ColorTemplate.CODE_MATRIX) {
        codeColor = 'rgba(0, 255, 127, 0.15)';
        codeBackground = `
          /* Matrix style код */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ctext x='10' y='20' font-family='monospace' font-size='8' fill='%2300ff7f' opacity='0.3'%3Efunction()%7B%3C/text%3E%3Ctext x='5' y='35' font-family='monospace' font-size='8' fill='%2300ff7f' opacity='0.2'%3Eif(true)%7B%3C/text%3E%3Ctext x='15' y='50' font-family='monospace' font-size='8' fill='%2300ff7f' opacity='0.4'%3Ereturn;%3C/text%3E%3Ctext x='20' y='65' font-family='monospace' font-size='8' fill='%2300ff7f' opacity='0.3'%3E%7D%3C/text%3E%3Ctext x='8' y='80' font-family='monospace' font-size='8' fill='%2300ff7f' opacity='0.2'%3Econsole.log%3C/text%3E%3C/svg%3E");
        `;
      } else if (colorTemplate === ColorTemplate.CODE_PERSPECTIVE) {
        codeColor = 'rgba(255, 165, 0, 0.15)';
        perspective =
          'transform: perspective(1000px) rotateX(8deg) rotateY(-3deg);';
        codeBackground = `
          /* Perspective код под углом */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ctext x='5' y='15' font-family='monospace' font-size='9' fill='%23ffa500' opacity='0.3' transform='skewX(-15deg)'%3Eclass VibeCoding%7B%3C/text%3E%3Ctext x='10' y='30' font-family='monospace' font-size='9' fill='%23ffa500' opacity='0.2' transform='skewX(-15deg)'%3E  meditate()%7B%3C/text%3E%3Ctext x='15' y='45' font-family='monospace' font-size='9' fill='%23ffa500' opacity='0.4' transform='skewX(-15deg)'%3E    this.flow%3C/text%3E%3Ctext x='10' y='60' font-family='monospace' font-size='9' fill='%23ffa500' opacity='0.3' transform='skewX(-15deg)'%3E  %7D%3C/text%3E%3Ctext x='5' y='75' font-family='monospace' font-size='9' fill='%23ffa500' opacity='0.2' transform='skewX(-15deg)'%3E%7D%3C/text%3E%3C/svg%3E");
        `;
      } else if (colorTemplate === ColorTemplate.CODE_HOLOGRAM) {
        codeColor = 'rgba(186, 85, 255, 0.15)';
        codeBackground = `
          /* Hologram код с эффектом */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ctext x='5' y='18' font-family='monospace' font-size='8' fill='%23ba55ff' opacity='0.4'%3Eawait ai.think()%3C/text%3E%3Ctext x='10' y='33' font-family='monospace' font-size='8' fill='%23ba55ff' opacity='0.3'%3Eflow.start()%3C/text%3E%3Ctext x='15' y='48' font-family='monospace' font-size='8' fill='%23ba55ff' opacity='0.5'%3Emeditation%3C/text%3E%3Ctext x='8' y='63' font-family='monospace' font-size='8' fill='%23ba55ff' opacity='0.2'%3E.activate()%3C/text%3E%3Ctext x='12' y='78' font-family='monospace' font-size='8' fill='%23ba55ff' opacity='0.4'%3Ecoding.zen%3C/text%3E%3C/svg%3E");
        `;
      }

      glassmorphismStyles = `
        /* 💻 CODE STYLE с кодом в фоне */
        background: ${design.cardBackground};
        ${codeBackground}
        backdrop-filter: blur(20px) saturate(140%);
        -webkit-backdrop-filter: blur(20px) saturate(140%);
        border-radius: 25px;
        border: 2px solid ${codeColor};
        box-shadow: 
          0 25px 50px rgba(0, 0, 0, 0.7),
          0 12px 24px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 ${codeColor};
        position: relative;
        ${perspective}
        overflow: hidden;
      `;
    } else {
      glassmorphismStyles = `
        /* 🪟 ПРОДВИНУТЫЙ GLASSMORPHISM */
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
            !isWhiteTemplate &&
            !isAppleGlassTemplate &&
            !isModernGlassmorphismTemplate &&
            !isNeomorphismTemplate
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
              : isAppleGlassTemplate
                ? `
          /* 🍎 Минималистичные Apple Glass элементы */
          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
            pointer-events: none;
          }
          `
                : isModernGlassmorphismTemplate
                  ? `
          /* 💎 Фотореалистичный фон с кодом для стеклянного эффекта */
          body::before {
            content: "function vibeCoding() {\\A  const wisdom = 'Библия кодинга';\\A  return {\\A    knowledge: true,\\A    inspiration: '∞',\\A    path: 'enlightenment'\\A  };\\A}\\A\\Aconst developer = {\\A  skills: ['HTML', 'CSS', 'JS'],\\A  mindset: 'growth',\\A  passion: 'unlimited'\\A};\\A\\A// Путь к мастерству\\Aif (dedication === true) {\\A  achieve(greatness);\\A}\\A\\A/* Создание будущего */\\A.future {\\A  display: flex;\\A  direction: forward;\\A  position: absolute;\\A  top: 0;\\A  achievement: unlocked;\\A}\\A\\A@keyframes progress {\\A  from { skill: 0%; }\\A  to { skill: 100%; }\\A}\\A\\A// Библия VibeCoding\\Aconst enlightenment = {\\A  html: 'structure',\\A  css: 'beauty',\\A  js: 'magic'\\A};";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            white-space: pre-line;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 11px;
            line-height: 1.4;
            color: rgba(100, 255, 218, 0.15);
            padding: 20px;
            overflow: hidden;
            pointer-events: none;
            background: 
              linear-gradient(45deg, rgba(13, 110, 253, 0.05) 0%, transparent 50%),
              linear-gradient(-45deg, rgba(220, 53, 69, 0.05) 0%, transparent 50%);
            animation: codeFloat 20s ease-in-out infinite;
          }
          
          body::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 25% 25%, rgba(13, 110, 253, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(220, 53, 69, 0.12) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(100, 255, 218, 0.08) 0%, transparent 60%);
            animation: codeFloat 25s ease-in-out infinite reverse;
            pointer-events: none;
          }
          
          @keyframes codeFloat {
            0%, 100% { transform: translateY(0px); opacity: 1; }
            50% { transform: translateY(-10px); opacity: 0.8; }
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
            !isWhiteTemplate &&
            !isAppleGlassTemplate &&
            !isModernGlassmorphismTemplate &&
            !isNeomorphismTemplate
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
              : isModernGlassmorphismTemplate
                ? `
          /* 💎 Фотореалистичные слои стекла */
          .glass-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.1) 0%, 
              rgba(255, 255, 255, 0.05) 50%, 
              rgba(255, 255, 255, 0.1) 100%
            );
            border-radius: 24px;
            z-index: 1;
            pointer-events: none;
          }
          
          .glass-container::after {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            width: 60px;
            height: 60px;
            background: radial-gradient(
              circle at center,
              rgba(255, 255, 255, 0.3) 0%,
              rgba(255, 255, 255, 0.1) 40%,
              transparent 70%
            );
            border-radius: 50%;
            z-index: 2;
            pointer-events: none;
            filter: blur(2px);
          }`
                : isNeomorphismTemplate
                  ? `
          /* 🧘‍♂️ Медитативные элементы Neomorphism */
          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 60%),
              radial-gradient(circle at 80% 80%, rgba(163, 177, 198, 0.08) 0%, transparent 60%);
            pointer-events: none;
          }
          
          .glass-container::before {
            content: '';
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            background: linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(163, 177, 198, 0.2) 100%
            );
            border-radius: 31px;
            z-index: -1;
            pointer-events: none;
          }
          
          .glass-container::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 40px;
            height: 40px;
            background: radial-gradient(
              circle at center,
              rgba(255, 255, 255, 0.4) 0%,
              transparent 70%
            );
            border-radius: 50%;
            z-index: 2;
            pointer-events: none;
            filter: blur(1px);
          }`
                  : ''
          }
          
          
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
            font-size: 84px;
            font-weight: 700;
            margin: 0 0 40px 0;
            line-height: 1.2;
            color: ${textColor};
            text-shadow: 
              ${isModernGlassmorphismTemplate ? '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 255, 255, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)'};
            position: relative;
            z-index: 3;
          }
          
          p {
            font-family: 'Golos Text', 'Noto Color Emoji', sans-serif;
            font-size: 48px;
            line-height: 1.5;
            margin: 0;
            color: ${textColor};
            text-shadow: 
              ${isModernGlassmorphismTemplate ? '0 1px 4px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)'};
            position: relative;
            z-index: 3;
          }
          
          .subtitle {
            font-size: 36px;
            margin-top: 20px;
            color: ${textLight};
            text-shadow: 
              ${isModernGlassmorphismTemplate ? '0 1px 4px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)'};
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
    colorTemplate: ColorTemplate = ColorTemplate.MORNING,
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
