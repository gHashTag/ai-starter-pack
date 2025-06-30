#!/usr/bin/env bun

/**
 * 🎨 Тест галереи выбора шаблонов
 * 
 * Этот скрипт эмулирует работу галереи без Telegram API,
 * показывая логику навигации и выбора шаблонов.
 */

import { InstagramCanvasService, ColorTemplate } from '../src/services/instagram-canvas.service';
import { logger, LogType } from '../src/utils/logger';

// 🎨 Эмуляция пользовательских действий
interface MockCarouselState {
  topicKey: string;
  topic: string;
  currentIndex: number;
  messageId: number;
}

class TemplateGalleryTester {
  private templates = InstagramCanvasService.getColorTemplates();
  private templateKeys = Object.keys(this.templates);
  private state: MockCarouselState;

  constructor() {
    this.state = {
      topicKey: 'topic_test_' + Date.now(),
      topic: 'инструменты редакторы кода для вайб-кодинга',
      currentIndex: 0,
      messageId: 12345
    };
  }

  // 🎨 Показать текущий шаблон
  showCurrentTemplate() {
    const currentTemplateKey = this.templateKeys[this.state.currentIndex];
    const selectedTemplate = this.templates[currentTemplateKey as ColorTemplate];
    
    console.log('\n🎨 =====================================');
    console.log('📋 ГАЛЕРЕЯ ШАБЛОНОВ ДЛЯ КАРУСЕЛИ');
    console.log('🎨 =====================================');
    console.log(`📝 Тема: "${this.state.topic}"`);
    console.log(`${selectedTemplate.emoji} Текущий шаблон: ${selectedTemplate.name}`);
    console.log(`🎯 Позиция: ${this.state.currentIndex + 1} из ${this.templateKeys.length}`);
    
    // Показываем URL превью
    const serverPort = process.env.HTTP_SERVER_PORT || '7103';
    const previewUrl = `http://localhost:${serverPort}/preview/${currentTemplateKey}-preview.png`;
    console.log(`🖼️  Превью: ${previewUrl}`);
    
    // Показываем цветовую схему
    console.log('\n🎨 Цветовая схема:');
    console.log(`   Фон: ${selectedTemplate.background}`);
    console.log(`   Текст: ${selectedTemplate.primaryText}`);
    console.log(`   Акцент: ${selectedTemplate.accent}`);
    
    console.log('\n💡 Доступные действия:');
    console.log('   ⬅️  [P] - Предыдущий шаблон');
    console.log('   ➡️  [N] - Следующий шаблон'); 
    console.log('   ✅ [S] - Выбрать этот шаблон');
    console.log('   ❌ [Q] - Выйти');
    console.log('=====================================\n');
  }

  // 🔄 Навигация: предыдущий шаблон
  goToPrevious() {
    this.state.currentIndex = 
      (this.state.currentIndex - 1 + this.templateKeys.length) % this.templateKeys.length;
    console.log('⬅️  Переход к предыдущему шаблону...');
    this.showCurrentTemplate();
  }

  // 🔄 Навигация: следующий шаблон
  goToNext() {
    this.state.currentIndex = 
      (this.state.currentIndex + 1) % this.templateKeys.length;
    console.log('➡️  Переход к следующему шаблону...');
    this.showCurrentTemplate();
  }

  // ✅ Выбор шаблона
  selectTemplate() {
    const currentTemplateKey = this.templateKeys[this.state.currentIndex];
    const selectedTemplate = this.templates[currentTemplateKey as ColorTemplate];
    
    console.log('\n✅ ========================================');
    console.log('🎨 ШАБЛОН ВЫБРАН!');
    console.log('✅ ========================================');
    console.log(`📝 Тема: "${this.state.topic}"`);
    console.log(`🎨 Выбранный стиль: ${selectedTemplate.emoji} ${selectedTemplate.name}`);
    console.log(`🔑 Ключ шаблона: ${currentTemplateKey}`);
    
    // Эмулируем отправку в Inngest
    const mockEvent = {
      name: 'app/carousel.generate.request',
      data: {
        topic: this.state.topic,
        telegramUserId: '144022504',
        messageId: this.state.messageId,
        colorTemplate: currentTemplateKey
      }
    };
    
    console.log('\n📨 Данные события для Inngest:');
    console.log(JSON.stringify(mockEvent, null, 2));
    
    console.log('\n🚀 Следующие шаги:');
    console.log('   1. Отправка события в Inngest');
    console.log('   2. Генерация контента через AI');
    console.log('   3. Создание изображений карусели');
    console.log('   4. Отправка результата пользователю');
    console.log('========================================\n');
    
    return true;
  }

  // 🎮 Интерактивный режим (для демонстрации)
  async runInteractiveDemo() {
    console.log('🕉️ Демонстрация галереи выбора шаблонов');
    console.log('==========================================');
    
    this.showCurrentTemplate();
    
    // Автоматическая демонстрация навигации
    console.log('🤖 Автоматическая демонстрация...\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.goToNext();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.goToNext();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.goToPrevious();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('🎯 Выбираем этот шаблон...\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.selectTemplate();
  }

  // 📊 Тест всех шаблонов
  testAllTemplates() {
    console.log('📊 ТЕСТИРОВАНИЕ ВСЕХ ДОСТУПНЫХ ШАБЛОНОВ');
    console.log('=========================================\n');
    
    this.templateKeys.forEach((key, index) => {
      const template = this.templates[key as ColorTemplate];
      const serverPort = process.env.HTTP_SERVER_PORT || '7103';
      const previewUrl = `http://localhost:${serverPort}/preview/${key}-preview.png`;
      
      console.log(`${index + 1}. ${template.emoji} ${template.name}`);
      console.log(`   Ключ: ${key}`);
      console.log(`   Фон: ${template.background}`);
      console.log(`   Текст: ${template.primaryText}`);
      console.log(`   Превью: ${previewUrl}`);
      console.log('');
    });
    
    console.log(`✅ Всего шаблонов: ${this.templateKeys.length}`);
    console.log('=========================================\n');
  }
}

// 🚀 Запуск тестов
async function main() {
  logger.configure({
    logToConsole: true,
    minLevel: 'info' as any
  });

  const tester = new TemplateGalleryTester();
  
  console.log('🕉️ Тестирование галереи шаблонов Bible VibeCoder\n');
  
  // 1. Показать все доступные шаблоны
  tester.testAllTemplates();
  
  // 2. Запустить интерактивную демонстрацию
  await tester.runInteractiveDemo();
  
  console.log('✅ Тестирование завершено!');
  console.log('\n💡 Для тестирования с реальным Telegram ботом:');
  console.log('   1. Запустите ngrok: ngrok http 7103');
  console.log('   2. Обновите URLs в коде на ngrok URL');
  console.log('   3. Запустите бота: bun dev');
  console.log('   4. Отправьте /carousel [тема] в Telegram');
}

if (require.main === module) {
  main().catch(console.error);
}

export { TemplateGalleryTester };
