# Inngest Integration для Bible VibeCoder

Этот модуль предоставляет интеграцию с Inngest для обработки событий и фоновых задач с поддержкой **кастомных портов** для избежания конфликтов с другими сервисами.

## 🔧 Конфигурация

### Кастомные Порты

По умолчанию используются порты **9288** и **9289** вместо стандартных 8288 и 8289:

- **Dev Server**: 9288 (вместо 8288)
- **Connect Gateway**: 9289 (вместо 8289)

### Переменные Окружения

Добавьте в ваш `.env` файл:

```env
# Inngest Configuration
INNGEST_DEV_PORT=9288
INNGEST_CONNECT_PORT=9289
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
INNGEST_BASE_URL=
```

## 🚀 Запуск

### Автоматический запуск с кастомными портами

```bash
# Использует скрипт с автоматической проверкой портов
./scripts/start-inngest.sh
```

### Ручной запуск

```bash
# С явным указанием портов
npx inngest-cli dev --port 9288 --gateway-port 9289

# Или через переменные окружения
INNGEST_DEV_PORT=9288 INNGEST_CONNECT_PORT=9289 npx inngest-cli dev
```

## 📁 Структура

```
src/inngest/
├── client.ts          # Конфигурация Inngest клиента
├── server.ts          # HTTP сервер для обработки функций
├── functions/
│   ├── index.ts       # Реестр всех функций
│   └── hello-world.ts # Демо функция "Hello World"
├── index.ts           # Основной экспорт модуля
└── README.md          # Этот файл
```

## 🎯 Использование

### Импорт Компонентов

```typescript
// Клиент для отправки событий
import { inngest } from './src/inngest';

// Функции и события
import { sendHelloWorldEvent, HELLO_WORLD_EVENT } from './src/inngest/functions';

// Конфигурация портов
import { INNGEST_PORTS, getInngestUrls } from './src/inngest';
```

### Отправка События

```typescript
// Простая отправка
await sendHelloWorldEvent({
  name: 'Пользователь',
  language: 'ru',
});

// Или через клиент напрямую
await inngest.send({
  name: 'demo/hello.world',
  data: { name: 'User', language: 'en' },
});
```

### Проверка Доступности Портов

```typescript
import { checkPortAvailability } from './src/inngest';

const isAvailable = await checkPortAvailability(9288);
if (!isAvailable) {
  console.log('Порт 9288 занят!');
}
```

## 🔍 Hello World Функция

Демонстрационная функция поддерживает:

- **Многоязычность**: en, ru, es, fr
- **Структурированные шаги**: логирование, генерация, результат
- **Retry логика**: автоматический повтор при ошибках
- **Типизация**: полная типизация данных и результатов

### Пример события:

```typescript
{
  name: "demo/hello.world",
  data: {
    name: "Гуру",           // Имя пользователя
    language: "ru",         // Язык (en|ru|es|fr)
    timestamp: "2024-01-01T00:00:00.000Z"
  }
}
```

### Результат функции:

```typescript
{
  message: "Привет, Гуру! 🕉️",
  processedAt: "2024-01-01T00:00:00.000Z",
  eventData: { /* исходные данные */ },
  environment: {
    nodeEnv: "development",
    inngestPort: 9288
  }
}
```

## 🧪 Тестирование

### Тестовая Инфраструктура

Создана полная тестовая инфраструктура с:

- **Моками** для Inngest клиента
- **Утилитами** для создания тестовых данных
- **Валидаторами** результатов функций
- **Хелперами** для тестирования портов

### Запуск Тестов

```bash
# Все тесты
npm run test

# Только Inngest тесты
npm run test src/__tests__/inngest

# С покрытием
npm run test:coverage
```

### Пример Теста

```typescript
import { createHelloWorldTestData, validators } from './test-utils';

it('должна обрабатывать русский язык', async () => {
  const testData = createHelloWorldTestData.russian();
  const result = await helloWorldFunction.handler(mockContext);

  const validation = validators.helloWorldResult(result);
  validation.hasCorrectLanguage('ru');
  validation.messageContainsName('Тестовый Пользователь');
});
```

## 🔧 Лучшие Практики

### 1. Структурированные Шаги

```typescript
export const myFunction = inngest.createFunction(
  { id: 'my-function' },
  { event: 'my/event' },
  async ({ event, step }) => {
    // Шаг 1: Валидация
    const validated = await step.run('validate', async () => {
      return validateInput(event.data);
    });

    // Шаг 2: Обработка
    const result = await step.run('process', async () => {
      return processData(validated);
    });

    // Шаг 3: Сохранение
    await step.run('save', async () => {
      return saveResult(result);
    });

    return result;
  }
);
```

### 2. Типизация Событий

```typescript
interface MyEventData {
  id: string;
  payload: Record<string, any>;
}

interface MyEventResult {
  success: boolean;
  processedAt: string;
  data: MyEventData;
}
```

### 3. Обработка Ошибок

```typescript
export const robustFunction = inngest.createFunction(
  {
    id: 'robust-function',
    retries: 3,
    onFailure: async ({ error, event, runId }) => {
      console.error(`Function ${runId} failed:`, error);
      // Логирование, уведомления, etc.
    },
  },
  { event: 'my/event' },
  async ({ event, step }) => {
    // Логика функции
  }
);
```

### 4. Тестирование

```typescript
// Используйте моки для изоляции тестов
const { inngest, mockSend } = createMockInngest();
const mockContext = createMockEventContext(testData);

// Проверяйте выполнение шагов
expect(mockContext.mockStep.run).toHaveBeenCalledTimes(3);

// Валидируйте результаты
const validation = validators.myFunctionResult(result);
validation.hasRequiredFields();
```

## 🌍 URLs и Эндпоинты

При запуске Inngest Dev Server доступны:

- **Dashboard**: http://localhost:9288/dashboard
- **API Endpoint**: http://localhost:9288/api/inngest
- **Health Check**: http://localhost:3001/health (если используется автономный сервер)

## 🚨 Устранение Проблем

### Порт уже используется

```bash
# Проверить какой процесс использует порт
lsof -i :9288

# Убить процесс
kill -9 <PID>

# Или использовать скрипт
./scripts/start-inngest.sh  # автоматически проверит порты
```

### Функция не срабатывает

1. Проверьте, что Inngest Dev Server запущен
2. Убедитесь, что функция зарегистрирована в `functions/index.ts`
3. Проверьте логи в консоли Inngest Dashboard
4. Убедитесь, что имя события совпадает

### Проблемы с типами

```bash
# Проверка типов
npm run typecheck

# Перезапуск TypeScript сервера в VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

## 📚 Дополнительные Ресурсы

- [Официальная документация Inngest](https://www.inngest.com/docs)
- [Inngest SDK для Node.js](https://www.inngest.com/docs/sdk/serve)
- [Примеры использования](https://github.com/inngest/inngest-js/tree/main/examples)

---

_Этот модуль создан в соответствии с лучшими практиками Inngest и принципами чистого кода. 🕉️_
