# Шаблоны и паттерны в Telegram Bot Starter Kit

Этот документ описывает основные паттерны и шаблоны проектирования, используемые в Telegram Bot Starter Kit. Понимание этих паттернов поможет вам эффективно расширять и настраивать бот под свои нужды.

## Функциональный подход

Стартер-кит придерживается функционального подхода к программированию, который способствует созданию чистого, модульного и тестируемого кода.

### Основные принципы

1. **Чистые функции** - функции, которые:

   - Не имеют побочных эффектов
   - Возвращают одинаковый результат для одинаковых входных данных
   - Не меняют состояние программы

2. **Неизменяемость (Immutability)** - предпочтение неизменяемых структур данных

3. **Композиция функций** - создание новых функций путем комбинирования существующих

### Примеры в коде

```typescript
// Валидация данных с помощью чистых функций
export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    return null;
  }
}

// Композиция функций
export function validateUser(data: unknown) {
  return validateWithSchema(UserSchema, data);
}

// Работа с неизменяемыми данными
function updateUserSettings(
  settings: UserSettings,
  updates: Partial<UserSettings>
): UserSettings {
  return {
    ...settings, // Копируем исходные настройки
    ...updates, // Применяем обновления
    updated_at: new Date().toISOString(), // Добавляем метку времени
  };
}
```

## Паттерн "Адаптер"

Стартер-кит использует паттерн "Адаптер" для обеспечения гибкого доступа к хранилищу данных.

### Интерфейс StorageAdapter

```typescript
export interface StorageAdapter {
  initialize(): Promise<void>;
  close(): Promise<void>;

  // Методы для работы с пользователями
  getUserByTelegramId(telegramId: number): Promise<User | null>;
  createUser(userData: Partial<User>): Promise<User | null>;
  updateUser(telegramId: number, userData: Partial<User>): Promise<User | null>;

  // Методы для работы с настройками пользователей
  getUserSettings(userId: string): Promise<UserSettings | null>;
  createUserSettings(
    userId: string,
    settings?: Partial<UserSettings>
  ): Promise<UserSettings | null>;
  updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<UserSettings | null>;

  // Методы для работы с состояниями сцен
  saveSceneState(userId: string, sceneId: string, state: any): Promise<boolean>;
  getSceneState(userId: string, sceneId: string): Promise<any>;
  deleteSceneState(userId: string, sceneId: string): Promise<boolean>;

  // Методы для логирования активности
  logActivity(
    userId: string,
    activityData: Partial<ActivityLog>
  ): Promise<ActivityLog | null>;
  getUserActivity(userId: string, limit?: number): Promise<ActivityLog[]>;

  // Методы для работы с настройками уведомлений
  getNotificationSettings(userId: string): Promise<NotificationSettings | null>;
  createNotificationSettings(
    userId: string,
    settings?: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null>;
  updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null>;
}
```

### Реализации адаптера

```typescript
// MemoryAdapter - реализация для хранения в памяти
export class MemoryAdapter implements StorageAdapter {
  private users: Map<number, User> = new Map();
  private userSettings: Map<string, UserSettings> = new Map();
  // ...

  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    return this.users.get(telegramId) || null;
  }

  // Другие методы...
}

// Пример использования другого адаптера (например, для PostgreSQL)
export class PostgresAdapter implements StorageAdapter {
  private client: any;

  constructor(connectionString: string) {
    // Инициализация клиента PostgreSQL
  }

  // Реализация методов...
}
```

## Паттерн "Фабрика"

Фабричный метод используется для создания объектов без указания их конкретного класса.

### Пример: Создание Wizard-сцены

```typescript
// Функция-фабрика для создания Wizard-сцены
export function createExampleWizardScene(): Scenes.WizardScene<BaseBotContext> {
  // Создаем сцену с обработчиками шагов
  const scene = new Scenes.WizardScene(
    "example_wizard",
    handleWelcomeStep,
    handleNameStep,
    handleAgeStep
  );

  // Добавляем обработчики действий
  scene.action("cancel", handleCancelAction);
  scene.action("confirm", handleConfirmAction);

  return scene;
}
```

## Паттерн "Middleware"

Middleware используется для обработки запросов в последовательном порядке, где каждый обработчик может изменить запрос или ответ.

