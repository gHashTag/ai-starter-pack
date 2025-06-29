import { promises as fs } from 'fs';
import path from 'path';
import { VibeCodingContent } from '../types';
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
}
