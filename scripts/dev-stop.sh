#!/bin/bash

# 🕉️ УМНЫЙ СТОППЕР BIBLE VIBECODER - Development Stopper
# Останавливает ТОЛЬКО процессы Bible VibeCoder, НЕ ТРОГАЯ другие агенты

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🕉️ УМНЫЙ СТОППЕР BIBLE VIBECODER${NC}"
echo -e "${PURPLE}================================================${NC}"
echo -e "${RED}🚫 СВЯЩЕННОЕ ПРАВИЛО: НЕ ТРОГАТЬ ЧУЖИЕ ПОРТЫ!${NC}"
echo -e "${RED}🛡️  ОСТАНАВЛИВАЕМ ТОЛЬКО BIBLE VIBECODER!${NC}"
echo -e "${YELLOW}⚠️  ЗАЩИЩЕНО ${#PROTECTED_PORTS[@]} ПОРТОВ ДРУГИХ АГЕНТОВ${NC}"
echo -e "${GREEN}✅ НАШИ ПОРТЫ: 7100, 7103, 8288, 8289${NC}"
echo -e "${RED}💀 ВСЕ ОСТАЛЬНЫЕ ПОРТЫ - НЕПРИКОСНОВЕННЫ!${NC}"
echo -e "${PURPLE}================================================${NC}"

# Наши порты для Bible VibeCoder (редкие порты для избежания конфликтов)
BIBLE_TELEGRAM_PORT=7100
BIBLE_HTTP_PORT=7103
BIBLE_INNGEST_PORT=8288
BIBLE_INNGEST_GATEWAY_PORT=8289

# 🛡️ СПИСОК ПОРТОВ ДРУГИХ АГЕНТОВ (НЕ ТРОГАТЬ НИ В КОЕМ СЛУЧАЕ!)
# ⚠️  ДОБАВЛЯЕМ ВСЕ ВОЗМОЖНЫЕ ПОРТЫ ДРУГИХ АГЕНТОВ
PROTECTED_PORTS=(
    "8080:999-multibots-telegraf"
    "8081:Agent-System"
    "8082:Other-Agent"
    "8083:Other-Agent"
    "8084:Other-Agent"
    "8085:Other-Agent"
    "8086:Other-Agent"
    "8087:Other-Agent"
    "8088:Other-Agent"
    "8089:Other-Agent"
    "3001:Other-Telegram-Bot"
    "3002:Other-Telegram-Bot"
    "3003:Other-Telegram-Bot"
    "3004:Other-Telegram-Bot"
    "3005:Other-Telegram-Bot"
    "4001:Other-HTTP-Server"
    "4002:Other-HTTP-Server"
    "4003:Other-HTTP-Server"
    "4004:Other-HTTP-Server"
    "4005:Other-HTTP-Server"
    "8288:External-Inngest-Server"
    "8289:External-Inngest-Gateway"
    "8290:External-Inngest-Service"
    "8291:External-Inngest-Service"
    "8292:External-Inngest-Service"
    "9000:Other-Service"
    "9001:Other-Service"
    "9002:Other-Service"
    "9003:Other-Service"
    "9004:Other-Service"
    "9005:Other-Service"
    "5000:Other-Web-Server"
    "5001:Other-Web-Server"
    "5002:Other-Web-Server"
    "6000:Other-Service"
    "6001:Other-Service"
    "6002:Other-Service"
    "1337:Other-Service"
    "1338:Other-Service"
    "1339:Other-Service"
    "2000:Other-Service"
    "2001:Other-Service"
    "2002:Other-Service"
    "8000:Other-Service"
    "8001:Other-Service"
    "8002:Other-Service"
    "8003:Other-Service"
    "8004:Other-Service"
    "8005:Other-Service"
    "8006:Other-Service"
    "8007:Other-Service"
    "8008:Other-Service"
    "8009:Other-Service"
    "8010:Other-Service"
    "8011:Other-Service"
    "8012:Other-Service"
    "8013:Other-Service"
    "8014:Other-Service"
    "8015:Other-Service"
    "8016:Other-Service"
    "8017:Other-Service"
    "8018:Other-Service"
    "8019:Other-Service"
    "8020:Other-Service"
    "8021:Other-Service"
    "8022:Other-Service"
    "8023:Other-Service"
    "8024:Other-Service"
    "8025:Other-Service"
    "8026:Other-Service"
    "8027:Other-Service"
    "8028:Other-Service"
    "8029:Other-Service"
    "8030:Other-Service"
    "8031:Other-Service"
    "8032:Other-Service"
    "8033:Other-Service"
    "8034:Other-Service"
    "8035:Other-Service"
    "8036:Other-Service"
    "8037:Other-Service"
    "8038:Other-Service"
    "8039:Other-Service"
    "8040:Other-Service"
    "8041:Other-Service"
    "8042:Other-Service"
    "8043:Other-Service"
    "8044:Other-Service"
    "8045:Other-Service"
    "8046:Other-Service"
    "8047:Other-Service"
    "8048:Other-Service"
    "8049:Other-Service"
    "8050:Other-Service"
    "8293:Other-Service"
    "8294:Other-Service"
    "8295:Other-Service"
    "8296:Other-Service"
    "8297:Other-Service"
    "8298:Other-Service"
    "8299:Other-Service"
)

