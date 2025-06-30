#!/usr/bin/env bun

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function showVibeCodingData() {
  console.log('📊 ДАННЫЕ VIBECODING В ВЕКТОРНОЙ БАЗЕ\n');
  
  const client = await pool.connect();
  
  try {
    // Общая статистика
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_chunks,
        COUNT(DISTINCT source_path) as total_files,
        AVG(token_count) as avg_tokens,
        MIN(created_at) as first_indexed,
        MAX(updated_at) as last_updated
      FROM vibecoding_vectors.document_chunks;
    `);
    
    const stat = stats.rows[0];
    console.log('📈 ОБЩАЯ СТАТИСТИКА:');
    console.log(`   📦 Всего чанков: ${stat.total_chunks}`);
    console.log(`   📁 Файлов обработано: ${stat.total_files}`);
    console.log(`   📊 Средний размер чанка: ${Math.round(stat.avg_tokens)} токенов`);
    console.log(`   ⏰ Первая индексация: ${stat.first_indexed}`);
    console.log(`   🔄 Последнее обновление: ${stat.last_updated}`);
    
    // Статистика по категориям
    console.log('\n📂 ПО КАТЕГОРИЯМ:');
    const categories = await client.query(`
      SELECT 
        metadata->>'file_category' as category,
        COUNT(*) as chunk_count,
        COUNT(DISTINCT source_path) as file_count
      FROM vibecoding_vectors.document_chunks
      WHERE metadata->>'file_category' IS NOT NULL
      GROUP BY metadata->>'file_category'
      ORDER BY chunk_count DESC;
    `);
    
    categories.rows.forEach(row => {
      console.log(`   📁 ${row.category}: ${row.chunk_count} чанков (${row.file_count} файлов)`);
    });
    
    // Статистика по типам секций
    console.log('\n📝 ПО ТИПАМ СЕКЦИЙ:');
    const sectionTypes = await client.query(`
      SELECT 
        metadata->>'section_type' as section_type,
        COUNT(*) as chunk_count
      FROM vibecoding_vectors.document_chunks
      WHERE metadata->>'section_type' IS NOT NULL
      GROUP BY metadata->>'section_type'
      ORDER BY chunk_count DESC;
    `);
    
    sectionTypes.rows.forEach(row => {
      console.log(`   📄 ${row.section_type}: ${row.chunk_count} чанков`);
    });
    
    // Примеры файлов
    console.log('\n📚 ОБРАБОТАННЫЕ ФАЙЛЫ (примеры):');
    const files = await client.query(`
      SELECT 
        source_path,
        COUNT(*) as chunks,
        SUM(token_count) as total_tokens,
        MAX(title) as example_title
      FROM vibecoding_vectors.document_chunks
      GROUP BY source_path
      ORDER BY chunks DESC
      LIMIT 10;
    `);
    
    files.rows.forEach(row => {
      console.log(`   📖 ${row.source_path}`);
      console.log(`      📦 ${row.chunks} чанков, ${row.total_tokens} токенов`);
      if (row.example_title) {
        console.log(`      📝 Пример: "${row.example_title.slice(0, 50)}..."`);
      }
      console.log('');
    });
    
    // Пример содержимого
    console.log('🔍 ПРИМЕР СОДЕРЖИМОГО:');
    const sample = await client.query(`
      SELECT title, content, metadata
      FROM vibecoding_vectors.document_chunks
      WHERE title IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1;
    `);
    
    if (sample.rows.length > 0) {
      const row = sample.rows[0];
      console.log(`   📝 Заголовок: ${row.title}`);
      console.log(`   📄 Содержимое: ${row.content.slice(0, 200)}...`);
      console.log(`   🏷️  Метаданные: ${JSON.stringify(row.metadata, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.main) {
  showVibeCodingData();
}
