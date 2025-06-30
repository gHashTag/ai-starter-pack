#!/usr/bin/env bun

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function checkDatabase() {
  console.log('🔍 Проверяем базу данных...\n');
  
  const client = await pool.connect();
  
  try {
    // Проверяем все схемы
    console.log('📁 Все схемы в базе данных:');
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name;
    `);
    
    schemas.rows.forEach(row => {
      console.log(`   📂 ${row.schema_name}`);
    });
    
    // Проверяем все таблицы во всех схемах
    console.log('\n📊 Все таблицы по схемам:');
    const tables = await client.query(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name;
    `);
    
    if (tables.rows.length === 0) {
      console.log('   ❌ Нет пользовательских таблиц');
    } else {
      tables.rows.forEach(row => {
        console.log(`   📄 ${row.table_schema}.${row.table_name} (${row.table_type})`);
      });
    }
    
    // Специально проверяем нашу таблицу
    console.log('\n🎯 Проверяем конкретно vibecoding_vectors.document_chunks:');
    const ourTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'vibecoding_vectors' 
        AND table_name = 'document_chunks'
      );
    `);
    
    if (ourTable.rows[0].exists) {
      console.log('   ✅ Таблица vibecoding_vectors.document_chunks СУЩЕСТВУЕТ');
      
      // Проверяем количество записей
      const count = await client.query('SELECT COUNT(*) FROM vibecoding_vectors.document_chunks;');
      console.log(`   📊 Количество записей: ${count.rows[0].count}`);
      
      // Показываем структуру
      const structure = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'vibecoding_vectors' 
        AND table_name = 'document_chunks'
        ORDER BY ordinal_position;
      `);
      
      console.log('   📋 Структура таблицы:');
      structure.rows.forEach(row => {
        console.log(`      📄 ${row.column_name}: ${row.data_type}`);
      });
      
    } else {
      console.log('   ❌ Таблица vibecoding_vectors.document_chunks НЕ СУЩЕСТВУЕТ');
    }
    
    // Проверяем pgvector
    console.log('\n🔧 Проверяем pgvector расширение:');
    const extensions = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'vector';
    `);
    
    if (extensions.rows.length > 0) {
      console.log(`   ✅ pgvector установлен, версия: ${extensions.rows[0].extversion}`);
    } else {
      console.log('   ❌ pgvector НЕ установлен');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.main) {
  checkDatabase();
}
