#!/usr/bin/env bun

import { Pool } from 'pg';

/**
 * 🚀 Быстрое создание векторной структуры для VibeCoding
 */
async function quickSetupVectors(connectionString: string): Promise<void> {
  console.log('🕉️ ========================================');
  console.log('🚀 БЫСТРОЕ СОЗДАНИЕ ВЕКТОРНОЙ СТРУКТУРЫ');
  console.log('🕉️ ========================================\n');

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    // 1. Включаем pgvector расширение
    console.log('1️⃣ Включаем pgvector расширение...');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('   ✅ pgvector включен');
    } catch (error: any) {
      console.log('   ⚠️ pgvector может быть недоступен, продолжаем без него');
    }

    // 2. Создаем схему vibecoding_vectors
    console.log('\n2️⃣ Создаем схему vibecoding_vectors...');
    await client.query('CREATE SCHEMA IF NOT EXISTS vibecoding_vectors;');
    console.log('   ✅ Схема создана');

    // 3. Создаем таблицу document_chunks
    console.log('\n3️⃣ Создаем таблицу document_chunks...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS vibecoding_vectors.document_chunks (
        id SERIAL PRIMARY KEY,
        source_file VARCHAR(255) NOT NULL,
        source_path TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        embedding vector(1536),
        metadata JSONB DEFAULT '{}',
        token_count INTEGER NOT NULL DEFAULT 0,
        chunk_hash CHAR(64) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(source_path, chunk_index),
        UNIQUE(chunk_hash)
      );
    `;

    try {
      await client.query(createTableSQL);
      console.log('   ✅ Таблица с векторами создана');
    } catch (error: any) {
      if (error.message.includes('type "vector" does not exist')) {
        console.log('   🔄 Создаем таблицу без векторного типа...');
        
        const createTableWithoutVectorSQL = `
          CREATE TABLE IF NOT EXISTS vibecoding_vectors.document_chunks (
            id SERIAL PRIMARY KEY,
            source_file VARCHAR(255) NOT NULL,
            source_path TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            title TEXT,
            content TEXT NOT NULL,
            embedding TEXT,
            metadata JSONB DEFAULT '{}',
            token_count INTEGER NOT NULL DEFAULT 0,
            chunk_hash CHAR(64) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(source_path, chunk_index),
            UNIQUE(chunk_hash)
          );
        `;
        
        await client.query(createTableWithoutVectorSQL);
        console.log('   ✅ Таблица создана (без векторного типа)');
      } else {
        throw error;
      }
    }

    // 4. Создаем базовые индексы
    console.log('\n4️⃣ Создаем индексы...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_source_file ON vibecoding_vectors.document_chunks(source_file);',
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_source_path ON vibecoding_vectors.document_chunks(source_path);',
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_content_fts ON vibecoding_vectors.document_chunks USING gin(to_tsvector(\'russian\', content));',
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_created_at ON vibecoding_vectors.document_chunks(created_at);'
    ];

    for (const indexSQL of indexes) {
      try {
        await client.query(indexSQL);
        console.log('   ✅ Индекс создан');
      } catch (error: any) {
        console.log('   ⚠️ Ошибка создания индекса:', error.message);
      }
    }

    // 5. Создаем функцию обновления updated_at
    console.log('\n5️⃣ Создаем триггер обновления...');
    
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_vibecoding_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_update_vibecoding_updated_at 
      ON vibecoding_vectors.document_chunks;

      CREATE TRIGGER trigger_update_vibecoding_updated_at
        BEFORE UPDATE ON vibecoding_vectors.document_chunks
        FOR EACH ROW
        EXECUTE FUNCTION update_vibecoding_updated_at();
    `;
    
    await client.query(triggerSQL);
    console.log('   ✅ Триггер создан');

    // 6. Проверяем результат
    console.log('\n6️⃣ Проверяем созданную структуру...');
    
    const schemaCheck = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'vibecoding_vectors';
    `);
    
    if (schemaCheck.rows.length > 0) {
      console.log('   ✅ Схема vibecoding_vectors существует');
    }

    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'vibecoding_vectors' 
      AND table_name = 'document_chunks';
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('   ✅ Таблица document_chunks существует');
      
      // Показываем структуру
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'vibecoding_vectors' 
        AND table_name = 'document_chunks'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Структура таблицы:');
      columns.rows.forEach(row => {
        console.log(`   📄 ${row.column_name}: ${row.data_type}`);
      });
    }

    console.log('\n🎉 ========================================');
    console.log('✅ ВЕКТОРНАЯ СТРУКТУРА СОЗДАНА УСПЕШНО!');
    console.log('🎯 Теперь можно запускать векторизацию');
    console.log('🕉️ ========================================');

  } catch (error) {
    console.error('\n❌ Ошибка при создании структуры:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск из командной строки
if (import.meta.main) {
  const connectionString = process.argv[2];
  
  if (!connectionString) {
    console.error('❌ Необходимо указать строку подключения к базе данных');
    console.log('💡 Использование: bun run scripts/quick-setup-vectors.ts "connection_string"');
    console.log('\n📝 Пример:');
    console.log('bun run scripts/quick-setup-vectors.ts "postgresql://user:pass@host/db"');
    process.exit(1);
  }
  
  quickSetupVectors(connectionString)
    .then(() => {
      console.log('\n🚀 Готово! Теперь можно запускать векторизацию:');
      console.log('bun run scripts/improved-vectorizer.ts "connection_string"');
    })
    .catch((error) => {
      console.error('💥 Неудача:', error);
      process.exit(1);
    });
}

export { quickSetupVectors };
