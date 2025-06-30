import { Pool, PoolClient } from 'pg';
import OpenAI from 'openai';

// 🕉️ Конфигурация сервиса векторного поиска
const VECTOR_CONFIG = {
  NEON_CONNECTION:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
  OPENAI_MODEL: 'text-embedding-3-small', // 1536 dimensions
  SEARCH_LIMIT: 10,
  SIMILARITY_THRESHOLD: 0.7,
};

// Инициализация клиентов
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const pool = new Pool({
  connectionString: VECTOR_CONFIG.NEON_CONNECTION,
});

// 🎯 Интерфейсы
export interface VectorSearchResult {
  id: number;
  sourcePath: string;
  sourceFile: string;
  chunkIndex: number;
  title?: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
  tokenCount: number;
  createdAt: Date;
}

export interface VibeCodingCarouselCard {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  sourceFile: string;
  relevanceScore: number;
  codeExamples?: string[];
  keyPrinciples?: string[];
}

export interface HybridSearchResult {
  vectorResults: VectorSearchResult[];
  fullTextResults: VectorSearchResult[];
  combinedResults: VectorSearchResult[];
  searchStats: {
    vectorCount: number;
    fullTextCount: number;
    uniqueResults: number;
    queryTime: number;
  };
}

/**
 * 🔍 Основной класс для работы с векторной базой Vibecoding
 */
