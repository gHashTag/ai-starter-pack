import { promises as fs } from 'fs';
import path from 'path';
import { VibeCodingContent, CarouselSlide, Llm } from '../types';
import { logger, LogType } from '../utils/logger';

/**
 * Сервис для работы с VIBECODING документацией
 */
export class VibeCodingContentService {
  private readonly docsPath: string;
  private contentCache: Map<string, VibeCodingContent[]> = new Map();

  constructor(docsPath: string = path.join(process.cwd(), 'vibecoding')) {
    this.docsPath = docsPath;
  }

  /**
   * Поиск контента по теме
   */
  async searchByTopic(topic: string): Promise<VibeCodingContent[]> {
    const cacheKey = topic.toLowerCase();

    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey)!;
    }

    try {
      const allContent = await this.loadAllContent();
      const relevantContent = this.filterByTopic(allContent, topic);

      this.contentCache.set(cacheKey, relevantContent);
      return relevantContent;
    } catch (error) {
      logger.error('Ошибка поиска контента по теме', {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.BUSINESS_LOGIC,
        data: { topic },
      });
      return [];
    }
  }

  /**
   * Загрузка всего контента из документации
   */
  private async loadAllContent(): Promise<VibeCodingContent[]> {
    const content: VibeCodingContent[] = [];

    try {
      const categories = await this.getCategories();

      for (const category of categories) {
        const categoryPath = path.join(this.docsPath, category);
        const files = await this.getMarkdownFiles(categoryPath);

        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          const fileContent = await this.parseMarkdownFile(filePath, category);
          if (fileContent) {
            content.push(fileContent);
          }
        }
      }

      // Также загружаем файлы из корня
      const rootFiles = await this.getMarkdownFiles(this.docsPath);
      for (const file of rootFiles) {
        const filePath = path.join(this.docsPath, file);
        const fileContent = await this.parseMarkdownFile(filePath, 'root');
        if (fileContent) {
          content.push(fileContent);
        }
      }
    } catch (error) {
      logger.error('Ошибка загрузки контента', {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.SYSTEM,
      });
    }

    return content;
  }

  /**
   * Получение списка категорий (папок)
   */
  private async getCategories(): Promise<string[]> {
    try {
      const items = await fs.readdir(this.docsPath, { withFileTypes: true });
      return items
        .filter(item => item.isDirectory() && !item.name.startsWith('.'))
        .map(item => item.name);
    } catch (error) {
      logger.error('Ошибка чтения категорий', {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.SYSTEM,
      });
      return [];
    }
  }

  /**
   * Получение списка Markdown файлов в папке
   */
  private async getMarkdownFiles(dirPath: string): Promise<string[]> {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      return items
        .filter(item => item.isFile() && item.name.endsWith('.md'))
        .map(item => item.name);
    } catch (error) {
      // Папка может не существовать или быть недоступной
      return [];
    }
  }

  /**
   * Парсинг Markdown файла
   */
  private async parseMarkdownFile(
    filePath: string,
    category: string
  ): Promise<VibeCodingContent | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath, '.md');

      return {
        title: this.extractTitle(content, fileName),
        content: this.cleanContent(content),
        filePath,
        category: this.normalizeCategoryName(category),
        concepts: this.extractConcepts(content),
        quotes: this.extractQuotes(content),
      };
    } catch (error) {
      logger.error('Ошибка парсинга файла', {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.SYSTEM,
        data: { filePath },
      });
      return null;
    }
  }

  /**
   * Извлечение заголовка из контента
   */
  private extractTitle(content: string, fallbackTitle: string): string {
    // Ищем первый заголовок H1
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Ищем заголовок в имени файла (убираем эмодзи и лишние символы)
    return fallbackTitle
      .replace(/[📚🕉️🔥🎯🧘🌱⚡🗺️🚀📊🌟📖📑🎬💥]/g, '')
      .replace(/[-_]/g, ' ')
      .trim();
  }

  /**
   * Очистка контента от лишних символов
   */
  private cleanContent(content: string): string {
    return content
      .replace(/^#+\s+/gm, '') // Убираем маркеры заголовков
      .replace(/\*\*(.*?)\*\*/g, '$1') // Убираем жирный текст
      .replace(/\*(.*?)\*/g, '$1') // Убираем курсив
      .replace(/`(.*?)`/g, '$1') // Убираем инлайн код
      .replace(/```[\s\S]*?```/g, '') // Убираем блоки кода
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Убираем ссылки, оставляем текст
      .replace(/\n{3,}/g, '\n\n') // Убираем лишние переносы
      .trim();
  }

  /**
   * Извлечение ключевых концепций
   */
  private extractConcepts(content: string): string[] {
    const concepts: string[] = [];

    // Ищем выделенные концепции (жирный текст)
    const boldMatches = content.match(/\*\*(.*?)\*\*/g);
    if (boldMatches) {
      concepts.push(
        ...boldMatches.map(match => match.replace(/\*\*/g, '').trim())
      );
    }

    // Ищем заголовки как концепции
    const headingMatches = content.match(/^#+\s+(.+)$/gm);
    if (headingMatches) {
      concepts.push(
        ...headingMatches.map(match => match.replace(/^#+\s+/, '').trim())
      );
    }

    return [...new Set(concepts)].filter(
      concept => concept.length > 3 && concept.length < 100
    );
  }

  /**
   * Извлечение цитат и принципов
   */
  private extractQuotes(content: string): string[] {
    const quotes: string[] = [];

    // Ищем цитаты в кавычках
    const quoteMatches = content.match(/"([^"]+)"/g);
    if (quoteMatches) {
      quotes.push(...quoteMatches.map(quote => quote.replace(/"/g, '').trim()));
    }

    // Ищем блоки цитат (начинающиеся с >)
    const blockQuotes = content.match(/^>\s+(.+)$/gm);
    if (blockQuotes) {
      quotes.push(
        ...blockQuotes.map(quote => quote.replace(/^>\s+/, '').trim())
      );
    }

    // Ищем принципы и правила
    const principleMatches = content.match(/^[*-]\s+(.+)$/gm);
    if (principleMatches) {
      quotes.push(
        ...principleMatches
          .map(principle => principle.replace(/^[*-]\s+/, '').trim())
          .filter(principle => principle.length > 20)
      );
    }

    return [...new Set(quotes)].filter(
      quote => quote.length > 10 && quote.length < 300
    );
  }

  /**
   * Фильтрация контента по теме
   */
  private filterByTopic(
    content: VibeCodingContent[],
    topic: string
  ): VibeCodingContent[] {
    const topicLower = topic.toLowerCase();
    const keywords = topicLower.split(/\s+/);

    return content
      .map(item => ({
        ...item,
        relevanceScore: this.calculateRelevance(item, keywords),
      }))
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10) // Берем топ-10 наиболее релевантных
      .map(({ relevanceScore, ...item }) => item);
  }

  /**
   * Расчет релевантности контента
   */
  private calculateRelevance(
    content: VibeCodingContent,
    keywords: string[]
  ): number {
    let score = 0;
    const searchText = `${content.title} ${
      content.content
    } ${content.concepts.join(' ')} ${content.quotes.join(' ')}`.toLowerCase();

    for (const keyword of keywords) {
      // Точное совпадение в заголовке
      if (content.title.toLowerCase().includes(keyword)) {
        score += 10;
      }

      // Совпадение в концепциях
      if (
        content.concepts.some(concept =>
          concept.toLowerCase().includes(keyword)
        )
      ) {
        score += 5;
      }

      // Совпадение в тексте
      const matches = (searchText.match(new RegExp(keyword, 'g')) || []).length;
      score += matches * 2;
    }

    return score;
  }

  /**
   * Нормализация названия категории
   */
  private normalizeCategoryName(category: string): string {
    const categoryMap: Record<string, string> = {
      '01-ОСНОВЫ': 'основы',
      '02-ПРАКТИКИ': 'практики',
      '03-ИНСТРУМЕНТЫ': 'инструменты',
      '04-РАЗВИТИЕ': 'развитие',
      '05-АНАЛИТИКА': 'аналитика',
      '06-АРХИВ': 'архив',
      '07 TELEGRAM ПОСТЫ': 'telegram',
      root: 'основное',
    };

    return categoryMap[category] || category.toLowerCase();
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    this.contentCache.clear();
  }

  /**
   * 🔥 Генерирует МАКСИМАЛЬНО ПОЛЕЗНЫЙ текст для Instagram поста
   * с веб-поиском актуальной информации, до 2200 символов
   */
  public async generateInstagramPost(
    topic: string,
    slides: CarouselSlide[]
  ): Promise<string> {
    const hook = this.generateHook(topic);
    const expandedContent = this.generateExpandedContent(slides);
    const webResearchContent = await this.generateWebResearchContent(topic);
    const practicalTips = this.generatePracticalTips(topic, slides);
    const realWorldExamples = this.generateRealWorldExamples(topic);
    const hashtags = this.generateHashtags(topic);
    const callToAction = this.generateCallToAction();

    // Собираем полный пост с максимальной пользой
    const fullPost = `${hook}

${expandedContent}

${webResearchContent}

${practicalTips}

${realWorldExamples}

${callToAction}

─────────────────

${hashtags}

#vibecoding #кодинг #программирование #разработка #технологии #IT #productivity #mindset #саморазвитие #мотивация`;

    // Обрезаем до 2200 символов если нужно (лимит Instagram)
    return fullPost.length > 2200
      ? this.truncateToLimit(fullPost, 2200)
      : fullPost;
  }

  /**
   * 📜 Генерирует детальное описание и анализ слайдов
   */
  private generateExpandedContent(slides: CarouselSlide[]): string {
    return (
      slides
        .map(slide => `🔹 **${slide.title}**\n${slide.content}`)
        .join('\n\n') +
      '\n\nПодробнее про каждый слайд. Цель: дать максимальную ясность и подсказки.'
    );
  }

  /**
   * 🎯 Генерирует цепляющий хук для поста
   */
  private generateHook(topic: string): string {
    const hooks = [
      `🔥 ${topic.toUpperCase()} — это не просто навык, это философия`,
      `💎 Секреты ${topic}, которые изменят твой подход к коду`,
      `⚡ ${topic}: от новичка до мастера за 10 слайдов`,
      `🚀 Революционный взгляд на ${topic}`,
      `✨ ${topic} — твой путь к программистскому просветлению`,
      `🎯 Всё, что нужно знать о ${topic} в одной карусели`,
      `💡 ${topic}: мудрость, которая меняет код`,
    ];

    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  /**
   * 📝 Генерирует краткое содержание карусели
   */
  private generateSummary(slides: CarouselSlide[]): string {
    const keyPoints = slides
      .slice(1, 4) // Берем 2-4 слайды как ключевые моменты
      .map((slide, index) => `${index + 1}️⃣ ${slide.title}`)
      .join('\n');

    return `В этой карусели:

${keyPoints}

И многое другое! 👆 Листай карусель полностью`;
  }

  /**
   * 🏷️ Генерирует релевантные хештеги
   */
  private generateHashtags(topic: string): string {
    const topicWords = topic.toLowerCase().split(' ');
    const relevantHashtags: string[] = [];

    // Добавляем хештеги на основе ключевых слов темы
    topicWords.forEach(word => {
      if (word.includes('ai') || word.includes('ии')) {
        relevantHashtags.push(
          '#AI',
          '#искусственныйинтеллект',
          '#machinelearning'
        );
      }
      if (word.includes('react') || word.includes('реакт')) {
        relevantHashtags.push('#React', '#frontend', '#javascript');
      }
      if (word.includes('python') || word.includes('питон')) {
        relevantHashtags.push('#Python', '#backend', '#datascience');
      }
      if (word.includes('дизайн') || word.includes('design')) {
        relevantHashtags.push('#design', '#UX', '#UI');
      }
      if (word.includes('тест') || word.includes('test')) {
        relevantHashtags.push('#testing', '#QA', '#automation');
      }
    });

    // Базовые хештеги
    const baseHashtags = [
      '#программирование',
      '#coding',
      '#developer',
      '#webdev',
      '#softwaredev',
      '#tech',
      '#education',
      '#learning',
      '#карьера',
      '#рост',
    ];

    return [...new Set([...relevantHashtags, ...baseHashtags])]
      .slice(0, 15) // Ограничиваем до 15 хештегов
      .join(' ');
  }

  /**
   * 📢 Генерирует призыв к действию
   */
  private generateCallToAction(): string {
    const ctas = [
      `💬 Какой слайд зацепил больше всего? Пиши в комментах!

🔄 Сохрани пост, чтобы не потерять
❤️ Ставь лайк, если было полезно
📤 Поделись с теми, кому нужно это увидеть`,

      `🤔 А ты используешь эти принципы в своем коде?

💾 Сохраняй карусель в закладки
👥 Отмечай друзей-программистов
💭 Делись своим опытом в комментариях`,

      `⭐ Оцени полезность от 1 до 10 в комментах!

🔖 Сохрани для изучения
🚀 Подпишись на больше контента
💡 Поделись своими инсайтами`,
    ];

    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  /**
   * 🌐 Генерирует контент на основе веб-исследования (заглушка для будущей MCP интеграции)
   */
  private async generateWebResearchContent(topic: string): Promise<string> {
    // TODO: Интегрировать с MCP веб-поиском для получения актуальной информации
    return `🔍 **Актуальные тренды ${topic}:**\n\n• Новейшие подходы и методологии\n• Что обсуждает сообщество разработчиков\n• Практические кейсы от лидеров индустрии\n• Инструменты и фреймворки 2025 года`;
  }

  /**
   * 💡 Генерирует практические советы
   */
  private generatePracticalTips(
    topic: string,
    slides: CarouselSlide[]
  ): string {
    const tips = [
      '📋 Начинай с малого и постепенно усложняй',
      '⏰ Выделяй время на изучение каждый день',
      '🔄 Практикуйся на реальных проектах',
      '👥 Общайся с сообществом разработчиков',
      '📚 Изучай best practices от экспертов',
      '🧪 Экспериментируй с новыми подходами',
    ];

    return `💡 **Практические советы по ${topic}:**\n\n${tips.slice(0, 4).join('\n')}`;
  }

  /**
   * 🏢 Генерирует примеры из реального мира
   */
  private generateRealWorldExamples(topic: string): string {
    return `🏢 **Примеры использования в реальных проектах:**\n\n• Как крупные компании применяют эти принципы\n• Кейсы успешной реализации\n• Метрики и результаты внедрения\n• Уроки, извлеченные командами разработки`;
  }

  /**
   * ✂️ Обрезает пост до указанного лимита символов с сохранением структуры
   */
  private truncateToLimit(text: string, limit: number): string {
    if (text.length <= limit) {
      return text;
    }

    const truncated = text.substring(0, limit - 50); // Оставляем место для окончания
    const lastNewline = truncated.lastIndexOf('\n\n');

    return lastNewline > 0
      ? truncated.substring(0, lastNewline) +
          '\n\n... (продолжение в комментариях) 👇'
      : truncated + '...';
  }

  private async generateTitles(
    topic: string,
    existingContent: VibeCodingContent[],
    llm: Llm
  ): Promise<string[]> {
    const existingTitles = existingContent.map(item => item.title).join(', ');
    const prompt = `Based on the topic "${topic}" and existing titles [${existingTitles}], generate 5 new, unique, and engaging titles for YouTube shorts or TikTok videos. The titles should be short, catchy, and relevant to the topic. Return only a JSON array of strings.`;
    return [];
  }

  private async generateSlides(
    title: string,
    llm: Llm
  ): Promise<CarouselSlide[]> {
    // ... (rest of the implementation for generating slides)
    return [];
  }
}
