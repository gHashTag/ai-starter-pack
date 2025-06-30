#!/usr/bin/env bun

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function createDatabaseStepByStep() {
  console.log('🕉️ Создание векторной базы данных пошагово...\n');
  
  const client = await pool.connect();
  
  try {
    // Шаг 1: Проверяем pgvector
    console.log('1️⃣ Проверяем и устанавливаем pgvector...');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('   ✅ pgvector установлен');
    } catch (error: any) {
      console.log('   ⚠️ pgvector может быть недоступен:', error.message);
    }
    
    // Шаг 2: Создаем схему
    console.log('\n2️⃣ Создаем схему vibecoding_vectors...');
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS vibecoding_vectors;');
      console.log('   ✅ Схема создана');
    } catch (error: any) {
      console.log('   ❌ Ошибка создания схемы:', error.message);
      throw error;
    }
    
    // Шаг 3: Создаем таблицу
    console.log('\n3️⃣ Создаем таблицу document_chunks...');
    try {
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
      
      await client.query(createTableSQL);
      console.log('   ✅ Таблица создана');
    } catch (error: any) {
      console.log('   ❌ Ошибка создания таблицы:', error.message);
      
      // Если векторный тип недоступен, создаем без него
      if (error.message.includes('type "vector" does not exist')) {
        console.log('   🔄 Создаем таблицу без векторного типа (будем добавлять позже)...');
        
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
    
    // Шаг 4: Создаем индексы
    console.log('\n4️⃣ Создаем базовые индексы...');
    
    const basicIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_source_file ON vibecoding_vectors.document_chunks(source_file);',
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_source_path ON vibecoding_vectors.document_chunks(source_path);',
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_content_fts ON vibecoding_vectors.document_chunks USING gin(to_tsvector(\'russian\', content));',
      'CREATE INDEX IF NOT EXISTS idx_vibecoding_created_at ON vibecoding_vectors.document_chunks(created_at);'
    ];
    
    for (const indexSQL of basicIndexes) {
      try {
        await client.query(indexSQL);
        console.log('   ✅ Индекс создан');
      } catch (error: any) {
        console.log('   ⚠️ Ошибка создания индекса:', error.message);
      }
    }
    
    // Шаг 5: Проверяем итоговую структуру
    console.log('\n5️⃣ Проверяем созданную структуру...');
    
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'vibecoding_vectors' 
        AND table_name = 'document_chunks'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('   ✅ Таблица vibecoding_vectors.document_chunks существует');
      
      // Получаем структуру
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'vibecoding_vectors' 
        AND table_name = 'document_chunks'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Структура таблицы:');
      columns.rows.forEach(row => {
        console.log(`   📄 ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
    } else {
      throw new Error('Таблица не была создана');
    }
    
    console.log('\n🎉 ============================================');
    console.log('✅ ВЕКТОРНАЯ БАЗА ДАННЫХ СОЗДАНА УСПЕШНО!');
    console.log('🎯 Теперь можно запускать векторизацию');
    console.log('🕉️ ============================================');
    
  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск
if (import.meta.main) {
  createDatabaseStepByStep();
}

export { createDatabaseStepByStep };