### Пример: Обработчик ошибок

```typescript
// Middleware для обработки ошибок
export function errorHandler(): Middleware<BaseBotContext> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      logger.error("Bot error occurred", {
        error: error instanceof Error ? error.message : String(error),
        type: LogType.ERROR,
        user_id: ctx.from?.id,
      });

      await ctx.reply(
        "Произошла ошибка. Пожалуйста, повторите позже или обратитесь к администратору."
      );
    }
  };
}

// Использование в боте
bot.use(errorHandler());
```

## Паттерн "Команда"

Паттерн "Команда" используется для инкапсуляции запроса как объекта.

### Пример: Обработчики команд

```typescript
// Отдельные функции-обработчики для команд
export const handleStartCommand = async (
  ctx: BaseBotContext
): Promise<void> => {
  await ctx.reply("Добро пожаловать! Я бот для...");
};

export const handleHelpCommand = async (ctx: BaseBotContext): Promise<void> => {
  await ctx.reply(
    "Доступные команды:\n/start - Начать работу\n/help - Справка"
  );
};

// Регистрация команд в боте
export function registerCommands(bot: Telegraf<BaseBotContext>): void {
  bot.command("start", handleStartCommand);
  bot.command("help", handleHelpCommand);
}
```

## Паттерн "Композиция"

Композиция функций позволяет создавать новые функции, объединяя существующие.

### Пример: Построение запросов

```typescript
// Базовая функция для получения данных
const fetchData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

// Функции трансформации
const filterActiveUsers = (users: User[]) =>
  users.filter((user) => user.is_active);
const sortByName = (users: User[]) =>
  [...users].sort((a, b) => a.name.localeCompare(b.name));
const limitResults = (limit: number) => (users: User[]) =>
  users.slice(0, limit);

// Композиция функций
export const getTopActiveUsers = async (url: string, limit: number = 10) => {
  const users = await fetchData(url);
  return compose(filterActiveUsers, sortByName, limitResults(limit))(users);
};

// Вспомогательная функция для композиции
function compose<T>(...fns: Array<(arg: T) => T>) {
  return (x: T) => fns.reduce((acc, fn) => fn(acc), x);
}
```

## Паттерн "Валидатор"

Использование библиотеки Zod для типобезопасной валидации данных.

### Пример: Схемы и валидаторы

```typescript
// Схема для валидации данных пользователя
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  telegram_id: z.number(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Функция валидации
export function validateUser(data: unknown) {
  try {
    return UserSchema.parse(data);
  } catch (error) {
    return null;
  }
}
```

## Паттерн "Builder" для клавиатур

Использование паттерна "Builder" для создания клавиатур Telegram.

### Пример: Создание Inline-клавиатуры

```typescript
// Функция-строитель для создания клавиатуры
export function createMainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📊 Профиль", "profile")],
    [Markup.button.callback("⚙️ Настройки", "settings")],
    [Markup.button.callback("❓ Помощь", "help")],
  ]);
}

// Использование в боте
bot.command("menu", async (ctx) => {
  await ctx.reply("Главное меню:", createMainMenuKeyboard());
});
```

## Паттерн "Инверсия зависимостей" (DI)

Использование инверсии зависимостей для упрощения тестирования и гибкости кода.

### Пример: Внедрение адаптера хранилища

```typescript
import { StorageAdapter } from "./adapters/storage-adapter";
import { MemoryAdapter } from "./adapters/memory-adapter";
import { createContainer, asValue, asClass } from "awilix";

// Создание контейнера DI
export function createDIContainer(config: AppConfig) {
  const container = createContainer();

  // Регистрация сервисов
  container.register({
    config: asValue(config),
    storage: asClass(MemoryAdapter).singleton(),
    // Другие сервисы...
  });

  return container;
}

// Использование в боте
const container = createDIContainer(config);
const storage = container.resolve<StorageAdapter>("storage");

// Передача в контекст бота
bot.use((ctx, next) => {
  ctx.storage = storage;
  return next();
});
```

## Заключение

Использование этих паттернов и шаблонов проектирования помогает создавать чистый, модульный и легко тестируемый код. При разработке своего бота на основе Telegram Bot Starter Kit рекомендуется придерживаться этих паттернов для поддержания согласованного стиля кода.
