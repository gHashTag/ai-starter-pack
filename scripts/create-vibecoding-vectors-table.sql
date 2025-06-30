-- 🕉️ Создание векторной базы данных для Библии Vibecoding
-- "सत्यमेव जयते" - Истина всегда побеждает

-- Включаем расширение pgvector для работы с векторными эмбеддингами
CREATE EXTENSION IF NOT EXISTS vector;

-- Создаем схему для векторных данных Vibecoding
CREATE SCHEMA IF NOT EXISTS vibecoding_vectors;

-- Создаем таблицу для хранения чанков документов с векторными эмбеддингами
CREATE TABLE IF NOT EXISTS vibecoding_vectors.document_chunks (
    -- Основные поля
    id SERIAL PRIMARY KEY,
    source_file VARCHAR(255) NOT NULL,        -- Имя исходного файла
    source_path TEXT NOT NULL,                -- Полный путь к файлу
    chunk_index INTEGER NOT NULL,             -- Индекс чанка в файле
    
    -- Контент
    title TEXT,                               -- Заголовок секции (если есть)
    content TEXT NOT NULL,                    -- Текстовое содержимое чанка
    
    -- Векторные данные
    embedding vector(1536) NOT NULL,          -- OpenAI text-embedding-3-small (1536 размерность)
    
    -- Метаданные
    metadata JSONB DEFAULT '{}',              -- Дополнительные метаданные (категория, тип секции и т.д.)
    token_count INTEGER NOT NULL DEFAULT 0,   -- Количество токенов в чанке
    chunk_hash CHAR(64) NOT NULL,             -- SHA256 хеш для дедупликации
    
    -- Временные метки
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ограничения
    UNIQUE(source_path, chunk_index),         -- Уникальность по пути и индексу
    UNIQUE(chunk_hash)                        -- Уникальность по хешу контента
);

-- Создаем индексы для оптимизации поиска

-- Индекс для векторного поиска (cosine similarity)
CREATE INDEX IF NOT EXISTS idx_vibecoding_embedding_cosine 
ON vibecoding_vectors.document_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Индекс для полнотекстового поиска по русскому языку
CREATE INDEX IF NOT EXISTS idx_vibecoding_content_fts 
ON vibecoding_vectors.document_chunks 
USING gin(to_tsvector('russian', content));

-- Индексы для фильтрации
CREATE INDEX IF NOT EXISTS idx_vibecoding_source_file 
ON vibecoding_vectors.document_chunks(source_file);

CREATE INDEX IF NOT EXISTS idx_vibecoding_source_path 
ON vibecoding_vectors.document_chunks(source_path);

-- Индексы для метаданных (JSONB)
CREATE INDEX IF NOT EXISTS idx_vibecoding_metadata_category 
ON vibecoding_vectors.document_chunks 
USING gin((metadata->'file_category'));

CREATE INDEX IF NOT EXISTS idx_vibecoding_metadata_section_type 
ON vibecoding_vectors.document_chunks 
USING gin((metadata->'section_type'));

-- Индекс для временных меток
CREATE INDEX IF NOT EXISTS idx_vibecoding_created_at 
ON vibecoding_vectors.document_chunks(created_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_vibecoding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_vibecoding_updated_at 
ON vibecoding_vectors.document_chunks;

CREATE TRIGGER trigger_update_vibecoding_updated_at
    BEFORE UPDATE ON vibecoding_vectors.document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_vibecoding_updated_at();

-- Создаем view для удобного анализа статистики
CREATE OR REPLACE VIEW vibecoding_vectors.stats_overview AS
SELECT 
    COUNT(*) as total_chunks,
    COUNT(DISTINCT source_path) as total_files,
    AVG(token_count) as avg_tokens_per_chunk,
    MIN(token_count) as min_tokens,
    MAX(token_count) as max_tokens,
    COUNT(DISTINCT metadata->>'file_category') as unique_categories,
    COUNT(DISTINCT metadata->>'section_type') as unique_section_types,
    MIN(created_at) as first_indexed,
    MAX(updated_at) as last_updated
FROM vibecoding_vectors.document_chunks;

-- Создаем view для анализа по категориям
CREATE OR REPLACE VIEW vibecoding_vectors.category_stats AS
SELECT 
    metadata->>'file_category' as category,
    COUNT(*) as chunk_count,
    AVG(token_count) as avg_tokens,
    COUNT(DISTINCT source_path) as file_count
FROM vibecoding_vectors.document_chunks
WHERE metadata->>'file_category' IS NOT NULL
GROUP BY metadata->>'file_category'
ORDER BY chunk_count DESC;

-- Создаем view для анализа по типам секций
CREATE OR REPLACE VIEW vibecoding_vectors.section_type_stats AS
SELECT 
    metadata->>'section_type' as section_type,
    COUNT(*) as chunk_count,
    AVG(token_count) as avg_tokens,
    COUNT(DISTINCT source_path) as file_count
FROM vibecoding_vectors.document_chunks
WHERE metadata->>'section_type' IS NOT NULL
GROUP BY metadata->>'section_type'
ORDER BY chunk_count DESC;

-- Функция для очистки старых векторов (для переиндексации)
CREATE OR REPLACE FUNCTION vibecoding_vectors.cleanup_old_vectors(
    older_than_days INTEGER DEFAULT 7
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM vibecoding_vectors.document_chunks 
    WHERE updated_at < NOW() - (older_than_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Комментарии для документации
COMMENT ON SCHEMA vibecoding_vectors IS 'Схема для хранения векторизированного контента Библии Vibecoding';
COMMENT ON TABLE vibecoding_vectors.document_chunks IS 'Чанки документов с векторными эмбеддингами для семантического поиска';
COMMENT ON COLUMN vibecoding_vectors.document_chunks.embedding IS 'Векторное представление текста через OpenAI text-embedding-3-small (1536 измерений)';
COMMENT ON COLUMN vibecoding_vectors.document_chunks.metadata IS 'JSON метаданные: file_category, section_type, и другие атрибуты';
COMMENT ON COLUMN vibecoding_vectors.document_chunks.chunk_hash IS 'SHA256 хеш содержимого для предотвращения дублирования';

-- Выводим информацию о созданной структуре
SELECT 'Векторная база данных Vibecoding успешно создана! 🕉️' as status;
SELECT * FROM vibecoding_vectors.stats_overview;
