# 📘 Интеграция Inngest Functions

## 🎯 Обзор

Данная документация описывает пошаговый процесс интеграции Inngest Functions в новый проект на основе опыта Bible VibeCoder. Следуя этим инструкциям, вы сможете быстро настроить событийно-ориентированную архитектуру с фоновыми задачами.

---

## 📋 Предварительные Требования

- Node.js 18+ или Bun
- Git
- Базовые знания TypeScript/JavaScript
- Telegram Bot Token (если используется Telegram интеграция)

---

## 🚀 Часть 1: Установка и Настройка Базовой Структуры

### Шаг 1: Инициализация Проекта

```bash
# Создание нового проекта
mkdir my-inngest-project && cd my-inngest-project

# Инициализация package.json
npm init -y
# или для Bun
bun init
```

### Шаг 2: Установка Зависимостей

```bash
# Основные зависимости
npm install inngest telegraf dotenv typescript @types/node

# Зависимости для разработки
npm install -D @types/node tsx nodemon vitest

# Для Bun
bun add inngest telegraf dotenv typescript
bun add -d @types/node tsx nodemon vitest
```

### Шаг 3: Настройка TypeScript

Создайте файл `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🔧 Часть 2: Конфигурация Inngest

### Шаг 1: Создание Конфигурационного Файла

Создайте файл `inngest.json` в корне проекта:

```json
{
  "sdk-url": ["http://localhost:3000/api/inngest"],
  "port": 8288,
  "no-discovery": false
}
```

### Шаг 2: Настройка Переменных Окружения

Создайте файл `.env`:

```env
# Inngest Configuration
INNGEST_DEV_SERVER_URL=http://localhost:8288
INNGEST_SIGNING_KEY=your_signing_key_here
INNGEST_EVENT_KEY=your_event_key_here

# Bot Configuration (если используется)
BOT_TOKEN=your_telegram_bot_token
ADMIN_USER_ID=your_telegram_user_id

# Application
NODE_ENV=development
PORT=3000
```

Создайте файл `.env.example` для шаблона:

```env
# Inngest Configuration
INNGEST_DEV_SERVER_URL=http://localhost:8288
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# Bot Configuration
BOT_TOKEN=
ADMIN_USER_ID=

# Application
NODE_ENV=development
PORT=3000
```

---

## 🏗️ Часть 3: Создание Базовой Структуры

### Шаг 1: Создание Структуры Папок

```bash
mkdir -p src/{inngest,functions,types,utils,services}
mkdir -p src/__tests__/{unit,integration}
mkdir -p scripts
```

### Шаг 2: Создание **важно чтобы все формулы были в формате markdown**
