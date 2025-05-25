# Руководство по миграции

Этот документ содержит инструкции по миграции с предыдущих версий Telegram Bot Starter Kit на новую версию.

## Миграция с версии 0.x на 1.0

### Основные изменения

1. **Переход на функциональный подход**

   - Замена классов на функции для создания сцен и обработчиков
   - Улучшение тестируемости и модульности

2. **Обновление структуры проекта**

   - Перемещение логгера в директорию `src/utils/`
   - Оптимизация файловой структуры

3. **Изменения в API**
   - Обновление интерфейса `StorageAdapter`
   - Использование новых типов для контекста бота

### Шаги миграции

#### 1. Обновление зависимостей

```bash
# Установка новой версии
bun install
# или
npm install
```

#### 2. Обновление импортов

Замените все импорты логгера:

```typescript
// Старый импорт
import { logger, LogLevel } from "./src/logger";

// Новый импорт
import { logger, LogLevel, LogType } from "./src/utils/logger";
```

#### 3. Обновление вызовов логгера

Обновите вызовы логгера, добавив тип логов:

```typescript
// Старый вызов
logger.info("Сообщение");

// Новый вызов
logger.info("Сообщение", { type: LogType.SYSTEM });
```

#### 4. Обработка ошибок

Используйте новый механизм обработки ошибок:

```typescript
// Старый способ
bot.catch((err, ctx) => {
  logger.error("Ошибка", { error: err });
});

// Новый способ
import { errorHandler } from "./src/middlewares/error-handler";

bot.catch((err, ctx) => {
  errorHandler(err, ctx);
});
```

#### 5. Переход на функциональные сцены

Если вы использовали классы для создания сцен, перейдите на функциональный подход:

```typescript
// Старый способ (класс)
class MyScene extends Scenes.WizardScene<BaseBotContext> {
  constructor() {
    super(
      "my_scene"
      // шаги сцены
    );
  }
}

// Новый способ (функциональный)
const handleStep1 = async (ctx: BaseBotContext) => {
  // логика шага
};

const handleStep2 = async (ctx: BaseBotContext) => {
  // логика шага
};

export const createMyScene = () => {
  return new Scenes.WizardScene<BaseBotContext>(
    "my_scene",
    handleStep1,
    handleStep2
  );
};
```

#### 6. Обновление конфигурации

Используйте новый формат конфигурации:

```typescript
// Старый способ
export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
};

// Новый способ
import { config } from "./src/config";
```

## Миграция с версии 1.0 на будущие версии

Информация будет добавлена по мере выпуска новых версий.
