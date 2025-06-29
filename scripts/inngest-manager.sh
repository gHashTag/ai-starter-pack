#!/bin/bash

# 🎛️ INNGEST DEV SERVER MANAGER - СВЯЩЕННЫЕ ПРАВИЛА ДЛЯ ВСЕХ АГЕНТОВ
# Этот скрипт обеспечивает единый Inngest Dev Server для всех агентов

INNGEST_PORT=8288
INNGEST_URL="http://localhost:$INNGEST_PORT"

# Функция добавления timestamp
timestamp() {
    date +'[%H:%M:%S]'
}

# Функция проверки сервера
check_inngest_server() {
    curl -s "$INNGEST_URL" > /dev/null 2>&1
    return $?
}

# Функция запуска сервера
start_inngest_server() {
    echo "$(timestamp) 🚀 Запускаем новый Inngest Dev Server на порту $INNGEST_PORT..."
    npx inngest-cli@latest dev --port $INNGEST_PORT > /dev/null 2>&1 &
    
    # Ждем запуска
    for i in {1..10}; do
        if check_inngest_server; then
            echo "$(timestamp) ✅ Inngest Dev Server запущен успешно"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    echo "$(timestamp) ❌ Не удалось запустить Inngest Dev Server"
    return 1
}

# Функция подключения приложения
sync_app_to_inngest() {
    local app_url="$1"
    local app_name="$2"
    
    if [ -z "$app_url" ]; then
        echo "$(timestamp) ⚠️  URL приложения не указан для синхронизации"
        return 1
    fi
    
    echo "$(timestamp) 🔌 Синхронизация $app_name с Inngest..."
    echo "$(timestamp) 📍 URL: $app_url"
    
    # Проверяем что endpoint приложения отвечает
    if curl -s "$app_url" > /dev/null 2>&1; then
        echo "$(timestamp) ✅ Endpoint приложения отвечает"
        
        # Принудительная синхронизация через PUT запрос к нашему endpoint
        local sync_response=$(curl -s -X PUT "$app_url" 2>/dev/null)
        if echo "$sync_response" | grep -q "function_count"; then
            local func_count=$(echo "$sync_response" | grep -o '"function_count":[0-9]*' | cut -d':' -f2)
            echo "$(timestamp) ✅ $app_name синхронизирован с Inngest ($func_count функций)"
        else
            echo "$(timestamp) ⚠️  Синхронизация $app_name (автодискавери может занять время)"
        fi
    else
        echo "$(timestamp) ❌ Endpoint приложения не отвечает: $app_url"
        return 1
    fi
}

# Основная логика
echo "$(timestamp) 🔍 Проверка Inngest Dev Server на порту $INNGEST_PORT..."

if check_inngest_server; then
    echo "$(timestamp) ✅ Inngest Dev Server уже запущен на $INNGEST_URL"
    echo "$(timestamp)     🎛️ Dashboard: $INNGEST_URL"
    echo "$(timestamp)     🤖 Подключаемся к существующему серверу"
else
    if start_inngest_server; then
        echo "$(timestamp) 🎉 Новый Inngest Dev Server готов!"
    else
        echo "$(timestamp) ❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось запустить Inngest Dev Server"
        exit 1
    fi
fi

# Экспортируем переменную окружения
export INNGEST_DEV_SERVER_URL=$INNGEST_URL
echo "$(timestamp) 🔧 INNGEST_DEV_SERVER_URL=$INNGEST_DEV_SERVER_URL"

# Функция для использования в других скриптах
# Использование: source ./scripts/inngest-manager.sh && sync_app "http://localhost:7103/api/inngest" "bible-vibecoder"
if [ "$1" = "sync" ] && [ -n "$2" ] && [ -n "$3" ]; then
    sync_app_to_inngest "$2" "$3"
fi 