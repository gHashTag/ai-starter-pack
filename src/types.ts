import { Context as TelegrafContext, Scenes } from "telegraf";
import {
  User,
  UserSettings,
  SceneState,
  ActivityLog,
  NotificationSettings,
} from "./schemas";
import { StorageAdapter } from "./adapters/storage-adapter";

// Реэкспортируем типы для обратной совместимости
export type {
  User,
  UserSettings,
  SceneState,
  ActivityLog,
  NotificationSettings,
};

// Базовый интерфейс для контекста Telegraf с добавлением поддержки сцен
export interface BaseBotContext extends TelegrafContext {
  storage: StorageAdapter;
  config: BotConfig;
  // Добавляем session для поддержки сессии в контексте
  session?: Scenes.SceneSession<BotSceneSessionData> & {
    user?: User;
    [key: string]: any;
  };
  // Возвращаем тип к SceneContextScene, который включает и контекст, и сессию
  scene: Scenes.SceneContextScene<BaseBotContext, BotSceneSessionData>;
  // Делаем wizard не опциональным для совместимости с WizardScene
  wizard: Scenes.WizardContextWizard<BaseBotContext>;
  match?: RegExpExecArray | null;
}

// Конфигурация для бота
export interface BotConfig {
  telegramBotToken: string;
  webhookDomain?: string;
  // Другие необходимые параметры конфигурации
  logLevel?: string;
  sessionTTL?: number;
  adminIds?: number[];
}

// Шаги сцены
export enum BotSceneStep {
  // Пример шага
  EXAMPLE_STEP_1 = "EXAMPLE_STEP_1",
  EXAMPLE_STEP_2 = "EXAMPLE_STEP_2",

  // Шаги для шаблона Wizard-сцены (оставляем для примера)
  TEMPLATE_STEP_1 = "TEMPLATE_STEP_1",
  TEMPLATE_STEP_2 = "TEMPLATE_STEP_2",
}

export interface BotSceneSessionData extends Scenes.SceneSessionData {
  step?: BotSceneStep;
  cursor: number; // Для пагинации или отслеживания состояния
  messageIdToEdit?: number; // ID сообщения для редактирования
  data?: Record<string, any>; // Произвольные данные для сцены
  user?: User; // Пользователь в сессии
}

// Тип для Middleware
export type Middleware<TContext extends TelegrafContext> = (
  ctx: TContext,
  next: () => Promise<void>
) => Promise<void> | void;

export {}; // Добавляем пустой экспорт, чтобы файл считался модулем