# Функция для проверки, является ли порт защищённым
is_protected_port() {
    local port=$1
    for protected in "${PROTECTED_PORTS[@]}"; do
        local protected_port=$(echo $protected | cut -d: -f1)
        if [[ "$port" == "$protected_port" ]]; then
            local agent_name=$(echo $protected | cut -d: -f2)
            echo "$agent_name"
            return 0
        fi
    done
    return 1
}

# Функция для умной остановки процесса на порту
smart_port_stop() {
    local port=$1
    local service_name=$2
    
    echo -e "${BLUE}🔍 Проверка порта $port ($service_name)...${NC}"
    
    if lsof -i :$port > /dev/null 2>&1; then
        # Порт занят - определяем кем
        local process_info=$(lsof -i :$port | tail -n +2)
        local process_name=$(echo "$process_info" | awk '{print $1}' | head -1)
        local pid=$(echo "$process_info" | awk '{print $2}' | head -1)
        
        # Проверяем, не защищённый ли это порт
        local agent_name=$(is_protected_port $port)
        if [[ $? -eq 0 ]]; then
            echo -e "${RED}🛡️  ЗАЩИЩЁННЫЙ ПОРТ: $port используется агентом $agent_name${NC}"
            echo -e "${GREEN}✅ Пропускаем (защищён от остановки)${NC}"
            return 0
        fi
        
        # Проверяем, наш ли это процесс
        if [[ "$process_name" == *"bible_vibecoder"* ]] || [[ "$process_name" == *"node"* ]]; then
            # Проверяем командную строку процесса
            local cmdline=$(ps -p $pid -o args= 2>/dev/null || echo "")
            if [[ "$cmdline" == *"bible_vibecoder"* ]] || [[ "$cmdline" == *"bot.ts"* ]] || [[ "$cmdline" == *"server.ts"* ]]; then
                echo -e "${YELLOW}🔄 Останавливаю процесс Bible VibeCoder (PID: $pid)...${NC}"
                kill $pid 2>/dev/null || true
                sleep 2
                
                # Проверяем, остановился ли процесс
                if lsof -i :$port > /dev/null 2>&1; then
                    echo -e "${RED}💀 Принудительная остановка процесса...${NC}"
                    kill -9 $pid 2>/dev/null || true
                    sleep 1
                fi
                
                if lsof -i :$port > /dev/null 2>&1; then
                    echo -e "${RED}❌ Не удалось остановить процесс на порту $port${NC}"
                    return 1
                else
                    echo -e "${GREEN}✅ Процесс Bible VibeCoder остановлен${NC}"
                    return 0
                fi
            else
                echo -e "${YELLOW}⚠️  Порт $port занят ДРУГИМ процессом: $process_name${NC}"
                echo -e "${GREEN}✅ Пропускаем (не наш процесс)${NC}"
                return 0
            fi
        else
            echo -e "${YELLOW}⚠️  Порт $port занят процессом: $process_name${NC}"
            echo -e "${GREEN}✅ Пропускаем (не наш процесс)${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ Порт $port свободен${NC}"
        return 0
    fi
}

