#!/bin/bash

# 🚀 Bible VibeCoder - Запуск с переменными окружения
# Этот скрипт правильно загружает .env и передает переменные в процессы

set -e

# Функция для вывода времени
timestamp() {
  echo "[$(date '+%H:%M:%S')]"
}

echo "🕉️ ================================="
echo "📖 BIBLE VIBECODER STARTUP"
echo "🕉️ ================================="

# Загружаем .env файл
if [ -f .env ]; then
  echo "$(timestamp) 📄 Загружаем .env файл..."
  export $(cat .env | grep -v '^#' | xargs)
  echo "$(timestamp) ✅ Переменные окружения загружены"
else
  echo "$(timestamp) ❌ .env файл не найден!"
  exit 1
fi

# Проверяем обязательные переменные
echo "$(timestamp) 🔍 Проверяем обязательные переменные..."

if [ -z "$BOT_TOKEN" ]; then
  echo "$(timestamp) ❌ BOT_TOKEN не найден в .env"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "$(timestamp) ❌ OPENAI_API_KEY не найден в .env"
  exit 1
fi

echo "$(timestamp) ✅ Все обязательные переменные найдены"

# Устанавливаем дополнительные переменные
export NODE_ENV=development
export HTTP_SERVER_PORT=7103
export TELEGRAM_BOT_PORT=7100
export INNGEST_DEV_SERVER_URL=http://localhost:8288

# Проверяем Inngest Dev Server
echo "$(timestamp) 🔍 Проверяем Inngest Dev Server на порту 8288..."
if lsof -i :8288 >/dev/null 2>&1; then
  echo "$(timestamp) ✅ Inngest Dev Server уже запущен на порту 8288"
  echo "$(timestamp)     🎛️ Подключаемся к существующему серверу"
  echo "$(timestamp)     📊 Дашборд: http://localhost:8288"
else
  echo "$(timestamp) ❌ Inngest Dev Server не найден на порту 8288"
  echo "$(timestamp) 🚀 Запускаем Inngest Dev Server..."
  npx inngest-cli@latest dev &
  INNGEST_PID=$!
  echo "$(timestamp) ⏳ Ждем запуска Inngest (PID: $INNGEST_PID)..."
  sleep 10
fi

# Очищаем старые процессы Bible VibeCoder
echo "$(timestamp) 🧹 Очищаем старые процессы Bible VibeCoder..."
pkill -f "bun.*server.ts" 2>/dev/null || true
pkill -f "bun.*bot.ts" 2>/dev/null || true
sleep 2

# Запускаем сервисы с переменными окружения
echo "$(timestamp) 🚀 Запускаем Bible VibeCoder сервисы..."

# Экспортируем все переменные для дочерних процессов
export BOT_TOKEN
export OPENAI_API_KEY
export NODE_ENV
export HTTP_SERVER_PORT
export TELEGRAM_BOT_PORT
export INNGEST_DEV_SERVER_URL

echo "$(timestamp) 📊 Переменные окружения:"
echo "$(timestamp)   BOT_TOKEN: ${BOT_TOKEN:0:20}..."
echo "$(timestamp)   OPENAI_API_KEY: ${OPENAI_API_KEY:0:20}..."
echo "$(timestamp)   NODE_ENV: $NODE_ENV"
echo "$(timestamp)   HTTP_SERVER_PORT: $HTTP_SERVER_PORT"
echo "$(timestamp)   INNGEST_DEV_SERVER_URL: $INNGEST_DEV_SERVER_URL"

# Запускаем HTTP сервер в фоне
echo "$(timestamp) 🌐 Запускаем HTTP Server..."
bun run src/server.ts &
SERVER_PID=$!

# Даем серверу время запуститься
sleep 5

# Проверяем что сервер запустился
if curl -s http://localhost:$HTTP_SERVER_PORT/health >/dev/null; then
  echo "$(timestamp) ✅ HTTP Server запущен (PID: $SERVER_PID)"
else
  echo "$(timestamp) ❌ HTTP Server не запустился"
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

# Показываем финальную информацию
echo "$(timestamp) === СЕРВИСЫ ЗАПУЩЕНЫ ==="
echo "$(timestamp) 📍 HTTP Server: http://localhost:$HTTP_SERVER_PORT"
echo "$(timestamp) 🏥 Health Check: http://localhost:$HTTP_SERVER_PORT/health"
echo "$(timestamp) 🔄 Inngest API: http://localhost:$HTTP_SERVER_PORT/api/inngest"
echo "$(timestamp) 🎛️  Inngest Dashboard: http://localhost:8288"
echo "$(timestamp) 🤖 Telegram Bot: активен (встроен в HTTP Server)"
echo "$(timestamp) =========================="

# Функция очистки при выходе
cleanup() {
  echo "$(timestamp) 🛑 Получен сигнал завершения..."
  echo "$(timestamp) 🧹 Завершаем процессы Bible VibeCoder..."
  kill $SERVER_PID 2>/dev/null || true
  # НЕ убиваем Inngest - он общий для всех агентов
  echo "$(timestamp) ✅ Очистка завершена"
  exit 0
}

# Устанавливаем обработчики сигналов
trap cleanup SIGINT SIGTERM

# Ждем завершения
echo "$(timestamp) 💡 Для остановки нажмите Ctrl+C"
echo "$(timestamp) 📊 Мониторинг логов: tail -f logs/*.log"

# Мониторинг статуса каждые 30 секунд
while true; do
  sleep 30
  if curl -s http://localhost:$HTTP_SERVER_PORT/health >/dev/null; then
    echo "$(timestamp) 📊 Статус: ✅ HTTP Server работает"
  else
    echo "$(timestamp) 📊 Статус: ❌ HTTP Server не отвечает"
  fi
  
  if curl -s http://localhost:8288 >/dev/null; then
    echo "$(timestamp) 📊 Статус: ✅ Inngest работает"
  else
    echo "$(timestamp) 📊 Статус: ❌ Inngest не отвечает"
  fi
done 