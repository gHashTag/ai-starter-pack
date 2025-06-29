# 📅 Google Calendar MCP - Быстрая установка

## ⚡ 3 простых шага

### 1️⃣ Получить Google OAuth Credentials

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект → APIs & Services → Library → включите "Google Calendar API"
3. Credentials → Create OAuth 2.0 → Desktop Application → скачайте JSON

### 2️⃣ Сохранить credentials

```bash
# Создать папку
mkdir -p ~/.config/google-calendar-mcp

# Скопировать скачанный файл (измените путь)
cp ~/Downloads/client_secret_*.json ~/.config/google-calendar-mcp/credentials.json
```

### 3️⃣ Настроить Cursor MCP

Добавьте в конфигурацию MCP Cursor:

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "bunx",
      "args": ["@cocal/google-calendar-mcp"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "/Users/euro/.config/google-calendar-mcp/credentials.json"
      }
    }
  }
}
```

**Где найти конфигурацию:**

- Cursor → Settings → Extensions → MCP
- Или файл: `~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.cursor-mcp/settings.json`

## 🚀 Использование

После перезапуска Cursor можно:

```bash
# Получить события на сегодня и найти ID
list_events(calendar_id="primary", time_min="2025-06-05T00:00:00Z", time_max="2025-06-05T23:59:59Z")

# Обновить название события
update_event(event_id="ID_события", summary="Раз, два")

# Поиск событий
search_events(query="13:30")
```

## ⚠️ Важные моменты

- **OAuth Consent Screen:** Добавьте свой email в "Test users"
- **Первый запуск:** Автоматически откроется браузер для авторизации
- **Безопасность:** Не публикуйте файл credentials.json

## 🔧 Если что-то не работает

```bash
# Проверить установку
bunx @cocal/google-calendar-mcp version

# Ручная авторизация
export GOOGLE_OAUTH_CREDENTIALS="/Users/euro/.config/google-calendar-mcp/credentials.json"
bunx @cocal/google-calendar-mcp auth

# Проверить файл
ls -la ~/.config/google-calendar-mcp/credentials.json
```

**✅ Результат:** Полное управление Google Calendar через Cursor MCP!
