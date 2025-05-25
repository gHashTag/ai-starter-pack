# Начало работы с Telegram Bot Starter Kit

Данный документ поможет вам быстро начать разработку бота на основе данного стартер-кита.

## Требования

- Node.js 16+ (рекомендуется 18+)
- Bun (для более быстрой разработки и тестирования)
- PostgreSQL (опционально, если вы планируете использовать базу данных)

## Установка

1. Клонируйте репозиторий:

```bash
git clone <url-репозитория> my-telegram-bot
cd my-telegram-bot
```

2. Установите зависимости:

```bash
bun install
# или
npm install
```

3. Скопируйте файл `.env.example` в `.env` и заполните необходимые переменные окружения:

```bash
cp .env.example .env
```

Обязательно укажите:

- `BOT_TOKEN` - токен вашего Telegram бота, полученный от [@BotFather](https://t.me/BotFather)
- `DATABASE_URL` - URL для подключения к PostgreSQL (опционально)

## Структура проекта

```
telegram-bot-starter/
├── docs/                  # Документация
├── drizzle_migrations/    # Миграции Drizzle ORM
├── scripts/               # Скрипты для разработки и деплоя
├── src/
│   ├── adapters/          # Адаптеры для хранилищ данных
│   ├── db/                # Конфигурация и схемы базы данных
│   ├── middlewares/       # Middlewares для бота
│   ├── schemas/           # Схемы Zod для валидации
│   ├── templates/         # Шаблоны для типовых компонентов
│   ├── utils/             # Вспомогательные утилиты
│   ├── bot.ts             # Основной файл бота
│   ├── commands.ts        # Определение команд бота
│   ├── config.ts          # Конфигурация
│   ├── index.ts           # Точка входа
│   └── types.ts           # Типы TypeScript
├── .env.example           # Пример переменных окружения
├── .gitignore
├── bun.lock               # Lock-файл Bun
├── docker-compose.yml     # Конфигурация Docker
├── Dockerfile             # Dockerfile для сборки образа
├── drizzle.config.ts      # Конфигурация Drizzle ORM
├── package.json
├── README.md
├── tsconfig.json
└── vitest.config.ts       # Конфигурация тестов Vitest
```

## Базовые концепции

### 1. Архитектура бота

Бот построен на основе библиотеки [Telegraf](https://github.com/telegraf/telegraf) и использует следующие ключевые концепции:

- **Сцены (Scenes)** - для организации многошаговых диалогов
- **Wizard-сцены** - специальный тип сцен для пошаговых диалогов
- **Middleware** - для обработки сообщений и действий
- **Контекст (Context)** - объект, содержащий информацию о текущем сообщении и доступные методы API

### 2. Хранение данных

Стартер-кит предлагает два способа хранения данных:

- **MemoryAdapter** - для хранения данных в памяти (для разработки или простых ботов)
- **StorageAdapter** - интерфейс для реализации различных адаптеров хранения (PostgreSQL, Redis, и т.д.)

### 3. Валидация данных

Для валидации данных используется библиотека [Zod](https://github.com/colinhacks/zod). Схемы определены в директории `src/schemas/`.

## Быстрый старт

### Создание простого бота

1. Запустите бот в режиме разработки:

```bash
bun run dev
```

2. Откройте вашего бота в Telegram и отправьте команду `/start`.

### Создание новой Wizard-сцены

1. Создайте новый файл для вашей сцены (например, `src/scenes/my-wizard-scene.ts`), используя шаблон из `src/templates/wizard-scene-template.ts`.

2. Зарегистрируйте сцену в боте, добавив ее в `src/bot.ts`:

```typescript
// Импорт сцены
import { MyWizardScene } from "./scenes/my-wizard-scene";

// Добавление сцены в Stage
const stage = new Scenes.Stage<CustomContext>([
  // Другие сцены...
  new MyWizardScene(),
]);
```

3. Добавьте команду для входа в сцену в `src/commands.ts`:

```typescript
bot.command("my_wizard", (ctx) => ctx.scene.enter("my_wizard_scene_id"));
```

## Работа с базой данных

### Настройка подключения

1. Убедитесь, что у вас указан правильный `DATABASE_URL` в файле `.env`.

2. Инициализируйте базу данных с помощью миграций:

```bash
bun run db:migrate
```

### Создание новой миграции

Если вы изменили схему базы данных в `src/db/schema.ts`, создайте новую миграцию:

```bash
bun run db:generate
```

## Тестирование

### Запуск тестов

```bash
bun test
```

### Создание новых тестов

1. Создайте новый файл теста в директории `src/__tests__/` (например, `src/__tests__/unit/my-test.test.ts`).

2. Используйте [Vitest](https://vitest.dev/) для написания тестов.

### TDD-цикл разработки

Для разработки через тестирование используйте скрипт `scripts/tdd-cycle.sh`:

```bash
bash scripts/tdd-cycle.sh src/__tests__/unit/my-test.test.ts
```

## Деплой

### Настройка Docker

1. Соберите Docker-образ:

```bash
docker build -t my-telegram-bot .
```

2. Запустите контейнер:

```bash
docker run -d --env-file .env my-telegram-bot
```

### Настройка PM2

1. Установите PM2 глобально:

```bash
npm install -g pm2
```

2. Запустите бота с помощью PM2:

```bash
pm2 start ecosystem.config.cjs
```

## Дополнительные ресурсы

- [Документация Telegraf](https://telegraf.js.org/)
- [Документация Drizzle ORM](https://orm.drizzle.team/)
- [Документация Zod](https://zod.dev/)
- [Шаблоны для Wizard-сцен](docs/WIZARD_SCENE_PATTERNS.md)
- [Руководство по обработчику кнопок](docs/BUTTON_HANDLER.md)
