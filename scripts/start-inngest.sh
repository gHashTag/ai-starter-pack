#!/bin/bash

# Скрипт для запуска Inngest Dev Server с кастомными портами
# Использует переменные окружения из .env файла

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🕉️ Запуск Inngest Dev Server с кастомными портами...${NC}"

# Загрузка переменных окружения из .env файла
if [[ -f .env ]]; then
    echo -e "${GREEN}📄 Загрузка .env файла...${NC}"
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${YELLOW}⚠️ .env файл не найден. Используются значения по умолчанию.${NC}"
fi

# Установка портов по умолчанию если не заданы
INNGEST_DEV_PORT=${INNGEST_DEV_PORT:-9288}
INNGEST_CONNECT_PORT=${INNGEST_CONNECT_PORT:-9289}

echo -e "${GREEN}🔧 Конфигурация портов:${NC}"
echo -e "  Dev Server: ${BLUE}$INNGEST_DEV_PORT${NC}"
echo -e "  Connect Gateway: ${BLUE}$INNGEST_CONNECT_PORT${NC}"

# Проверка доступности портов
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${RED}❌ Порт $port уже используется!${NC}"
        echo -e "${YELLOW}🔍 Процессы на порту $port:${NC}"
        lsof -i :$port
        echo -e "${YELLOW}💡 Используйте 'kill -9 <PID>' для завершения процесса${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Порт $port свободен${NC}"
        return 0
    fi
}

echo -e "${BLUE}🔍 Проверка доступности портов...${NC}"
check_port $INNGEST_DEV_PORT || exit 1
check_port $INNGEST_CONNECT_PORT || exit 1

# Создание директории для логов если не существует
mkdir -p logs

# Запуск Inngest Dev Server с кастомными портами
echo -e "${GREEN}🚀 Запуск Inngest Dev Server...${NC}"
echo -e "${BLUE}📊 Dashboard будет доступен на: http://localhost:$INNGEST_DEV_PORT${NC}"
echo -e "${BLUE}🔗 Connect Gateway: http://localhost:$INNGEST_CONNECT_PORT${NC}"
echo -e "${YELLOW}💡 Для остановки используйте Ctrl+C${NC}"

# Экспорт переменных для передачи в Inngest CLI
export INNGEST_DEV_PORT
export INNGEST_CONNECT_PORT

# Запуск с логированием
npx inngest-cli dev \
  --port $INNGEST_DEV_PORT \
  --connect-gateway-port $INNGEST_CONNECT_PORT \
  --log-level debug \
  2>&1 | tee logs/inngest-dev-$(date +%Y%m%d-%H%M%S).log
