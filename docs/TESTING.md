# Тестирование в Telegram Bot Starter Kit

Этот документ описывает подход к тестированию, используемый в Telegram Bot Starter Kit, и предоставляет примеры и рекомендации для написания тестов разных типов.

## Обзор

Starter Kit поддерживает несколько уровней тестирования:

1. **Unit-тесты** - проверка отдельных функций и компонентов
2. **Интеграционные тесты** - проверка взаимодействия между компонентами
3. **E2E-тесты** - тестирование всего приложения от начала до конца

Все тесты используют [Vitest](https://vitest.dev/) как тестовый фреймворк.

## Структура тестов

```
src/__tests__/
├── __mocks__/              # Моки для внешних модулей
├── e2e/                    # E2E тесты
├── examples/               # Примеры тестов
├── framework/              # Фреймворк для тестирования
│   ├── telegram/           # Утилиты для тестирования Telegram
│   └── tests/              # Тесты для самого фреймворка
├── helpers/                # Вспомогательные функции для тестов
├── integration/            # Интеграционные тесты
│   ├── scenes/             # Тесты для сцен
│   ├── services/           # Тесты для сервисов
│   ├── sql/                # Тесты для SQL-запросов
│   └── storage/            # Тесты для хранилищ данных
├── mocks/                  # Дополнительные моки
├── performance/            # Тесты производительности
└── unit/                   # Unit-тесты
    ├── adapters/           # Тесты для адаптеров
    ├── components/         # Тесты для компонентов
    ├── scenes/             # Unit-тесты для сцен
    ├── services/           # Тесты для сервисов
    └── utils/              # Тесты для утилит
```

## Запуск тестов

### Все тесты

```bash
bun test
# или
npm test
```

### Конкретный файл или директория

```bash
bun test src/__tests__/unit/utils/
bun test src/__tests__/unit/utils/validation-zod.test.ts
```

### С покрытием кода

```bash
bun test:coverage
```

## Unit-тестирование

Unit-тесты проверяют работу отдельных функций и компонентов в изоляции.

### Пример unit-теста для утилиты валидации

```typescript
// src/__tests__/unit/utils/validation-zod.test.ts
import { describe, it, expect } from "vitest";
import { validateUser } from "../../../utils/validation-zod";

describe("validateUser", () => {
  it("should validate a correct user object", () => {
    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      telegram_id: 123456789,
      username: "test_user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = validateUser(validUser);
    expect(result).not.toBeNull();
    expect(result?.telegram_id).toBe(123456789);
  });

  it("should return null for invalid user object", () => {
    const invalidUser = {
      // Missing required fields
      username: "test_user",
    };

    const result = validateUser(invalidUser);
    expect(result).toBeNull();
  });
});
```

### Пример unit-теста с использованием моков

```typescript
// src/__tests__/unit/services/logger.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, LogType } from "../../../utils/logger";

describe("Logger", () => {
  beforeEach(() => {
    // Создаем моки для console методов
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    // Очищаем моки после каждого теста
    vi.restoreAllMocks();
  });

  it("should log error messages", () => {
    const errorMessage = "Test error";
    logger.error(errorMessage, { type: LogType.ERROR });

    expect(console.error).toHaveBeenCalled();
    const callArg = (console.error as any).mock.calls[0][0];
    expect(callArg).toContain(errorMessage);
  });

  it("should log info messages", () => {
    const infoMessage = "Test info";
    logger.info(infoMessage, { type: LogType.INFO });

    expect(console.info).toHaveBeenCalled();
    const callArg = (console.info as any).mock.calls[0][0];
    expect(callArg).toContain(infoMessage);
  });
});
```

## Интеграционное тестирование

Интеграционные тесты проверяют взаимодействие между различными компонентами системы.

### Пример интеграционного теста для StorageAdapter

```typescript
// src/__tests__/integration/storage/memory-adapter.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MemoryAdapter } from "../../../adapters/memory-adapter";

describe("MemoryAdapter Integration", () => {
  let adapter: MemoryAdapter;

  beforeEach(async () => {
    adapter = new MemoryAdapter();
    await adapter.initialize();
  });

  afterEach(async () => {
    await adapter.close();
  });

  it("should create and retrieve a user", async () => {
    // Создаем пользователя
    const createdUser = await adapter.createUser({
      telegram_id: 123456789,
      username: "test_user",
      first_name: "Test",
      last_name: "User",
    });

    expect(createdUser).not.toBeNull();
    expect(createdUser?.telegram_id).toBe(123456789);

    // Получаем пользователя
    const retrievedUser = await adapter.getUserByTelegramId(123456789);

    expect(retrievedUser).not.toBeNull();
    expect(retrievedUser?.username).toBe("test_user");
  });

  it("should update user settings", async () => {
    // Создаем пользователя
    const user = await adapter.createUser({
      telegram_id: 987654321,
      username: "settings_test_user",
    });

    // Создаем настройки
    const settings = await adapter.createUserSettings(
      String(user?.telegram_id),
      {
        language: "en",
        notifications_enabled: true,
      }
    );

    expect(settings).not.toBeNull();
    expect(settings?.language).toBe("en");

    // Обновляем настройки
    const updatedSettings = await adapter.updateUserSettings(
      String(user?.telegram_id),
      {
        language: "ru",
      }
    );

    expect(updatedSettings).not.toBeNull();
    expect(updatedSettings?.language).toBe("ru");
    expect(updatedSettings?.notifications_enabled).toBe(true);
  });
});
```

## Тестирование Telegram сцен

Telegram Bot Starter Kit предоставляет специальные утилиты для тестирования Telegram сцен, особенно Wizard-сцен.

### Пример теста для Wizard-сцены

```typescript
// src/__tests__/integration/scenes/example-wizard.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createExampleWizardScene } from "../../../templates/wizard-scene-template";
import { TelegramTestContext } from "../../helpers/telegram/context";

describe("ExampleWizardScene", () => {
  let testCtx: TelegramTestContext;

  beforeEach(() => {
    // Создаем тестовый контекст
    testCtx = new TelegramTestContext();

    // Получаем сцену для тестирования
    const scene = createExampleWizardScene();

    // Регистрируем обработчики сцены в тестовом контексте
    testCtx.registerWizardScene(scene);
  });

  it("should navigate through the wizard steps", async () => {
    // Начинаем сцену
    await testCtx.enterScene("example_wizard");

    // Проверяем первое сообщение
    expect(testCtx.getLastReplyText()).toContain(
      "Добро пожаловать в пример Wizard сцены!"
    );

    // Отправляем текстовое сообщение
    await testCtx.sendTextMessage("Тестовый ввод");

    // Проверяем ответ на втором шаге
    expect(testCtx.getLastReplyText()).toContain("Вы ввели: Тестовый ввод");

    // Нажимаем на кнопку завершения
    await testCtx.clickButton("Завершить");

    // Проверяем, что сцена завершилась
    expect(testCtx.isSceneLeft()).toBe(true);
  });

  it("should handle invalid input", async () => {
    // Начинаем сцену
    await testCtx.enterScene("example_wizard");

    // Отправляем некорректный ввод (например, не текст, а фото)
    await testCtx.sendNonTextMessage("photo");

    // Проверяем сообщение об ошибке
    expect(testCtx.getLastReplyText()).toContain("Пожалуйста, введите текст");

    // Убеждаемся, что мы всё ещё на первом шаге
    expect(testCtx.getCurrentWizardStep()).toBe(0);
  });
});
```

## TDD подход

Starter Kit поддерживает разработку через тестирование (TDD) с помощью специального скрипта `scripts/tdd-cycle.sh`:

```bash
bash scripts/tdd-cycle.sh src/__tests__/unit/my-feature.test.ts
```

Этот скрипт:

1. Запускает тест и убеждается, что он не проходит (RED)
2. Ожидает, пока вы напишете код для прохождения теста
3. Перезапускает тест, чтобы убедиться, что он проходит (GREEN)
4. Ожидает, пока вы выполните рефакторинг
5. Снова запускает тест, чтобы убедиться, что всё по-прежнему работает

## Мокирование Telegram API

Для тестирования без реального взаимодействия с Telegram API, используйте моки:

```typescript
// src/__tests__/mocks/telegraf-context-mock.ts
import { Context as TelegrafContext } from "telegraf";

export function createMockContext(overrides = {}): Partial<TelegrafContext> {
  return {
    telegram: {
      sendMessage: vi.fn().mockResolvedValue({}),
      sendPhoto: vi.fn().mockResolvedValue({}),
      // Другие методы Telegram API
    },
    message: {
      message_id: 123,
      from: {
        id: 456,
        is_bot: false,
        first_name: "Test",
        username: "test_user",
      },
      chat: {
        id: 789,
        type: "private",
        first_name: "Test",
        username: "test_user",
      },
      date: Math.floor(Date.now() / 1000),
      text: "Test message",
    },
    reply: vi.fn().mockResolvedValue({}),
    replyWithMarkdown: vi.fn().mockResolvedValue({}),
    replyWithHTML: vi.fn().mockResolvedValue({}),
    // Другие методы контекста
    ...overrides,
  };
}
```

## Советы по написанию тестов

1. **Изолируйте тесты** - каждый тест должен быть независимым от других
2. **Используйте моки** - не зависьте от внешних сервисов в unit-тестах
3. **Проверяйте граничные случаи** - тестируйте не только "счастливый путь", но и ошибки
4. **Поддерживайте чистоту состояния** - используйте `beforeEach` и `afterEach` для сброса состояния
5. **Следуйте принципу AAA** - Arrange (подготовка), Act (действие), Assert (проверка)
6. **Пишите тесты до кода** - следуйте TDD подходу для лучшего дизайна
