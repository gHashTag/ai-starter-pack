import { Context as TelegrafContext, Scenes } from 'telegraf';
import {
  User,
  UserSettings,
  SceneState,
  ActivityLog,
  NotificationSettings,
} from './schemas';
import { StorageAdapter } from './adapters/storage-adapter';

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
  EXAMPLE_STEP_1 = 'EXAMPLE_STEP_1',
  EXAMPLE_STEP_2 = 'EXAMPLE_STEP_2',

  // Шаги для шаблона Wizard-сцены (оставляем для примера)
  TEMPLATE_STEP_1 = 'TEMPLATE_STEP_1',
  TEMPLATE_STEP_2 = 'TEMPLATE_STEP_2',
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

// === Instagram Carousel Generator Types ===

/**
 * Запрос на создание карусели
 */
export interface CarouselRequest {
  /** Тема для поиска в VIBECODING документации */
  topic: string;
  /** Количество слайдов (3-10) */
  slideCount?: number;
  /** Стиль дизайна */
  designStyle?: 'minimal' | 'vibrant' | 'classic' | 'modern';
  /** Telegram ID пользователя для отправки результата */
  telegramUserId: number;
}

/**
 * Один слайд карусели
 */
export interface CarouselSlide {
  /** Порядковый номер слайда */
  order: number;
  /** Тип слайда */
  type:
    | 'title'
    | 'principle'
    | 'practice'
    | 'quote'
    | 'summary'
    | 'introduction'
    | 'tools'
    | 'psychology'
    | 'metrics'
    | 'trends'
    | 'conclusion';
  /** Заголовок слайда */
  title: string;
  /** Основной текст */
  content: string;
  /** Дополнительный текст (подзаголовок, автор цитаты и т.д.) */
  subtitle?: string;
  /** Цветовая схема для этого слайда */
  colorScheme?: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
  };
}

/**
 * Результат генерации карусели
 */
export interface CarouselResult {
  /** Массив слайдов */
  slides: CarouselSlide[];
  /** Буферы изображений для каждого слайда */
  imageBuffers: Buffer[];
  /** Метаданные */
  metadata: {
    topic: string;
    generatedAt: Date;
    slideCount: number;
    designStyle: string;
  };
}

/**
 * Контент, извлеченный из VIBECODING документации
 */
export interface VibeCodingContent {
  /** Заголовок раздела */
  title: string;
  /** Основной контент */
  content: string;
  /** Путь к файлу */
  filePath: string;
  /** Категория (основы, практики, инструменты и т.д.) */
  category: string;
  /** Ключевые концепции */
  concepts: string[];
  /** Цитаты и принципы */
  quotes: string[];
}

/**
 * Настройки Canvas для рендеринга
 */
export interface CanvasConfig {
  /** Ширина изображения (Instagram стандарт: 1080) */
  width: number;
  /** Высота изображения (Instagram стандарт: 1350) */
  height: number;
  /** Качество изображения (0.1 - 1.0) */
  quality: number;
  /** Формат вывода */
  format: 'png' | 'jpeg';
}

/**
 * Шаблон дизайна для слайда
 */
export interface SlideTemplate {
  /** Цветовая схема */
  colors: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
    accent: string;
    border: string;
  };
  /** Настройки шрифтов */
  fonts: {
    title: string;
    content: string;
    subtitle: string;
    emoji: string;
  };
  /** Отступы и размеры */
  layout: {
    padding: number;
    titleMargin: number;
    contentMargin: number;
    lineHeight: number;
  };
}

export {}; // Добавляем пустой экспорт, чтобы файл считался модулем
