#!/usr/bin/env bun

import { readFile } from 'fs/promises';
import { Pool } from 'pg';
import { join } from 'path';

// 🕉️ Конфигурация подключения к базе данных
const DATABASE_CONFIG = {
  connectionString: process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_jwz8kFs0XVTe@ep-shy-truth-a5hat2dz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
};

/**
 * 🏗️ Создание векторной базы данных для Vibecoding
 */
async function setupVibeCodingDatabase(): Promise<void> {
  console.log('🕉️ ============================================');
  console.log('🏗️  СОЗДАНИЕ ВЕКТОРНОЙ БАЗЫ ДАННЫХ VIBECODING');
  console.log('🕉️ ============================================\n');

  const pool = new Pool(DATABASE_CONFIG);

  try {
    // Читаем SQL скрипт
    console.log('📜 Загружаем SQL скрипт...');
    const sqlPath = join(__dirname, 'create-vibecoding-vectors-table.sql');
    const sqlScript = await readFile(sqlPath, 'utf-8');

    // Подключаемся к базе данных
    console.log('🔌 Подключаемся к Neon PostgreSQL...');
    const client = await pool.connect();

    try {
      // Выполняем SQL скрипт
      console.log('⚡ Выполняем создание структуры базы данных...');
      
      // Разбиваем скрипт на отдельные команды (по точке с запятой)
      const commands = sqlScript
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command) {
          try {
            await client.query(command);
            
            // Логируем прогресс для важных операций
            if (command.includes('CREATE EXTENSION')) {
              console.log('   ✅ Расширение pgvector подключено');
            } else if (command.includes('CREATE SCHEMA')) {
              console.log('   ✅ Схема vibecoding_vectors создана');
            } else if (command.includes('CREATE TABLE')) {
              console.log('   ✅ Таблица document_chunks создана');
            } else if (command.includes('CREATE INDEX')) {
              console.log('   ✅ Индекс создан');
            } else if (command.includes('CREATE VIEW')) {
              console.log('   ✅ View для аналитики создан');
            } else if (command.includes('CREATE TRIGGER')) {
              console.log('   ✅ Триггер обновления created');
            } else if (command.includes('CREATE OR REPLACE FUNCTION')) {
              console.log('   ✅ Функция создана');
            }
          } catch (cmdError: any) {
            // Игнорируем ошибки "уже существует" для IF NOT EXISTS конструкций
            if (cmdError.code === '42P07' || cmdError.code === '42710' || cmdError.message.includes('already exists')) {
              console.log('   ⚠️  Объект уже существует, пропускаем...');
              continue;
            }
            throw cmdError;
          }
        }
      }

      // Проверяем создание таблицы
      console.log('\n🔍 Проверяем созданную структуру...');
      
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'vibecoding_vectors' 
          AND table_name = 'document_chunks'
        );
      `);

      if (tableCheck.rows[0].exists) {
        console.log('   ✅ Таблица vibecoding_vectors.document_chunks успешно создана');
      } else {
        throw new Error('Таблица не была создана');
      }

      // Проверяем pgvector расширение
      const vectorCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_extension 
          WHERE extname = 'vector'
        );
      `);

      if (vectorCheck.rows[0].exists) {
        console.log('   ✅ Расширение pgvector активно');
      } else {
        console.log('   ⚠️  Расширение pgvector может быть недоступно');
      }

      // Получаем информацию о структуре таблицы
      const structureInfo = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'vibecoding_vectors' 
        AND table_name = 'document_chunks'
        ORDER BY ordinal_position;
      `);

      console.log('\n📊 Структура таблицы document_chunks:');
      structureInfo.rows.forEach(row => {
        const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = row.column_default ? ` DEFAULT ${row.column_default}` : '';
        console.log(`   📄 ${row.column_name}: ${row.data_type} ${nullable}${defaultValue}`);
      });

      // Проверяем индексы
      const indexInfo = await client.query(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'vibecoding_vectors' 
        AND tablename = 'document_chunks';
      `);

      console.log('\n🗂️  Созданные индексы:');
      indexInfo.rows.forEach(row => {
        console.log(`   🔍 ${row.indexname}`);
      });

      // Проверяем views
      const viewInfo = await client.query(`
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'vibecoding_vectors';
      `);

      console.log('\n📈 Созданные views для аналитики:');
      viewInfo.rows.forEach(row => {
        console.log(`   📊 ${row.table_name}`);
      });

    } finally {
      client.release();
    }

    console.log('\n🎉 ============================================');
    console.log('✅ ВЕКТОРНАЯ БАЗА ДАННЫХ УСПЕШНО СОЗДАНА!');
    console.log('🎯 Теперь можно запускать векторизацию контента');
    console.log('🕉️ ============================================');

  } catch (error) {
    console.error('\n💥 ============================================');
    console.error('❌ ОШИБКА СОЗДАНИЯ БАЗЫ ДАННЫХ:');
    console.error(error);
    console.error('🕉️ ============================================');
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * 🧪 Тест подключения к базе данных
 */
async function testConnection(): Promise<void> {
  console.log('🔌 Тестируем подключение к базе данных...');
  
  const pool = new Pool(DATABASE_CONFIG);
  
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as postgres_version;');
      console.log('✅ Подключение успешно!');
      console.log(`   ⏰ Время сервера: ${result.rows[0].current_time}`);
      console.log(`   🗄️  Версия PostgreSQL: ${result.rows[0].postgres_version.split(' ')[0]}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 🚀 Запуск если скрипт вызван напрямую
if (import.meta.main) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'test') {
    testConnection();
  } else {
    setupVibeCodingDatabase();
  }
}

export { setupVibeCodingDatabase, testConnection };
