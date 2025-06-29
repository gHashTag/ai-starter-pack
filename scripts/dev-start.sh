#!/bin/bash

# 🛡️ УМНЫЙ ЗАЩИТНИК СОЮЗНИКОВ - Bible VibeCoder Development Starter
#
# ⚠️  СВЯЩЕННЫЕ ПРАВИЛА:
#
# 1. 🚫 НИКОГДА НЕ ТРОГАТЬ ЧУЖИЕ ПОРТЫ!
#    ТОЛЬКО НАШИ ПОРТЫ: 7100, 7103, 8288, 8289
#    ЗАЩИЩЕННЫЕ ПОРТЫ ДРУГИХ АГЕНТОВ: 8080, 8081, 8082, 3001, 4001, 9000, 9001...
#
# 2. 🔄 INNGEST DEV SERVER ЗАПУСКАЕТСЯ ТОЛЬКО ОДИН РАЗ!
#    - Если порт 8288 уже занят - используем существующий
#    - НЕ ЗАПУСКАЕМ второй экземпляр - это вызовет конфликт портов
#    - Можно запустить Inngest отдельно: inngest dev --port 8288
#    - Один Inngest может обслуживать несколько проектов
#

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 🛡️ ЗАЩИЩЕННЫЕ ПОРТЫ ДРУГИХ АГЕНТОВ - НЕ ТРОГАТЬ НИ В КОЕМ СЛУЧАЕ!
# ⚠️  ДОБАВЛЯЕМ ВСЕ ВОЗМОЖНЫЕ ПОРТЫ ДРУГИХ АГЕНТОВ
PROTECTED_PORTS=(8080 8081 8082 8083 8084 8085 8086 8087 8088 8089 3001 3002 3003 3004 3005 4001 4002 4003 4004 4005 9000 9001 9002 9003 9004 9005 5000 5001 5002 6000 6001 6002 1337 1338 1339 2000 2001 2002 8000 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011 8012 8013 8014 8015 8016 8017 8018 8019 8020 8021 8022 8023 8024 8025 8026 8027 8028 8029 8030 8031 8032 8033 8034 8035 8036 8037 8038 8039 8040 8041 8042 8043 8044 8045 8046 8047 8048 8049 8050 8288 8289 8290 8291 8292 8293 8294 8295 8296 8297 8298 8299)
# ТОЛЬКО НАШИ ПОРТЫ - ТОЛЬКО ИХ МОЖНО УБИВАТЬ!
OUR_PORTS=(7100 7103 8288 8289)

# Функция для красивого времени
timestamp() {
    date "+[%H:%M:%S]"
}

echo -e "${PURPLE}🚀 Запуск Bible VibeCoder в dev режиме...${NC}"
echo "$(timestamp) Проверяем доступность портов..."
echo "$(timestamp) Переменные окружения:"
echo "$(timestamp)   TELEGRAM_BOT_PORT: 7100"
echo "$(timestamp)   HTTP_SERVER_PORT: 7103" 
echo "$(timestamp)   NODE_ENV: ${NODE_ENV:-development}"
echo "$(timestamp)   INNGEST_DEV_SERVER_URL: http://localhost:8288"

# Функция для проверки защищенных портов
check_protected_port() {
    local port=$1
    for protected in "${PROTECTED_PORTS[@]}"; do
        if [[ "$port" == "$protected" ]]; then
            return 0  # порт защищен
        fi
    done
    return 1  # порт не защищен
}

# Функция для БЕЗОПАСНОГО убийства процессов на порту
safe_kill_port() {
    local port=$1
    local service_name=$2
    
    # ТРОЙНАЯ ПРОВЕРКА ЗАЩИТЫ!
    # 1. Проверяем, не защищен ли порт
    if check_protected_port "$port"; then
        echo -e "${YELLOW}🛡️  Порт $port ЗАЩИЩЕН ($service_name) - НЕ ТРОГАЕМ!${NC}"
        return 0
    fi
    
    # 2. Проверяем, что это действительно НАШ порт
    local is_our_port=false
    for our_port in "${OUR_PORTS[@]}"; do
        if [[ "$port" == "$our_port" ]]; then
            is_our_port=true
            break
        fi
    done
    
    if [[ "$is_our_port" == false ]]; then
        echo -e "${RED}🚫 ОШИБКА: Порт $port НЕ НАШ! НЕ ТРОГАЕМ!${NC}"
        return 0
    fi
    
    # 3. Дополнительная проверка - убеждаемся что порт не в списке защищенных
    for protected in "${PROTECTED_PORTS[@]}"; do
        if [[ "$port" == "$protected" ]]; then
            echo -e "${RED}🚫 КРИТИЧЕСКАЯ ОШИБКА: Порт $port В СПИСКЕ ЗАЩИЩЕННЫХ! НЕ ТРОГАЕМ!${NC}"
            return 0
        fi
    done
    
    # Убиваем процессы на нашем порту $port
    
    # Получаем PID процессов на порту
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    
    if [[ -n "$pids" ]]; then
        echo -e "${RED}💀 Найдены процессы: $pids${NC}"
        # Убиваем мягко
        kill $pids 2>/dev/null || true
        sleep 2
        
        # Проверяем, остались ли живые процессы
        local surviving_pids=$(lsof -ti :$port 2>/dev/null || true)
        if [[ -n "$surviving_pids" ]]; then
            echo -e "${RED}💀💀 ПРИНУДИТЕЛЬНОЕ УБИЙСТВО: $surviving_pids${NC}"
            kill -9 $surviving_pids 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✅ Порт $port очищен${NC}"
    else
        echo -e "${GREEN}✅ Порт $port уже свободен${NC}"
    fi
}

