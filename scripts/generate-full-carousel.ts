import { InstagramCanvasService } from '../src/services/instagram-canvas.service';
import { CarouselSlide } from '../src/types';
import fs from 'fs';
import path from 'path';

async function generateFullCarousel() {
  console.log('🎨 ГЕНЕРАЦИЯ ПОЛНОЙ КАРУСЕЛИ VIBECODING...');

  try {
    const canvasService = new InstagramCanvasService();

    // Создаем 5 слайдов с серьезным контентом по программированию (БЕЗ ЦВЕТОЧКОВ!)
    const slides: CarouselSlide[] = [
      {
        type: 'title',
        title: '🚀 VIBECODING',
        content:
          '🧘‍♂️ Медитативное программирование\n\n⚡ Осознанный подход к коду\n\n🎯 Профессиональная разработка',
        order: 1,
      },
      {
        type: 'principle',
        title: '⚡ Принципы разработки',
        content:
          'Медитативное программирование как методология\n\n🔹 Каждая строка кода - обдуманное решение\n🔹 Синхронизация мышления и рефакторинга\n🔹 Качество превыше скорости',
        order: 2,
      },
      {
        type: 'quote',
        title: '💎 Философия кода',
        content:
          '"Код - это язык мысли разработчика"\n\n🧠 Чистота мышления = чистота кода\n⚙️ Архитектура отражает понимание',
        order: 3,
      },
      {
        type: 'practice',
        title: '🛠️ Практические методы',
        content:
          '🔸 TDD как основа разработки\n🔸 Рефакторинг как постоянная практика\n🔸 Code Review как обучение\n\n🎯 Системный подход к качеству',
        order: 4,
      },
      {
        type: 'summary',
        title: '🎯 Результат',
        content:
          'Чистый код = понятная архитектура\n\n✅ Red → Green → Refactor\n🧘‍♂️ Осознанность в каждом коммите\n\n⚡ Начни применять сегодня!',
        order: 5,
      },
    ];

    console.log(`📝 Создано ${slides.length} слайдов для карусели`);

    // Генерируем все изображения
    console.log('🖼️ Генерирую все изображения карусели...');
    const imageBuffers = await canvasService.generateCarouselImages(slides);

    if (imageBuffers && imageBuffers.length > 0) {
      // Создаем папку для вывода
      const outputPath = path.join(process.cwd(), 'carousel-output');
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      // Сохраняем все изображения
      let totalSize = 0;
      for (let i = 0; i < imageBuffers.length; i++) {
        const imagePath = path.join(
          outputPath,
          `vibecoding-slide-${i + 1}.png`
        );
        fs.writeFileSync(imagePath, imageBuffers[i]);

        const stats = fs.statSync(imagePath);
        totalSize += stats.size;

        console.log(
          `✅ Слайд ${i + 1}: ${(stats.size / 1024).toFixed(2)} KB - ${
            slides[i].title
          }`
        );
      }

      console.log('\n🎉 КАРУСЕЛЬ ГОТОВА!');
      console.log(`📁 Папка: ${outputPath}`);
      console.log(`📊 Всего файлов: ${imageBuffers.length}`);
      console.log(`💾 Общий размер: ${(totalSize / 1024).toFixed(2)} KB`);
      console.log(`🎨 Разрешение каждого: 1080x1350`);
      console.log('\n🚀 ГОТОВО ДЛЯ INSTAGRAM! Загружай карусель!');

      // ТЕСТ: Отправляем карусель на твой реальный ID
      console.log('\n📱 ТЕСТИРУЮ ОТПРАВКУ НА ТВОЙ ID...');
      await testSendToRealUser(imageBuffers, slides);
    } else {
      console.error('❌ Изображения не созданы');
    }
  } catch (error) {
    console.error('❌ ОШИБКА при генерации карусели:');
    console.error(error);
  }
}

// Функция для тестирования отправки на реальный ID
async function testSendToRealUser(
  imageBuffers: Buffer[],
  slides: CarouselSlide[]
) {
  try {
    const { bot } = await import('../src/bot');

    const realUserId = 144022504; // Твой реальный ID

    // Создаем медиа группу для отправки
    const mediaGroup = imageBuffers.map((buffer, index) => ({
      type: 'photo' as const,
      media: { source: buffer },
      caption:
        index === 0
          ? `🚀 VIBECODING Карусель\n\n${slides
              .map(s => `${s.order}. ${s.title}`)
              .join('\n')}`
          : undefined,
      parse_mode: 'Markdown' as const,
    }));

    console.log(`📤 Отправляю карусель пользователю ${realUserId}...`);

    await bot.telegram.sendMediaGroup(realUserId, mediaGroup);

    console.log('✅ КАРУСЕЛЬ УСПЕШНО ОТПРАВЛЕНА НА ТВОЙ ID!');
  } catch (error) {
    console.error('❌ Ошибка отправки на реальный ID:', error);
    console.log('�� Fallback: Отправляю текстовое сообщение...');

    try {
      const { bot } = await import('../src/bot');
      const realUserId = 144022504;

      const textMessage = `🚀 **VIBECODING Карусель готова!**\n\n${slides
        .map(s => `**${s.order}. ${s.title}**\n${s.content}\n`)
        .join('\n---\n\n')}`;

      await bot.telegram.sendMessage(realUserId, textMessage, {
        parse_mode: 'Markdown',
      });
      console.log('✅ Текстовое сообщение отправлено!');
    } catch (fallbackError) {
      console.error('❌ Ошибка fallback отправки:', fallbackError);
    }
  }
}

// Запускаем генерацию
generateFullCarousel();