echo -e "${BLUE}🔍 ФАЗА 1: ПРОВЕРКА ЗАЩИЩЁННЫХ АГЕНТОВ${NC}"

# Показываем информацию о защищённых портах
echo -e "${CYAN}🛡️  Защищённые порты других агентов (НЕ ТРОГАЕМ):${NC}"
for protected in "${PROTECTED_PORTS[@]}"; do
    port=$(echo $protected | cut -d: -f1)
    agent=$(echo $protected | cut -d: -f2)
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Порт $port: $agent (активен, защищён)${NC}"
    else
        echo -e "  ${YELLOW}⭕ Порт $port: $agent (не активен)${NC}"
    fi
done

echo -e "\n${BLUE}🛑 ФАЗА 2: ОСТАНОВКА PM2 ПРОЦЕССОВ BIBLE VIBECODER${NC}"

# Останавливаем только наши PM2 процессы
echo -e "${YELLOW}🔄 Остановка PM2 процессов Bible VibeCoder...${NC}"
# telegram-bot отключен - бот запускается внутри http-server
pm2 delete http-server 2>/dev/null && echo -e "${GREEN}✅ http-server остановлен${NC}" || echo -e "${YELLOW}⭕ http-server не найден${NC}"
pm2 delete inngest-dev 2>/dev/null && echo -e "${GREEN}✅ inngest-dev остановлен${NC}" || echo -e "${YELLOW}⭕ inngest-dev не найден${NC}"

echo -e "\n${BLUE}🔍 ФАЗА 3: УМНАЯ ОСТАНОВКА ПРОЦЕССОВ НА ПОРТАХ${NC}"

# Умная остановка процессов на наших портах
smart_port_stop $BIBLE_TELEGRAM_PORT "Telegram Bot"
smart_port_stop $BIBLE_HTTP_PORT "HTTP Server"
smart_port_stop $BIBLE_INNGEST_PORT "Inngest Dev Server"
smart_port_stop $BIBLE_INNGEST_GATEWAY_PORT "Inngest Connect Gateway"

echo -e "\n${BLUE}🧹 ФАЗА 4: ОЧИСТКА ПРОЦЕССОВ BIBLE VIBECODER${NC}"

# Ищем и останавливаем только наши Node.js процессы
echo -e "${YELLOW}🔍 Поиск процессов Bible VibeCoder...${NC}"
our_pids=$(pgrep -f "bible_vibecoder" 2>/dev/null || true)
if [[ -n "$our_pids" ]]; then
    echo -e "${YELLOW}🔄 Остановка процессов Bible VibeCoder: $our_pids${NC}"
    kill $our_pids 2>/dev/null || true
    sleep 2
    
    # Принудительная остановка выживших
    surviving_pids=$(pgrep -f "bible_vibecoder" 2>/dev/null || true)
    if [[ -n "$surviving_pids" ]]; then
        echo -e "${RED}💀 Принудительная остановка: $surviving_pids${NC}"
        kill -9 $surviving_pids 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Процессы Bible VibeCoder остановлены${NC}"
else
    echo -e "${GREEN}✅ Процессы Bible VibeCoder не найдены${NC}"
fi

echo -e "\n${BLUE}🔍 ФАЗА 5: ФИНАЛЬНАЯ ПРОВЕРКА${NC}"

