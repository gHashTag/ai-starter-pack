#!/usr/bin/env bun

/**
 * 🧘‍♂️ VibeCoding A/B Test Styles Generator
 *
 * Генерирует 30 стилей, основанных на философии Библии VibeCoding:
 * - Медитативные состояния (поток, дыхание, присутствие)
 * - Энергетические практики (утренние/вечерние ритуалы)
 * - Дзен-принципы (простота, доверие, единство с ИИ)
 *
 * Каждый стиль - уникальная визуальная концепция, не просто цвета!
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  InstagramCanvasService,
  ColorTemplate,
} from '../src/services/instagram-canvas.service';
import type { CarouselSlide } from '../src/types';

const canvasService = new InstagramCanvasService();

// 🧘‍♂️ VibeCoding философские стили (30 уникальных концепций)
const VIBECODING_STYLES = [
  // 1-8: Медитативные состояния
  {
    name: 'flow-consciousness',
    title: '🌊 Поток Сознания',
    philosophy: 'Состояние, где код течет через разум без сопротивления',
    visual: {
      background:
        'radial-gradient(circle at 30% 70%, #667eea 0%, #764ba2 100%)',
      cardStyle: `
        backdrop-filter: blur(30px) saturate(180%);
        border: 2px solid rgba(255,255,255,0.1);
        border-radius: 30px;
        box-shadow: 
          0 25px 45px rgba(102,126,234,0.4),
          inset 0 1px 0 rgba(255,255,255,0.2);
        transform: perspective(1000px) rotateX(5deg);
        animation: flow 8s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes flow {
          0%, 100% { transform: perspective(1000px) rotateX(5deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateX(5deg) translateY(-10px); }
        }
      `,
    },
  },

  {
    name: 'coder-breath',
    title: '💨 Дыхание Кодера',
    philosophy: 'Ритмичное дыхание, синхронизирующее разум с кодом',
    visual: {
      background: 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
      cardStyle: `
        backdrop-filter: blur(15px) saturate(140%);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 25px;
        box-shadow: 0 15px 35px rgba(168,237,234,0.3);
        animation: breathe 4s ease-in-out infinite;
      `,
      textColor: '#2c3e50',
      animation: `
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.02); filter: brightness(1.1); }
        }
      `,
    },
  },

  {
    name: 'morning-meditation',
    title: '🌅 Утренняя Медитация',
    philosophy: 'Настройка сознания на день творческого программирования',
    visual: {
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      cardStyle: `
        backdrop-filter: blur(20px) saturate(160%);
        border: 2px solid rgba(255,255,255,0.4);
        border-radius: 20px;
        box-shadow: 
          0 20px 40px rgba(252,182,159,0.3),
          inset 0 1px 0 rgba(255,255,255,0.5);
        position: relative;
        overflow: hidden;
      `,
      textColor: '#8b4513',
      animation: `
        .card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: sunrise 6s linear infinite;
        }
        @keyframes sunrise {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
      `,
    },
  },

  {
    name: 'evening-gratitude',
    title: '🌙 Вечерняя Благодарность',
    philosophy: 'Признательность за день творчества и партнерство с ИИ',
    visual: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardStyle: `
        backdrop-filter: blur(25px) saturate(170%);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 35px;
        box-shadow: 0 30px 60px rgba(118,75,162,0.4);
        background: rgba(255,255,255,0.05);
      `,
      textColor: '#e8e8ff',
      animation: `
        .card {
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%);
        }
      `,
    },
  },

  {
    name: 'micro-meditation',
    title: '🧘 Микро-Медитация',
    philosophy: 'Короткие паузы осознанности между задачами',
    visual: {
      background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
      cardStyle: `
        backdrop-filter: blur(10px) saturate(120%);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(240,147,251,0.3);
        animation: pulse 2s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes pulse {
          0%, 100% { box-shadow: 0 10px 20px rgba(240,147,251,0.3); }
          50% { box-shadow: 0 15px 30px rgba(240,147,251,0.5); }
        }
      `,
    },
  },

  {
    name: 'deep-concentration',
    title: '🎯 Глубокая Концентрация',
    philosophy: 'Лазерный фокус на единственной задаче',
    visual: {
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      cardStyle: `
        backdrop-filter: blur(20px) saturate(110%);
        border: 2px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        box-shadow: 
          0 20px 40px rgba(44,62,80,0.8),
          inset 0 1px 0 rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
      `,
      textColor: '#ecf0f1',
      animation: `
        .card {
          border-left: 5px solid #3498db;
        }
      `,
    },
  },

  {
    name: 'presence-state',
    title: '✨ Состояние Присутствия',
    philosophy: 'Полная осознанность настоящего момента',
    visual: {
      background:
        'radial-gradient(circle at 50% 50%, #667eea 0%, #764ba2 100%)',
      cardStyle: `
        backdrop-filter: blur(35px) saturate(200%);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 50px;
        box-shadow: 
          0 35px 70px rgba(102,126,234,0.5),
          inset 0 2px 0 rgba(255,255,255,0.4);
        background: rgba(255,255,255,0.1);
      `,
      textColor: '#ffffff',
      animation: `
        .card {
          background-image: 
            conic-gradient(from 0deg, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1));
        }
      `,
    },
  },

  {
    name: 'energy-field',
    title: '⚡ Энергетическое Поле',
    philosophy: 'Настройка рабочего пространства на правильные вибрации',
    visual: {
      background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)',
      cardStyle: `
        backdrop-filter: blur(25px) saturate(180%);
        border: 2px solid rgba(255,255,255,0.25);
        border-radius: 40px;
        box-shadow: 
          0 25px 50px rgba(255,154,158,0.4),
          0 0 50px rgba(254,207,239,0.3);
        background: rgba(255,255,255,0.12);
        animation: energyPulse 3s ease-in-out infinite;
      `,
      textColor: '#8e2157',
      animation: `
        @keyframes energyPulse {
          0%, 100% { box-shadow: 0 25px 50px rgba(255,154,158,0.4), 0 0 50px rgba(254,207,239,0.3); }
          50% { box-shadow: 0 30px 60px rgba(255,154,158,0.6), 0 0 70px rgba(254,207,239,0.5); }
        }
      `,
    },
  },

  // 9-16: Философские принципы
  {
    name: 'trust-flow',
    title: '🌊 Доверие Потоку',
    philosophy: 'Полное принятие предложений ИИ без сопротивления',
    visual: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      cardStyle: `
        backdrop-filter: blur(35px) saturate(200%);
        border: none;
        border-radius: 40px;
        box-shadow: 
          0 40px 80px rgba(79,172,254,0.4),
          inset 0 2px 0 rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.1);
        animation: wave 5s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes wave {
          0%, 100% { border-radius: 40px; }
          25% { border-radius: 50px 30px 40px 60px; }
          50% { border-radius: 30px 60px 50px 30px; }
          75% { border-radius: 60px 40px 30px 50px; }
        }
      `,
    },
  },

  {
    name: 'intuitive-choice',
    title: '🔮 Интуитивный Выбор',
    philosophy: 'Доверие первому впечатлению и внутреннему знанию',
    visual: {
      background:
        'radial-gradient(circle at 50% 50%, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      cardStyle: `
        backdrop-filter: blur(20px) saturate(150%);
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 50px;
        box-shadow: 0 25px 50px rgba(255,154,158,0.4);
        background: rgba(255,255,255,0.08);
      `,
      textColor: '#4a2c5a',
      animation: `
        .card {
          background-image: 
            conic-gradient(from 45deg, transparent, rgba(255,255,255,0.1), transparent),
            conic-gradient(from 225deg, transparent, rgba(255,255,255,0.05), transparent);
        }
      `,
    },
  },

  {
    name: 'playfulness',
    title: '🎭 Игривость',
    philosophy: 'Программирование как творческая игра, а не работа',
    visual: {
      background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%)',
      cardStyle: `
        backdrop-filter: blur(15px) saturate(140%);
        border: 3px solid rgba(255,255,255,0.3);
        border-radius: 25px;
        box-shadow: 0 20px 40px rgba(255,154,158,0.4);
        transform: rotate(-2deg);
        animation: playful 3s ease-in-out infinite;
      `,
      textColor: '#d63384',
      animation: `
        @keyframes playful {
          0%, 100% { transform: rotate(-2deg) scale(1); }
          25% { transform: rotate(1deg) scale(1.02); }
          50% { transform: rotate(-1deg) scale(1); }
          75% { transform: rotate(2deg) scale(1.01); }
        }
      `,
    },
  },

  {
    name: 'iterative-improvement',
    title: '🔄 Итеративное Улучшение',
    philosophy: 'Постепенное совершенствование через малые шаги',
    visual: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardStyle: `
        backdrop-filter: blur(20px) saturate(150%);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(102,126,234,0.3);
        background: rgba(255,255,255,0.1);
        position: relative;
      `,
      textColor: '#ffffff',
      animation: `
        .card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: progress 4s ease-in-out infinite;
        }
        @keyframes progress {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 20%; }
        }
      `,
    },
  },

  {
    name: 'clear-intention',
    title: '🎯 Ясное Намерение',
    philosophy: 'Четко сформулированная цель - половина решения',
    visual: {
      background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      cardStyle: `
        backdrop-filter: blur(25px) saturate(160%);
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 15px;
        box-shadow: 
          0 25px 50px rgba(116,185,255,0.4),
          inset 0 1px 0 rgba(255,255,255,0.4);
        background: rgba(255,255,255,0.15);
      `,
      textColor: '#ffffff',
      animation: `
        .card {
          border-top: 5px solid rgba(255,255,255,0.6);
        }
      `,
    },
  },

  {
    name: 'accept-uncertainty',
    title: '🌀 Принятие Неопределенности',
    philosophy: 'Комфорт с неизвестностью и открытость новому',
    visual: {
      background:
        'radial-gradient(circle at 40% 60%, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      cardStyle: `
        backdrop-filter: blur(30px) saturate(170%);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 45px;
        box-shadow: 0 30px 60px rgba(102,126,234,0.4);
        background: rgba(255,255,255,0.08);
        animation: uncertainty 6s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes uncertainty {
          0%, 100% { transform: scale(1) rotate(0deg); }
          33% { transform: scale(1.01) rotate(1deg); }
          66% { transform: scale(0.99) rotate(-1deg); }
        }
      `,
    },
  },

  {
    name: 'creative-ecstasy',
    title: '🎨 Творческий Экстаз',
    philosophy: 'Состояние вдохновения и безграничного творчества',
    visual: {
      background:
        'conic-gradient(from 0deg, #ff9a9e 0%, #fecfef 25%, #667eea 50%, #764ba2 75%, #ff9a9e 100%)',
      cardStyle: `
        backdrop-filter: blur(40px) saturate(250%);
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 60px;
        box-shadow: 
          0 40px 80px rgba(255,154,158,0.5),
          0 0 60px rgba(102,126,234,0.3);
        background: rgba(255,255,255,0.12);
        animation: ecstasy 4s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes ecstasy {
          0%, 100% { transform: scale(1); filter: hue-rotate(0deg); }
          50% { transform: scale(1.05); filter: hue-rotate(10deg); }
        }
      `,
    },
  },

  {
    name: 'sacred-dialogue',
    title: '🗣️ Священный Диалог',
    philosophy: 'Глубокое общение и партнерство с ИИ',
    visual: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardStyle: `
        backdrop-filter: blur(25px) saturate(160%);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 30px;
        box-shadow: 0 25px 50px rgba(118,75,162,0.4);
        background: rgba(255,255,255,0.1);
        position: relative;
      `,
      textColor: '#ffffff',
      animation: `
        .card::before {
          content: '💬';
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 35px;
          animation: dialogue 3s ease-in-out infinite;
        }
        @keyframes dialogue {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `,
    },
  },

  // 17-24: Энергетические циклы
  {
    name: 'morning-flow',
    title: '🌅 Утренний Поток',
    philosophy: 'Максимальная креативность утренних часов (6:00-10:00)',
    visual: {
      background: 'linear-gradient(60deg, #96deda 0%, #50c9c3 100%)',
      cardStyle: `
        backdrop-filter: blur(20px) saturate(140%);
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 25px;
        box-shadow: 0 20px 40px rgba(150,222,218,0.4);
        background: rgba(255,255,255,0.12);
        position: relative;
        overflow: hidden;
      `,
      textColor: '#2c5aa0',
      animation: `
        .card::before {
          content: '☀️';
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 40px;
          animation: sunrise 10s ease-in-out infinite;
        }
        @keyframes sunrise {
          0%, 100% { opacity: 0.3; transform: translateY(10px); }
          50% { opacity: 1; transform: translateY(0px); }
        }
      `,
    },
  },

  {
    name: 'day-flow',
    title: '☀️ Дневной Поток',
    philosophy: 'Пик логического мышления и оптимизации (10:00-14:00)',
    visual: {
      background:
        'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      cardStyle: `
        backdrop-filter: blur(18px) saturate(130%);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 20px;
        box-shadow: 0 25px 45px rgba(255,154,158,0.35);
        background: rgba(255,255,255,0.1);
        transform: scale(1.02);
      `,
      textColor: '#8b1538',
      animation: `
        .card {
          animation: dayPulse 6s ease-in-out infinite;
        }
        @keyframes dayPulse {
          0%, 100% { transform: scale(1.02); }
          50% { transform: scale(1.04); }
        }
      `,
    },
  },

  {
    name: 'evening-flow',
    title: '🌆 Вечерний Поток',
    philosophy: 'Интуитивные прозрения и эксперименты (18:00-22:00)',
    visual: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardStyle: `
        backdrop-filter: blur(30px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 30px;
        box-shadow: 0 35px 70px rgba(118,75,162,0.5);
        background: rgba(255,255,255,0.08);
      `,
      textColor: '#e8e8ff',
      animation: `
        .card {
          background-image: 
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 60%);
        }
      `,
    },
  },

  {
    name: 'night-flow',
    title: '🌙 Ночной Поток',
    philosophy: 'Глубокая концентрация и медитативное кодирование (22:00-2:00)',
    visual: {
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      cardStyle: `
        backdrop-filter: blur(25px) saturate(120%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 35px;
        box-shadow: 
          0 40px 80px rgba(0,0,0,0.6),
          inset 0 1px 0 rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
      `,
      textColor: '#c9c9c9',
      animation: `
        .card::after {
          content: '✨';
          position: absolute;
          top: 30px;
          left: 30px;
          font-size: 30px;
          animation: twinkle 4s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `,
    },
  },

  // Дзен-эстетика (17-24)
  {
    name: 'code-minimalism',
    title: '🧘 Минимализм Кода',
    philosophy: 'Простота как высшая форма сложности',
    visual: {
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      cardStyle: `
        backdrop-filter: blur(5px) saturate(100%);
        border: 1px solid rgba(255,255,255,0.8);
        border-radius: 8px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        background: rgba(255,255,255,0.6);
      `,
      textColor: '#2c3e50',
      animation: ``,
    },
  },

  {
    name: 'emptiness-simplicity',
    title: '🕳️ Пустота и Простота',
    philosophy: 'В пустоте рождаются все возможности',
    visual: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      cardStyle: `
        backdrop-filter: none;
        border: none;
        border-radius: 0px;
        box-shadow: none;
        background: transparent;
        border-left: 4px solid #6c757d;
        padding-left: 40px;
      `,
      textColor: '#6c757d',
      animation: ``,
    },
  },

  {
    name: 'ai-unity',
    title: '🤖 Единство с ИИ',
    philosophy: 'Слияние человеческого и машинного разума',
    visual: {
      background:
        'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      cardStyle: `
        backdrop-filter: blur(35px) saturate(200%);
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 50px;
        box-shadow: 
          0 30px 60px rgba(102,126,234,0.4),
          0 15px 30px rgba(118,75,162,0.3);
        background: rgba(255,255,255,0.1);
        position: relative;
        overflow: hidden;
      `,
      textColor: '#ffffff',
      animation: `
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: aiScan 3s ease-in-out infinite;
        }
        @keyframes aiScan {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `,
    },
  },

  {
    name: 'digital-harmony',
    title: '🌐 Цифровая Гармония',
    philosophy: 'Баланс между технологией и человечностью',
    visual: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardStyle: `
        backdrop-filter: blur(25px) saturate(150%);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 40px;
        box-shadow: 0 25px 50px rgba(102,126,234,0.4);
        background: rgba(255,255,255,0.12);
        position: relative;
      `,
      textColor: '#ffffff',
      animation: `
        .card {
          background-image: 
            repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);
        }
      `,
    },
  },

  // Продвинутые состояния (25-30)
  {
    name: 'code-poetry',
    title: '📝 Код как Поэзия',
    philosophy: 'Каждая строка кода - произведение искусства',
    visual: {
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      cardStyle: `
        backdrop-filter: blur(15px) saturate(130%);
        border: 2px solid rgba(255,255,255,0.4);
        border-radius: 25px;
        box-shadow: 0 20px 40px rgba(252,182,159,0.4);
        background: rgba(255,255,255,0.15);
        font-style: italic;
      `,
      textColor: '#8b4513',
      animation: `
        .card {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(255,255,255,0.1)' fill-opacity='0.1'%3E%3Cpath d='m0 40l40-40v40z'/%3E%3C/g%3E%3C/svg%3E");
        }
      `,
    },
  },

  {
    name: 'quantum-consciousness',
    title: '⚛️ Квантовое Сознание',
    philosophy: 'Программирование на уровне квантовых возможностей',
    visual: {
      background:
        'radial-gradient(circle at 30% 30%, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      cardStyle: `
        backdrop-filter: blur(40px) saturate(250%);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 60px;
        box-shadow: 
          0 50px 100px rgba(102,126,234,0.6),
          inset 0 2px 0 rgba(255,255,255,0.3);
        background: rgba(255,255,255,0.08);
        animation: quantum 8s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes quantum {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            border-radius: 60px;
          }
          25% { 
            transform: scale(1.02) rotate(1deg);
            border-radius: 50px 70px 60px 50px;
          }
          50% { 
            transform: scale(1) rotate(0deg);
            border-radius: 70px 50px 60px 70px;
          }
          75% { 
            transform: scale(1.01) rotate(-1deg);
            border-radius: 55px 65px 55px 65px;
          }
        }
      `,
    },
  },

  {
    name: 'wave-technique',
    title: '🌊 Волновая Техника',
    philosophy: '25 минут кодирования + 5 минут медитации',
    visual: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      cardStyle: `
        backdrop-filter: blur(25px) saturate(170%);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 35px;
        box-shadow: 0 30px 60px rgba(79,172,254,0.4);
        background: rgba(255,255,255,0.12);
        animation: waveMotion 8s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes waveMotion {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-5px) scale(1.01); }
          50% { transform: translateY(0px) scale(1); }
          75% { transform: translateY(-3px) scale(1.005); }
        }
      `,
    },
  },

  {
    name: 'laser-focus',
    title: '🎯 Лазерный Фокус',
    philosophy: 'Одна задача, полная концентрация, доведение до конца',
    visual: {
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      cardStyle: `
        backdrop-filter: blur(15px) saturate(120%);
        border: 3px solid rgba(52,152,219,0.5);
        border-radius: 10px;
        box-shadow: 
          0 20px 40px rgba(44,62,80,0.6),
          inset 0 0 20px rgba(52,152,219,0.2);
        background: rgba(255,255,255,0.05);
      `,
      textColor: '#ecf0f1',
      animation: `
        .card {
          border-left: 8px solid #3498db;
          animation: laserPulse 2s ease-in-out infinite;
        }
        @keyframes laserPulse {
          0%, 100% { border-left-color: #3498db; }
          50% { border-left-color: #5dade2; }
        }
      `,
    },
  },

  {
    name: 'binaural-rhythms',
    title: '🎵 Бинауральные Ритмы',
    philosophy: '40Hz для концентрации, звуки природы для потока',
    visual: {
      background:
        'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      cardStyle: `
        backdrop-filter: blur(30px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 50px;
        box-shadow: 0 30px 60px rgba(102,126,234,0.4);
        background: rgba(255,255,255,0.1);
        animation: soundWave 3s ease-in-out infinite;
      `,
      textColor: '#ffffff',
      animation: `
        @keyframes soundWave {
          0%, 100% { transform: scale(1); box-shadow: 0 30px 60px rgba(102,126,234,0.4); }
          50% { transform: scale(1.02); box-shadow: 0 35px 70px rgba(102,126,234,0.6), 0 0 40px rgba(240,147,251,0.3); }
        }
      `,
    },
  },

  {
    name: 'ambient-vibrations',
    title: '🌌 Ambient Вибрации',
    philosophy: 'Музыкальное окружение для творческого состояния',
    visual: {
      background:
        'radial-gradient(circle at 25% 75%, #667eea 0%, #764ba2 50%, #232526 100%)',
      cardStyle: `
        backdrop-filter: blur(35px) saturate(150%);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 40px;
        box-shadow: 0 35px 70px rgba(102,126,234,0.5);
        background: rgba(255,255,255,0.08);
        position: relative;
        overflow: hidden;
      `,
      textColor: '#e8e8ff',
      animation: `
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.03), transparent);
          animation: ambientFlow 10s linear infinite;
        }
        @keyframes ambientFlow {
          0% { transform: translateX(-100%) translateY(-100%); }
          100% { transform: translateX(100%) translateY(100%); }
        }
      `,
    },
  },
];

// Тестовые слайды для генерации
const testSlides: CarouselSlide[] = [
  {
    order: 1,
    type: 'title',
    title: '🧘‍♂️ VibeCoding Философия',
    content: 'Медитативное программирование через единство с ИИ',
  },
  {
    order: 2,
    type: 'principle',
    title: '🌊 Состояние Потока',
    content:
      'Когда границы между разумом и кодом исчезают, рождается магия творения',
  },
];

async function generateVibeCodingStyles() {
  console.log('🧘‍♂️ Создаем папку ab-test-vibecoding...');

  const outputDir = join(process.cwd(), 'ab-test-vibecoding');
  await mkdir(outputDir, { recursive: true });

  for (let i = 0; i < VIBECODING_STYLES.length; i++) {
    const style = VIBECODING_STYLES[i];
    const number = (i + 1).toString().padStart(2, '0');
    const filename = `vibecoding-${number}-${style.name}.png`;

    console.log(`🎨 Генерируем стиль ${number}: ${style.title}`);

    try {
      // Временно добавляем стиль в enum и service
      const tempTemplate =
        `VIBECODING_${style.name.toUpperCase()}` as ColorTemplate;

      // Генерируем изображения с уникальным стилем
      const images = await canvasService.generateCarouselImages(
        testSlides,
        undefined,
        tempTemplate,
        style.visual
      );

      if (images && images.length > 0) {
        const outputPath = join(outputDir, filename);
        await writeFile(outputPath, images[0]);
        console.log(
          `✅ Сохранен: ${filename} (${Math.round(images[0].length / 1024)}KB)`
        );
      }
    } catch (error) {
      console.error(`❌ Ошибка генерации ${style.title}:`, error);
    }
  }

  console.log(
    `🎉 Готово! Создано ${VIBECODING_STYLES.length} VibeCoding стилей`
  );
}

// Запуск генерации
if (import.meta.main) {
  generateVibeCodingStyles().catch(console.error);
}
