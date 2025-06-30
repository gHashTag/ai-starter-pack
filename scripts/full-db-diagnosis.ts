#!/usr/bin/env bun

import { Pool } from 'pg';

// Проверяем точную строку подключения
const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

console.log('🔍 ПОЛНАЯ ДИАГНОСТИКА БАЗЫ ДАННЫХ\n');
console.log('🔗 Строка подключения:');
console.log(`   ${connectionString.replace(/:[^:@]*@/, ':***@')}`); // Скрываем пароль

const pool = new Pool({ connectionString });

async function fullDiagnosis() {
  const client = await pool.connect();
  
  try {
    // 1. Базовая информация о подключении
    console.log('\n1️⃣ БАЗОВАЯ ИНФОРМАЦИЯ:');
    const basicInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port,
        version() as postgres_version;
    `);
    
    const info = basicInfo.rows[0];
    console.log(`   🗄️  База данных: ${info.database_name}`);
    console.log(`   👤 Пользователь: ${info.user_name}`);
    console.log(`   🌐 Сервер: ${info.server_ip}:${info.server_port}`);
    console.log(`   📦 PostgreSQL: ${info.postgres_version.split(' ').slice(0, 2).join(' ')}`);
    
    // 2. Все схемы
    console.log('\n2️⃣ ВСЕ СХЕМЫ:');
    const schemas = await client.query(`
      SELECT 
        schema_name,
        schema_owner
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1')
      ORDER BY schema_name;
    `);
    
    schemas.rows.forEach(row => {
      console.log(`   📁 ${row.schema_name} (владелец: ${row.schema_owner})`);
    });
    
    // 3. Все таблицы во всех схемах
    console.log('\n3️⃣ ВСЕ ТАБЛИЦЫ:');
    const allTables = await client.query(`
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables 
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
      ORDER BY schemaname, tablename;
    `);
    
    if (allTables.rows.length === 0) {
      console.log('   ❌ НЕТ ПОЛЬЗОВАТЕЛЬСКИХ ТАБЛИЦ!');
    } else {
      allTables.rows.forEach(row => {
        console.log(`   📊 ${row.schemaname}.${row.tablename} (владелец: ${row.tableowner})`);
        console.log(`      индексы: ${row.hasindexes ? '✅' : '❌'}, правила: ${row.hasrules ? '✅' : '❌'}, триггеры: ${row.hastriggers ? '✅' : '❌'}`);
      });
    }
    
    // 4. Проверяем конкретно нашу схему
    console.log('\n4️⃣ ПРОВЕРКА vibecoding_vectors:');
    const schemaExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = 'vibecoding_vectors'
      );
    `);
    
    if (schemaExists.rows[0].exists) {
      console.log('   ✅ Схема vibecoding_vectors СУЩЕСТВУЕТ');
      
      // Проверяем таблицы в этой схеме
      const tablesInSchema = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'vibecoding_vectors';
      `);
      
      console.log(`   📊 Таблиц в схеме: ${tablesInSchema.rows.length}`);
      tablesInSchema.rows.forEach(row => {
        console.log(`      📄 ${row.tablename}`);
      });
      
      // Проверяем конкретно document_chunks
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'vibecoding_vectors' 
          AND table_name = 'document_chunks'
        );
      `);
      
      if (tableExists.rows[0].exists) {
        console.log('   ✅ Таблица document_chunks СУЩЕСТВУЕТ');
        
        try {
          const count = await client.query('SELECT COUNT(*) FROM vibecoding_vectors.document_chunks;');
          console.log(`   📊 Записей в таблице: ${count.rows[0].count}`);
          
          if (count.rows[0].count > 0) {
            const sample = await client.query(`
              SELECT source_path, title, LENGTH(content) as content_length 
              FROM vibecoding_vectors.document_chunks 
              LIMIT 3;
            `);
            console.log('   📋 Примеры записей:');
            sample.rows.forEach((row, i) => {
              console.log(`      ${i+1}. ${row.source_path}`);
              console.log(`         📝 ${row.title || 'Без заголовка'}`);
              console.log(`         📏 ${row.content_length} символов`);
            });
          }
        } catch (err) {
          console.log(`   ❌ Ошибка доступа к таблице: ${err}`);
        }
      } else {
        console.log('   ❌ Таблица document_chunks НЕ СУЩЕСТВУЕТ');
      }
      
    } else {
      console.log('   ❌ Схема vibecoding_vectors НЕ СУЩЕСТВУЕТ');
    }
    
    // 5. Проверяем pgvector
    console.log('\n5️⃣ РАСШИРЕНИЯ:');
    const extensions = await client.query(`
      SELECT extname, extversion, extowner 
      FROM pg_extension 
      ORDER BY extname;
    `);
    
    extensions.rows.forEach(row => {
      console.log(`   🔧 ${row.extname} v${row.extversion} (владелец: ${row.extowner})`);
    });
    
    // 6. Права доступа
    console.log('\n6️⃣ ПРАВА ДОСТУПА:');
    try {
      const privileges = await client.query(`
        SELECT 
          privilege_type,
          is_grantable
        FROM information_schema.role_table_grants 
        WHERE grantee = current_user 
        AND table_schema = 'vibecoding_vectors'
        AND table_name = 'document_chunks'
        LIMIT 5;
      `);
      
      if (privileges.rows.length > 0) {
        console.log('   ✅ Есть права на vibecoding_vectors.document_chunks:');
        privileges.rows.forEach(row => {
          console.log(`      🔑 ${row.privilege_type} ${row.is_grantable === 'YES' ? '(can grant)' : ''}`);
        });
      } else {
        console.log('   ❌ Нет прав на vibecoding_vectors.document_chunks');
      }
    } catch (err) {
      console.log(`   ⚠️ Не удалось проверить права: ${err.message}`);
    }
    
  } catch (error) {
    console.error('\n💥 КРИТИЧЕСКАЯ ОШИБКА ДИАГНОСТИКИ:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.main) {
  fullDiagnosis();
}