# Финальная проверка наших портов
echo -e "${BLUE}🔍 Проверка освобождения портов Bible VibeCoder...${NC}"
all_clear=true
for port in $BIBLE_TELEGRAM_PORT $BIBLE_HTTP_PORT $BIBLE_INNGEST_PORT $BIBLE_INNGEST_GATEWAY_PORT; do
    if lsof -i :$port > /dev/null 2>&1; then
        # Проверяем, не защищённый ли это порт
        agent_name=$(is_protected_port $port)
        if [[ $? -eq 0 ]]; then
            echo -e "${GREEN}✅ Порт $port: защищён ($agent_name)${NC}"
        else
            process_info=$(lsof -i :$port | tail -n +2)
            process_name=$(echo "$process_info" | awk '{print $1}' | head -1)
            cmdline=$(ps -p $(echo "$process_info" | awk '{print $2}' | head -1) -o args= 2>/dev/null || echo "")
            
            if [[ "$cmdline" == *"bible_vibecoder"* ]]; then
                echo -e "${RED}❌ Порт $port: остался процесс Bible VibeCoder${NC}"
                all_clear=false
            else
                echo -e "${GREEN}✅ Порт $port: занят другим процессом (не трогаем)${NC}"
            fi
        fi
    else
        echo -e "${GREEN}✅ Порт $port: свободен${NC}"
    fi
done

# Проверяем PM2
echo -e "${BLUE}🔍 Проверка PM2 процессов Bible VibeCoder...${NC}"
pm2_status=$(pm2 status 2>/dev/null | grep -E "(telegram-bot|http-server|inngest-dev)" || echo "")
if [[ -n "$pm2_status" ]]; then
    echo -e "${RED}❌ ВНИМАНИЕ: Остались PM2 процессы Bible VibeCoder!${NC}"
    echo "$pm2_status"
    all_clear=false
else
    echo -e "${GREEN}✅ PM2 процессы Bible VibeCoder полностью остановлены${NC}"
fi

echo -e "\n${PURPLE}================================================${NC}"
if [[ "$all_clear" == true ]]; then
    echo -e "${GREEN}✅ BIBLE VIBECODER ПОЛНОСТЬЮ ОСТАНОВЛЕН!${NC}"
    echo -e "${GREEN}🛡️  Другие агенты не затронуты и продолжают работать${NC}"
else
    echo -e "${YELLOW}⚠️ ЧАСТИЧНАЯ ОСТАНОВКА: Некоторые процессы могли остаться${NC}"
    echo -e "${YELLOW}💡 Проверьте вручную или перезапустите терминал${NC}"
fi
echo -e "${PURPLE}================================================${NC}"

echo -e "\n${CYAN}📝 Полезные команды для проверки:${NC}"
echo -e "  ${YELLOW}lsof -i :$BIBLE_TELEGRAM_PORT${NC}  - Проверить Telegram Bot"
echo -e "  ${YELLOW}lsof -i :$BIBLE_HTTP_PORT${NC}      - Проверить HTTP Server"
echo -e "  ${YELLOW}lsof -i :$BIBLE_INNGEST_PORT${NC}   - Проверить Inngest"
echo -e "  ${YELLOW}pm2 status${NC}                      - Проверить PM2"
echo -e "  ${YELLOW}ps aux | grep bible_vibecoder${NC}   - Найти процессы Bible VibeCoder"

echo -e "\n${GREEN}🚀 Для запуска: ${YELLOW}bash scripts/dev-start.sh${NC}"

echo -e "\n${BLUE}🛡️  СТАТУС ДРУГИХ АГЕНТОВ:${NC}"
for protected in "${PROTECTED_PORTS[@]}"; do
    port=$(echo $protected | cut -d: -f1)
    agent=$(echo $protected | cut -d: -f2)
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $agent продолжает работать на порту $port${NC}"
    fi
done
