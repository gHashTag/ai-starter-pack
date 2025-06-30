# 🚀 Quick Start - AI Team Workflow

> **За 10 минут:** От нуля до работающей команды AI-агентов

## 📋 Checklist для быстрого старта

### 1. ✅ Проверка требований (2 мин)

```bash
# Проверить Git
git --version

# Проверить Tmux
tmux -V

# Проверить AI инструменты (выберите один)
cursor --version   # Cursor AI
code --version     # VS Code + Copilot
claude --version   # Claude CLI (если установлен)
```

### 2. 📁 Настройка проекта (3 мин)

```bash
# Перейти в ваш проект
cd your-project

# Создать структуру папок
mkdir -p .ai-orchestrator/{config,logs,templates}
mkdir -p scripts
mkdir -p work_directory

# Скопировать пример задач
cp example-tasks.md tasks.md

# Создать базовую конфигурацию
cat > .ai-orchestrator/config.json << 'EOF'
{
  "project": {
    "name": "Your Project",
    "main_branch": "main",
    "work_directory": "work_directory"
  },
  "ai_tools": {
    "default": "cursor"
  },
  "monitoring": {
    "check_interval": 900,
    "max_idle_time": 1800
  }
}
EOF
```

### 3. 📝 Создание задач (2 мин)

Отредактируйте `tasks.md` под ваш проект:

```markdown
### 🎯 Task 1: Your First Task
- **ID**: `task-001`
- **Branch Name**: `feature/your-feature`
- **Status**: `pending`
- **Tmux Session**: `ai-task-001`
- **Description**: Description of what needs to be done
- **Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2
```

### 4. 🔧 Создание базового скрипта (1 мин)

```bash
# Создать простой spawn-agent.sh
cat > scripts/spawn-agent.sh << 'EOF'
#!/bin/bash
TASK_ID=$1
BRANCH_NAME=$2
TMUX_SESSION=$3

echo "🚀 Starting AI Agent for: $TASK_ID"

# Создать worktree
git worktree add -b "$BRANCH_NAME" "work_directory/$TASK_ID"

# Создать tmux сессию
tmux new-session -d -s "$TMUX_SESSION"
tmux send-keys -t "$TMUX_SESSION" "cd work_directory/$TASK_ID" Enter
tmux send-keys -t "$TMUX_SESSION" "cursor ." Enter

echo "✅ Agent ready! Attach with: tmux attach -t $TMUX_SESSION"
EOF

chmod +x scripts/spawn-agent.sh
```

### 5. 🚀 Запуск первого агента (2 мин)

```bash
# Запустить агента для первой задачи
./scripts/spawn-agent.sh task-001 feature/your-feature ai-task-001

# Подключиться к агенту
tmux attach -t ai-task-001

# Внутри tmux дать инструкции AI:
# "Please implement [your task description] following the acceptance criteria in tasks.md"

# Отключиться от сессии (сохранив агента)
# Ctrl+b, затем d
```

## 🎉 Готово!

Ваш первый AI-агент работает! Теперь вы можете:

1. **Мониторить прогресс**: `tmux attach -t ai-task-001`
2. **Запустить еще агентов**: `./scripts/spawn-agent.sh task-002 feature/another-feature ai-task-002`
3. **Проверить все сессии**: `tmux list-sessions`

## 📖 Следующие шаги

- [ ] Прочитать полное руководство `AI_TEAM_WORKFLOW_GUIDE.md`
- [ ] Настроить автоматический мониторинг
- [ ] Добавить интеграции (Slack, GitHub)
- [ ] Масштабировать до 5-10 агентов

## 🆘 Нужна помощь?

- **Агент завис**: `tmux send-keys -t ai-task-001 C-c`
- **Перезапустить агента**: `tmux kill-session -t ai-task-001` → запустить заново
- **Проблемы с worktree**: `git worktree list` → `git worktree remove work_directory/task-001`

**Время до первого результата: ~30 минут** ⏱️
