FROM oven/bun:latest

WORKDIR /app

# Копируем package.json и фактический lock-файл
COPY package.json bun.lock ./

# СНАЧАЛА копируем все остальные файлы проекта, чтобы скрипт "prepare" (вызывающий build)
# мог найти все необходимые файлы (например, index.ts)
COPY . .

# ТЕПЕРЬ устанавливаем зависимости.
# Скрипт "prepare" в package.json автоматически запустит "bun run build:full",
# поэтому отдельный "RUN bun run build:full" после этого не нужен.
RUN bun install --frozen-lockfile

# Устанавливаем переменную окружения для запуска в режиме production
ENV NODE_ENV=production

# Команда по умолчанию для запуска приложения
# Запускает скомпилированный index.js с помощью Node.js,
# что соответствует скрипту "start" в package.json
CMD ["node", "dist/index.js"]

# Остальное (копирование исходного кода, сборка) будет сделано
# через 'install' скрипт в .cursor/environment.json после клонирования репозитория агентом.
# Dockerfile не должен COPY проект, он будет склонирован с GitHub.
# CMD также не нужен здесь, т.к. агент будет использовать 'start' из environment.json.