export class VibeCodingVectorService {
  /**
   * 🤖 Генерация эмбеддинга для поискового запроса
   */
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: VECTOR_CONFIG.OPENAI_MODEL,
        input: query,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Ошибка при генерации эмбеддинга запроса:', error);
      throw new Error('Не удалось создать эмбеддинг для поиска');
    }
  }

  /**
   * 🎯 Векторный поиск по эмбеддингам
   */
  async vectorSearch(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      categories?: string[];
      sectionTypes?: string[];
    } = {}
  ): Promise<VectorSearchResult[]> {
    const startTime = Date.now();
    const {
      limit = VECTOR_CONFIG.SEARCH_LIMIT,
      threshold = VECTOR_CONFIG.SIMILARITY_THRESHOLD,
    } = options;

    try {
      // Генерируем эмбеддинг для запроса
      const queryEmbedding = await this.generateQueryEmbedding(query);

      const client = await pool.connect();
      try {
        let whereClause = '';
        const queryParams: any[] = [
          `[${queryEmbedding.join(',')}]`,
          threshold,
          limit,
        ];
        let paramIndex = 4;

        // Добавляем фильтры по категориям
        if (options.categories && options.categories.length > 0) {
          whereClause += ` AND (metadata->>'file_category' = ANY($${paramIndex}))`;
          queryParams.push(options.categories);
          paramIndex++;
        }

        // Добавляем фильтры по типам секций
        if (options.sectionTypes && options.sectionTypes.length > 0) {
          whereClause += ` AND (metadata->>'section_type' = ANY($${paramIndex}))`;
          queryParams.push(options.sectionTypes);
          paramIndex++;
        }

        const searchQuery = `
          SELECT 
            id,
            source_path,
            source_file,
            chunk_index,
            title,
            content,
            metadata,
            token_count,
            created_at,
            1 - (embedding <=> $1::vector) as similarity
          FROM vibecoding_vectors.document_chunks
          WHERE 1 - (embedding <=> $1::vector) > $2
            ${whereClause}
          ORDER BY embedding <=> $1::vector
          LIMIT $3
        `;

        const result = await client.query(searchQuery, queryParams);

        const searchResults: VectorSearchResult[] = result.rows.map(row => ({
          id: row.id,
          sourcePath: row.source_path,
          sourceFile: row.source_file,
          chunkIndex: row.chunk_index,
          title: row.title,
          content: row.content,
          metadata: row.metadata,
          similarity: parseFloat(row.similarity),
          tokenCount: row.token_count,
          createdAt: new Date(row.created_at),
        }));

        console.log(
          `🔍 Векторный поиск за ${Date.now() - startTime}ms: найдено ${searchResults.length} результатов`
        );
        return searchResults;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Ошибка векторного поиска:', error);
      throw error;
    }
  }

  /**
   * 📝 Полнотекстовый поиск по русскому языку
   */
  async fullTextSearch(
    query: string,
    options: {
      limit?: number;
      categories?: string[];
    } = {}
  ): Promise<VectorSearchResult[]> {
    const { limit = VECTOR_CONFIG.SEARCH_LIMIT } = options;

    try {
      const client = await pool.connect();
      try {
        let whereClause = '';
        const queryParams: any[] = [query, limit];
        let paramIndex = 3;

        // Фильтры по категориям
        if (options.categories && options.categories.length > 0) {
          whereClause += ` AND (metadata->>'file_category' = ANY($${paramIndex}))`;
          queryParams.push(options.categories);
          paramIndex++;
        }

        const searchQuery = `
          SELECT 
            id,
            source_path,
            source_file,
            chunk_index,
            title,
            content,
            metadata,
            token_count,
            created_at,
            ts_rank(to_tsvector('russian', content), plainto_tsquery('russian', $1)) as similarity
          FROM vibecoding_vectors.document_chunks
          WHERE to_tsvector('russian', content) @@ plainto_tsquery('russian', $1)
            ${whereClause}
          ORDER BY ts_rank(to_tsvector('russian', content), plainto_tsquery('russian', $1)) DESC
          LIMIT $2
        `;

        const result = await client.query(searchQuery, queryParams);

        return result.rows.map(row => ({
          id: row.id,
          sourcePath: row.source_path,
          sourceFile: row.source_file,
          chunkIndex: row.chunk_index,
          title: row.title,
          content: row.content,
          metadata: row.metadata,
          similarity: parseFloat(row.similarity),
          tokenCount: row.token_count,
          createdAt: new Date(row.created_at),
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Ошибка полнотекстового поиска:', error);
      throw error;
    }
  }

  /**
   * 🔄 Гибридный поиск (векторный + полнотекстовый)
   */
  async hybridSearch(
    query: string,
    options: {
      limit?: number;
      vectorWeight?: number;
      fullTextWeight?: number;
      categories?: string[];
    } = {}
  ): Promise<HybridSearchResult> {
    const startTime = Date.now();
    const {
      limit = VECTOR_CONFIG.SEARCH_LIMIT,
      vectorWeight = 0.7,
      fullTextWeight = 0.3,
    } = options;

    try {
      // Параллельный поиск
      const [vectorResults, fullTextResults] = await Promise.all([
        this.vectorSearch(query, { ...options, limit: Math.ceil(limit * 1.5) }),
        this.fullTextSearch(query, {
          ...options,
          limit: Math.ceil(limit * 1.5),
        }),
      ]);

      // Объединяем результаты с взвешенными оценками
      const combinedMap = new Map<number, VectorSearchResult>();

      // Добавляем векторные результаты
      for (const result of vectorResults) {
        combinedMap.set(result.id, {
          ...result,
          similarity: result.similarity * vectorWeight,
        });
      }

      // Добавляем/обновляем полнотекстовые результаты
      for (const result of fullTextResults) {
        const existing = combinedMap.get(result.id);
        if (existing) {
          // Комбинируем оценки если результат уже есть
          existing.similarity += result.similarity * fullTextWeight;
        } else {
          combinedMap.set(result.id, {
            ...result,
            similarity: result.similarity * fullTextWeight,
          });
        }
      }

      // Сортируем по итоговой оценке и ограничиваем количество
      const combinedResults = Array.from(combinedMap.values())
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      const searchStats = {
        vectorCount: vectorResults.length,
        fullTextCount: fullTextResults.length,
        uniqueResults: combinedResults.length,
        queryTime: Date.now() - startTime,
      };

      console.log(
        `🔄 Гибридный поиск за ${searchStats.queryTime}ms:`,
        searchStats
      );

      return {
        vectorResults,
        fullTextResults,
        combinedResults,
        searchStats,
      };
    } catch (error) {
      console.error('❌ Ошибка гибридного поиска:', error);
      throw error;
    }
  }

  /**
   * 🎨 Генерация карточек карусели из результатов поиска
   */
  async generateCarouselCards(
    searchResults: VectorSearchResult[],
    options: {
      maxCards?: number;
      includeCodeExamples?: boolean;
      groupByCategory?: boolean;
    } = {}
  ): Promise<VibeCodingCarouselCard[]> {
    const {
      maxCards = 5,
      includeCodeExamples = true,
      groupByCategory = false,
    } = options;

    try {
      const cards: VibeCodingCarouselCard[] = [];

      // Группируем по категориям если нужно
      const resultsToProcess = groupByCategory
        ? this.groupResultsByCategory(searchResults, maxCards)
        : searchResults.slice(0, maxCards);

      for (const result of resultsToProcess) {
        const card: VibeCodingCarouselCard = {
          id: `vibecoding-${result.id}`,
          title: result.title || this.extractTitleFromContent(result.content),
          content: this.truncateContent(result.content, 300),
          summary: this.generateSummary(result.content),
          category: result.metadata.file_category || 'general',
          tags: this.extractTags(result.content, result.metadata),
          sourceFile: result.sourceFile,
          relevanceScore: result.similarity,
        };

        // Добавляем примеры кода если найдены
        if (includeCodeExamples) {
          card.codeExamples = this.extractCodeExamples(result.content);
        }

        // Извлекаем ключевые принципы
        card.keyPrinciples = this.extractKeyPrinciples(result.content);

        cards.push(card);
      }

      console.log(`🎨 Создано ${cards.length} карточек карусели`);
      return cards;
    } catch (error) {
      console.error('❌ Ошибка генерации карточек:', error);
      throw error;
    }
  }

  /**
   * 📊 Получение статистики векторной базы
   */
  async getVectorDatabaseStats(): Promise<{
    totalChunks: number;
    totalFiles: number;
    categoryCounts: Record<string, number>;
    sectionTypeCounts: Record<string, number>;
    avgTokensPerChunk: number;
  }> {
    try {
      const client = await pool.connect();
      try {
        const [statsResult, categoryResult, sectionResult] = await Promise.all([
          client.query(`
            SELECT 
              COUNT(*) as total_chunks,
              COUNT(DISTINCT source_path) as total_files,
              AVG(token_count) as avg_tokens
            FROM vibecoding_vectors.document_chunks
          `),
          client.query(`
            SELECT 
              metadata->>'file_category' as category,
              COUNT(*) as count
            FROM vibecoding_vectors.document_chunks
            WHERE metadata->>'file_category' IS NOT NULL
            GROUP BY metadata->>'file_category'
            ORDER BY count DESC
          `),
          client.query(`
            SELECT 
              metadata->>'section_type' as section_type,
              COUNT(*) as count
            FROM vibecoding_vectors.document_chunks
            WHERE metadata->>'section_type' IS NOT NULL
            GROUP BY metadata->>'section_type'
            ORDER BY count DESC
          `),
        ]);

        const stats = statsResult.rows[0];

        const categoryCounts: Record<string, number> = {};
        for (const row of categoryResult.rows) {
          categoryCounts[row.category] = parseInt(row.count);
        }

        const sectionTypeCounts: Record<string, number> = {};
        for (const row of sectionResult.rows) {
          sectionTypeCounts[row.section_type] = parseInt(row.count);
        }

        return {
          totalChunks: parseInt(stats.total_chunks),
          totalFiles: parseInt(stats.total_files),
          categoryCounts,
          sectionTypeCounts,
          avgTokensPerChunk: parseFloat(stats.avg_tokens) || 0,
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      throw error;
    }
  }

  // 🛠️ Вспомогательные методы

  private groupResultsByCategory(
    results: VectorSearchResult[],
    maxCards: number
  ): VectorSearchResult[] {
    const categoryGroups = new Map<string, VectorSearchResult[]>();

    for (const result of results) {
      const category = result.metadata.file_category || 'general';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(result);
    }

    const balanced: VectorSearchResult[] = [];
    const maxPerCategory = Math.ceil(maxCards / categoryGroups.size);

    for (const [category, categoryResults] of categoryGroups) {
      balanced.push(...categoryResults.slice(0, maxPerCategory));
      if (balanced.length >= maxCards) break;
    }

    return balanced.slice(0, maxCards);
  }

  private extractTitleFromContent(content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.match(/^#{1,6}\s+/)) {
        return line.replace(/^#{1,6}\s+/, '').slice(0, 100);
      }
    }
    return lines[0]?.slice(0, 50) || 'Без заголовка';
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }

  private generateSummary(content: string): string {
    // Простое извлечение первого абзаца как саммари
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const firstParagraph = paragraphs[0] || '';
    return this.truncateContent(firstParagraph.replace(/^#{1,6}\s+/, ''), 150);
  }

  private extractTags(
    content: string,
    metadata: Record<string, any>
  ): string[] {
    const tags: string[] = [];

    // Добавляем теги из метаданных
    if (metadata.file_category) tags.push(metadata.file_category);
    if (metadata.section_type) tags.push(metadata.section_type);

    // Ищем ключевые слова
    const keywords = [
      'AI',
      'ИИ',
      'GPT',
      'Claude',
      'Cursor',
      'Vibecoding',
      'Vibe',
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'API',
      'медитация',
      'философия',
      'практика',
      'инструмент',
    ];

    for (const keyword of keywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    }

    return [...new Set(tags)].slice(0, 5);
  }

  private extractCodeExamples(content: string): string[] {
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    return codeBlocks
      .map(block =>
        block
          .replace(/```\w*\n?/, '')
          .replace(/```$/, '')
          .trim()
      )
      .filter(code => code.length > 0)
      .slice(0, 3);
  }

  private extractKeyPrinciples(content: string): string[] {
    const principles: string[] = [];

    // Ищем списки с принципами
    const bulletPoints = content.match(/^[-*+]\s+.+$/gm) || [];
    const numberedPoints = content.match(/^\d+\.\s+.+$/gm) || [];

    const allPoints = [...bulletPoints, ...numberedPoints]
      .map(point => point.replace(/^[-*+\d.]\s+/, '').trim())
      .filter(point => point.length > 10 && point.length < 150);

    return allPoints.slice(0, 5);
  }

  /**
   * 🔧 Закрытие соединений
   */
  async close(): Promise<void> {
    await pool.end();
  }
}

// 🏭 Экспорт singleton instance
export const vibeCodingVectorService = new VibeCodingVectorService();