# Функция для убийства процессов по имени (только Bible VibeCoder)
safe_kill_by_name() {
    local process_name=$1
    # Убиваем процессы Bible VibeCoder: $process_name
    
    local pids=$(pgrep -f "$process_name" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
        # Дополнительная проверка - убиваем только если процесс содержит "bible_vibecoder"
        local filtered_pids=""
        for pid in $pids; do
            local cmd=$(ps -p $pid -o command= 2>/dev/null || true)
            if [[ "$cmd" == *"bible_vibecoder"* ]] || [[ "$cmd" == *"$PWD"* ]]; then
                filtered_pids="$filtered_pids $pid"
            fi
        done
        
        if [[ -n "$filtered_pids" ]]; then
            echo -e "${RED}💀 Найдены НАШИ процессы: $filtered_pids${NC}"
            kill $filtered_pids 2>/dev/null || true
            sleep 2
            
            # Принудительное убийство выживших
            for pid in $filtered_pids; do
                if kill -0 $pid 2>/dev/null; then
                    echo -e "${RED}💀💀 ПРИНУДИТЕЛЬНОЕ УБИЙСТВО: $pid${NC}"
                    kill -9 $pid 2>/dev/null || true
                fi
            done
            echo -e "${GREEN}✅ Процессы $process_name убиты${NC}"
        else
            echo -e "${YELLOW}⚠️  Процессы $process_name принадлежат другим проектам - НЕ ТРОГАЕМ!${NC}"
        fi
    else
        echo -e "${GREEN}✅ Процессы $process_name не найдены${NC}"
    fi
}

echo "$(timestamp) Проверка общего Inngest Dev Server на порту 8288..."

# 🎯 СВЯЩЕННЫЕ ПРАВИЛА INNGEST DEV SERVER
# ОДИН СЕРВЕР = ОДИН ПОРТ = ВСЕ ПРИЛОЖЕНИЯ ПОДКЛЮЧЕНЫ
if curl -s http://localhost:8288 > /dev/null 2>&1; then
    echo "$(timestamp) ✅ Inngest Dev Server уже запущен на порту 8288"
    echo "$(timestamp)     🎛️ Подключаемся к существующему серверу"
    echo "$(timestamp)     📊 Дашборд: http://localhost:8288"
    INNGEST_RUNNING=true
else
    echo "$(timestamp) 🚀 Запускаем новый Inngest Dev Server на стандартном порту 8288..."
    echo "$(timestamp)     🎯 ЕДИНЫЙ сервер для ВСЕХ агентов"
    INNGEST_RUNNING=false
fi

echo "$(timestamp) Зачистка старых процессов Bible VibeCoder..."

# Очищаем старые логи PM2 (убираем старые ошибки 409)
pm2 flush 2>/dev/null || true

# Убиваем ТОЛЬКО наши процессы
pm2 delete http-server 2>/dev/null || true
pm2 delete inngest-dev 2>/dev/null || true

# Убиваем процессы ТОЛЬКО на наших портах (кроме общего Inngest!)
safe_kill_port 7100 "Telegram Bot"
safe_kill_port 7103 "HTTP Server"

# 🎯 СВЯЩЕННОЕ ПРАВИЛО: НЕ ТРОГАЕМ ОБЩИЙ INNGEST DEV SERVER!
# Проверяем, запущен ли уже Inngest, и НЕ убиваем его если он общий
if [[ "$INNGEST_RUNNING" == false ]]; then
    echo "$(timestamp) 🔄 Очищаем порт 8288 для нового Inngest сервера..."
    safe_kill_port 8288 "Inngest Dev Server"
    safe_kill_port 8289 "Inngest Connect Gateway"
else
    echo "$(timestamp) 🛡️  НЕ трогаем существующий Inngest Dev Server на 8288"
fi

# УБИВАЕМ ТОЛЬКО СВОИ BIBLE VIBECODER БОТЫ
echo -e "${RED}🔫 УБИВАЮ ТОЛЬКО BIBLE VIBECODER БОТЫ...${NC}"
pkill -f "bible_vibecoder.*bot" 2>/dev/null || true
pkill -f "bible_vibecoder.*server" 2>/dev/null || true
# Убиваем процессы только из ЭТОЙ директории
pkill -f "$(pwd)" 2>/dev/null || true

# Убиваем ТОЛЬКО наши Node.js процессы
safe_kill_by_name "node.*bot.ts"
safe_kill_by_name "node.*server.ts"
safe_kill_by_name "telegraf"

# 4. Проверяем ТОЛЬКО наши порты (остальные нас не касаются)
echo -e "${BLUE}🔍 Проверка НАШИХ портов:${NC}"
for port in "${OUR_PORTS[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        service_info=$(lsof -i :$port | tail -1 | awk '{print $1}')
        echo -e "${RED}❌ НАШ порт $port еще занят: $service_info${NC}"
    else
        echo -e "${GREEN}✅ НАШ порт $port свободен${NC}"
    fi
done

echo -e "${GREEN}✅ Зачистка завершена${NC}"

echo -e "${BLUE}🚀 Запуск сервисов...${NC}"

# Функция для очистки при выходе
cleanup() {
    echo -e "\n$(timestamp) 🛑 Остановка Bible VibeCoder..."
    
    # Останавливаем мониторинг
    if [[ -n "$MONITOR_PID" ]]; then
        kill $MONITOR_PID 2>/dev/null || true
    fi
    
    # Останавливаем HTTP сервер
    if [[ -n "$HTTP_SERVER_PID" ]]; then
        echo "$(timestamp) 🔄 Остановка HTTP Server (PID: $HTTP_SERVER_PID)..."
        kill $HTTP_SERVER_PID 2>/dev/null || true
    fi
    
    # 🎯 СВЯЩЕННОЕ ПРАВИЛО: НЕ ТРОГАЕМ ОБЩИЙ INNGEST!
    # Останавливаем Inngest ТОЛЬКО если мы его запустили
    if [[ "$INNGEST_RUNNING" == false && -n "$INNGEST_PID" ]]; then
        echo "$(timestamp) 🔄 Остановка нашего Inngest Dev Server (PID: $INNGEST_PID)..."
        kill $INNGEST_PID 2>/dev/null || true
    else
        echo "$(timestamp) 🛡️  НЕ трогаем общий Inngest Dev Server - другие агенты его используют"
    fi
    
    # Очищаем только наши порты
    safe_kill_port 7103 "HTTP Server"
    
    echo -e "$(timestamp) ✅ Bible VibeCoder остановлен"
    echo -e "$(timestamp) 🛡️  Другие агенты продолжают работать"
    exit 0
}

# Обработчик сигналов
trap cleanup SIGINT SIGTERM

# Загрузка .env файла
if [[ -f .env ]]; then
    echo -e "${GREEN}📄 Загрузка .env файла...${NC}"
    set -a  # автоматически экспортировать переменные
    source .env
    set +a  # отключить автоэкспорт
else
    echo -e "${YELLOW}⚠️ .env файл не найден${NC}"
fi

# Создание директорий для логов
mkdir -p logs

# Финальная проверка ТОЛЬКО наших портов
echo -e "${BLUE}🔍 Финальная проверка наших портов...${NC}"
for port in "${OUR_PORTS[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${RED}❌ КРИТИЧЕСКАЯ ОШИБКА: Наш порт $port все еще занят!${NC}"
        lsof -i :$port
        echo -e "${RED}💀 ПОВТОРНАЯ ЗАЧИСТКА ПОРТА $port${NC}"
        safe_kill_port $port "Unknown Service"
    fi
done

echo -e "${GREEN}✅ Все наши порты свободны${NC}"

echo -e "${BLUE}🚀 Запуск сервисов через PM2...${NC}"

# 🎛️ СВЯЩЕННЫЕ ПРАВИЛА INNGEST DEV SERVER - ИСПОЛЬЗОВАНИЕ МЕНЕДЖЕРА
echo "$(timestamp) 🎛️ Инициализация Inngest Manager..."

# Запускаем священный Inngest Manager
source ./scripts/inngest-manager.sh

# Экспортируем переменные для нашего приложения
export HTTP_SERVER_PORT=7103

# Запускаем HTTP сервер с правильными переменными
echo "$(timestamp) 🔄 Запускаем HTTP Server..."
HTTP_SERVER_PORT=7103 INNGEST_DEV_SERVER_URL=$INNGEST_DEV_SERVER_URL bun run src/server.ts &
HTTP_SERVER_PID=$!
echo "$(timestamp) HTTP Server запущен (PID: $HTTP_SERVER_PID)"

# Ждем запуска сервисов
echo "$(timestamp) ⏳ Ожидание готовности сервисов..."
sleep 5

# 🎯 АВТОМАТИЧЕСКОЕ ПОДКЛЮЧЕНИЕ К INNGEST
echo "$(timestamp) 🔗 Автоматическое подключение к Inngest Dev Server..."

# Ждем пока HTTP сервер будет готов принимать запросы
for i in {1..10}; do
    if curl -s http://localhost:7103/health > /dev/null 2>&1; then
        echo "$(timestamp) ✅ HTTP Server готов"
        break
    fi
    sleep 1
    echo -n "."
done

# Проверяем что наш endpoint синхронизирован с Inngest
echo "$(timestamp) 🔍 Проверка синхронизации функций..."
if curl -s http://localhost:7103/api/inngest | grep -q "function_count"; then
    FUNCTION_COUNT=$(curl -s http://localhost:7103/api/inngest | grep -o '"function_count":[0-9]*' | cut -d':' -f2)
    echo "$(timestamp) ✅ Bible VibeCoder endpoint работает ($FUNCTION_COUNT функций найдено)"
else
    echo "$(timestamp) ❌ Проблема с endpoint!"
    exit 1
fi

# 🎯 АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ ЧЕРЕЗ СВЯЩЕННЫЙ МЕНЕДЖЕР
echo "$(timestamp) 🔌 Автоматическая синхронизация Bible VibeCoder с Inngest..."

# Используем функцию из священного менеджера для принудительной синхронизации
source ./scripts/inngest-manager.sh sync "http://localhost:7103/api/inngest" "bible-vibecoder"

echo "$(timestamp) Проверка состояния сервисов:"

# Проверка HTTP Server
if curl -s http://localhost:7103/health > /dev/null 2>&1; then
    echo "$(timestamp) ✅ Основной сервер: http://localhost:7103"
else
    echo "$(timestamp) ❌ Основной сервер не отвечает"
fi

# Проверка Inngest
if curl -s http://localhost:8288/health > /dev/null 2>&1; then
    echo "$(timestamp) ✅ Inngest Dev Server: http://localhost:8288"
else
    echo "$(timestamp) ❌ Inngest Dev Server не отвечает"
fi

echo "$(timestamp) === СЕРВИСЫ ЗАПУЩЕНЫ ==="
echo "$(timestamp) 📍 Главная страница: http://localhost:7103"
echo "$(timestamp) 🏥 Health Check: http://localhost:7103/health"
echo "$(timestamp) 🔄 Inngest API: http://localhost:7103/api/inngest"
echo "$(timestamp) 🎛️  Inngest Dashboard: http://localhost:8288 (ОБЩИЙ ДЛЯ ВСЕХ АГЕНТОВ)"
echo "$(timestamp) 🤖 Telegram Bot: активен (polling mode)"
echo "$(timestamp) =========================="
echo "$(timestamp) Для остановки нажмите Ctrl+C"

echo -e "\n${PURPLE}🚀 =================================${NC}"
echo -e "${PURPLE}📖 BIBLE VIBECODER ЗАПУЩЕН!${NC}"
echo -e "${PURPLE}🚀 =================================${NC}"
echo -e "${BLUE}📍 URL: http://localhost:7103${NC}"
echo -e "${BLUE}🏥 Health: http://localhost:7103/health${NC}"
echo -e "${BLUE}🔄 Inngest: http://localhost:7103/api/inngest${NC}"
echo -e "${BLUE}🤖 Telegram: активен (polling mode)${NC}"
echo -e "${BLUE}🎛️  Inngest Dev Dashboard: http://localhost:8288${NC}"
echo -e "${PURPLE}🚀 =================================${NC}"

# Ждем сигнала остановки
echo "$(timestamp) 💡 Для остановки нажмите Ctrl+C"
echo "$(timestamp) 📊 Мониторинг логов: tail -f logs/*.log"

# Функция для отображения статуса
show_status() {
    while true; do
        sleep 30
        echo "$(timestamp) 📊 Статус сервисов:"
        if curl -s http://localhost:7103/health > /dev/null 2>&1; then
            echo "$(timestamp)   ✅ HTTP Server: работает"
        else
            echo "$(timestamp)   ❌ HTTP Server: не отвечает"
        fi
        
        if curl -s http://localhost:8288 > /dev/null 2>&1; then
            echo "$(timestamp)   ✅ Inngest: работает"
        else
            echo "$(timestamp)   ❌ Inngest: не отвечает"
        fi
    done
}

# Запускаем мониторинг в фоне
show_status &
MONITOR_PID=$!

# Ждем сигнала завершения
wait
