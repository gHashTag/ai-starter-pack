#!/bin/bash

# 🚀 VibeCode Bible One-Command Setup Script
# 🎯 Designed for seamless developer onboarding and meditative readiness

set -e

# 🙏 Приветственное сообщение
echo "🕉️ Welcome to the VibeCode Bible One-Command Setup"
echo "*\"सर्वं खल्विदं ब्रह्म\"* - *\"All this is Brahman\"*"
echo ""

# 📦 Установка bun
if ! command -v bun >/dev/null 2>&1; then
    echo "🧘‍♂️ Installing Bun Package Manager..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo "✅ Bun installed."
else
    echo "✅ Bun already installed: $(bun --version)"
fi

# 📋 Клонирование репозитория (только если не в директории проекта)
if [[ ! -f "package.json" ]]; then
    PROJECT_NAME=${1:-"my-bible-vibecoder"}
    echo "🚀 Cloning repository into $PROJECT_NAME..."
    git clone https://github.com/playra/bible_vibecoder.git "$PROJECT_NAME"
    cd "$PROJECT_NAME"
    echo "📂 Switched to project directory: $(pwd)"
else
    echo "✅ Already in project directory"
fi

# 📦 Установка зависимостей командой bun
echo "📦 Installing dependencies with Bun..."
bun install

# 🔧 Настройка окружения
echo "🔧 Configuring environment..."
cp .env.example .env
# Примерный токен для среды; заменить на реальный
echo "BOT_TOKEN=your_bot_token_here" >> .env

# 🧪 Запуск быстрых тестов
echo "🧪 Running quick tests..."
bash scripts/quick-test.sh

# 🚀 Запуск в режиме разработки
echo "⚡ Starting development server..."
echo "📋 Use 'bun run dev' to start the full development environment"
echo "📋 Use 'bash scripts/quick-test.sh' for rapid testing"

# 📊 Деплой на Railway (опционально)
if command -v railway >/dev/null 2>&1; then
    if ! railway whoami >/dev/null 2>&1; then
        echo "🐒 Railway CLI available but not logged in"
        echo "📋 Run 'railway login && railway up' to deploy"
    else
        echo "🚄 Railway ready for deployment"
        echo "📋 Run 'railway up' to deploy"
    fi
else
    echo "📋 Install Railway CLI: npm install -g @railway/cli"
fi

# 🌐 Финальное сообщение
echo ""
echo "🎉 All set! Your VibeCode Bible is running and ready."
echo "🕉️ *\"तत्त्वमसि\"* - *\"Thou art That\"*"

