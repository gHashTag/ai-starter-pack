# Используем Bun официальный образ
FROM oven/bun:latest

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json bun.lock ./

# Копируем исходный код
COPY . .

# Устанавливаем зависимости и собираем проект
# Скрипт prepare автоматически запустит build:full
RUN bun install --frozen-lockfile

# Устанавливаем переменную окружения
ENV NODE_ENV=production

# Открываем порт (Railway автоматически назначит PORT)
EXPOSE $PORT

# Запускаем приложение через правильную команду
CMD ["node", "dist/index.js"]
