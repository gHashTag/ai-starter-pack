#!/usr/bin/env bun

/**
 * 🎨 Генератор превью-изображений для цветовых темплейтов
 * 
 * Создает мини-карточки для предпросмотра каждого шаблона в интерфейсе Telegram
 */

import {
  InstagramCanvasService,
} from '../src/services/instagram-canvas.service';
import { promises as fs } from 'fs';
import path from 'path';
import nodeHtmlToImage from 'node-html-to-image';

/**
 * VibeCoding цитаты для превью
 */
const VIBECODING_QUOTES = [
  'Код - это поэзия логики 🎭',
  'В каждой функции живет дух программиста 👻',
  'Чистый код - путь к просветлению ✨',
  'Рефакторинг - медитация разработчика 🧘‍♂️',
  'Баги - учителя терпения 🐛',
  'TypeScript - дисциплина ума 🎯',
  'React хуки - магия состояний 🪄',
  'Git коммиты - история души 📚',
  'API - мосты между мирами 🌉',
  'Алгоритмы - танец данных 💃'
];

/**
 * Выбрать цитату по индексу темплейта
 */
function getQuoteForTemplate(templateIndex: number): string {
  return VIBECODING_QUOTES[templateIndex % VIBECODING_QUOTES.length];
}

/**
 * Определить цвет текста на основе фона
 */
function getTextColor(background: string): string {
  // Темные фоны - светлый текст
  if (background.includes('#000') || background.includes('#1') || background.includes('#2') || 
      background.includes('rgba(') && background.includes(', 0') ||
      background.includes('0D2B1D') || background.includes('4A235A') || 
      background.includes('2C3E50') || background.includes('7E102C') ||
      background.includes('1A5276') || background.includes('804E27') ||
      background.includes('0A4D3A')) {
    return '#ffffff';
  }
  // Светлые фоны - темный текст
  return '#2c3e50';
}

/**
 * Генерирует HTML для превью-карточки шаблона
 */
function generatePreviewHtml(templateName: string, emoji: string, background: string, cardBackground: string, templateIndex: number): string {
  const quote = getQuoteForTemplate(templateIndex);
  const textColor = getTextColor(background);
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 400px;
          height: 300px;
          font-family: 'Inter', sans-serif;
          background: ${background};
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        
        .preview-card {
          width: 350px;
          height: 250px;
          background: ${cardBackground};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        
        .emoji {
          font-size: 60px;
          margin-bottom: 15px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }
        
        .template-name {
          font-size: 22px;
          font-weight: 700;
          color: ${textColor};
          text-align: center;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          margin-bottom: 8px;
        }
        
        .vibecoding-quote {
          font-size: 12px;
          color: ${textColor};
          opacity: 0.9;
          text-align: center;
          font-style: italic;
          margin-bottom: 8px;
          padding: 0 20px;
          line-height: 1.3;
        }
        
        .preview-label {
          font-size: 11px;
          color: ${textColor};
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        
        .decorative-dot {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
        }
        
        .decorative-dot::before {
          content: '';
          position: absolute;
          top: -15px;
          left: 0;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
        }
        
        .decorative-dot::after {
          content: '';
          position: absolute;
          top: 15px;
          left: 0;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }
      </style>
    </head>
    <body>
      <div class="preview-card">
        <div class="decorative-dot"></div>
        <div class="emoji">${emoji}</div>
        <div class="template-name">${templateName}</div>
        <div class="vibecoding-quote">${quote}</div>
        <div class="preview-label">Preview</div>
      </div>
    </body>
    </html>
  `;
}

async function generateTemplatePreviews() {
  console.log('🎨 Генерация превью-изображений для цветовых темплейтов...\n');

  // Создаем папку для превью
  const previewDir = path.join(process.cwd(), 'template-previews');
  await fs.mkdir(previewDir, { recursive: true });

  // Получаем все темплейты
  const templates = InstagramCanvasService.getColorTemplates();

  console.log('🖼️ Создаю превью для каждого темплейта:\n');

  const templateEntries = Object.entries(templates);
  for (let i = 0; i < templateEntries.length; i++) {
    const [templateKey, templateData] = templateEntries[i];
    console.log(`🎨 Создаю превью: ${templateData.emoji} ${templateData.name}...`);

    try {
      const html = generatePreviewHtml(
        templateData.name,
        templateData.emoji,
        templateData.background,
        templateData.cardBackground,
        i
      );

      const outputPath = path.join(previewDir, `${templateKey}-preview.png`);

      await nodeHtmlToImage({
        output: outputPath,
        html,
        puppeteerArgs: {
          defaultViewport: {
            width: 400,
            height: 300,
          },
        },
      });

      // Проверяем размер файла
      const stats = await fs.stat(outputPath);
      const sizeKB = Math.round(stats.size / 1024);

      console.log(`  ✅ ${templateData.name}: ${sizeKB} KB`);
    } catch (error) {
      console.log(`  ❌ Ошибка в ${templateData.name}:`, error);
    }
  }

  // Создаем индексный файл с информацией о превью
  const indexContent = `# 🎨 Превью цветовых темплейтов

Данная папка содержит превью-изображения для всех цветовых темплейтов Bible VibeCoder.

## 📋 Список файлов:

${Object.entries(templates)
  .map(([key, template]) => `- \`${key}-preview.png\` - ${template.emoji} ${template.name}`)
  .join('\n')}

## 🔧 Использование:

Эти изображения используются в Telegram-боте для предпросмотра цветовых темплейтов 
перед выбором стиля карусели.

_Сгенерировано автоматически скриптом generate-template-previews.ts_
`;

  await fs.writeFile(path.join(previewDir, 'README.md'), indexContent, 'utf-8');

  console.log('\n🎉 Генерация превью завершена!');
  console.log(`📁 Все файлы сохранены в: ${previewDir}`);
  console.log(`📊 Создано превью: ${Object.keys(templates).length} шаблонов`);
}

// Запускаем генерацию
generateTemplatePreviews().catch(console.error);
