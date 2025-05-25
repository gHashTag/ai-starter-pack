/**
 * Утилита для логирования действий пользователя и ошибок
 *
 * Предоставляет единый интерфейс для логирования с разными уровнями важности,
 * форматированием и возможностью сохранения логов в файл или базу данных.
 */

// Уровни логирования
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

// Типы логов
export enum LogType {
  SYSTEM = "system",
  DATABASE = "database",
  TELEGRAM_API = "telegram_api",
  GRAPHQL_API = "graphql_api",
  EXTERNAL_SERVICE = "external_service",
  BUSINESS_LOGIC = "business_logic",
  USER_ACTION = "user_action",
  SCENE = "scene",
  NETWORK = "network",
  PERFORMANCE = "performance",
  TEST = "test",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  DEBUG = "debug",
}

// Интерфейс для записи лога
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  type: LogType;
  message: string;
  userId?: number | string;
  username?: string;
  data?: any;
  error?: Error;
}

// Класс логгера
export class Logger {
  private static instance: Logger;
  private logToConsole: boolean = true;
  private logToFile: boolean = false;
  private logToDatabase: boolean = false;
  private minLevel: LogLevel = LogLevel.DEBUG;

  // Приватный конструктор для синглтона
  private constructor() {}

  // Получение экземпляра логгера
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Настройка логгера
  public configure(options: {
    logToConsole?: boolean;
    logToFile?: boolean;
    logToDatabase?: boolean;
    minLevel?: LogLevel;
  }) {
    if (options.logToConsole !== undefined) {
      this.logToConsole = options.logToConsole;
    }
    if (options.logToFile !== undefined) {
      this.logToFile = options.logToFile;
    }
    if (options.logToDatabase !== undefined) {
      this.logToDatabase = options.logToDatabase;
    }
    if (options.minLevel !== undefined) {
      this.minLevel = options.minLevel;
    }
  }

  // Логирование
  public log(entry: Omit<LogEntry, "timestamp">) {
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    // Проверяем уровень логирования
    if (this.shouldLog(fullEntry.level)) {
      // Логируем в консоль
      if (this.logToConsole) {
        this.logToConsoleImpl(fullEntry);
      }

      // Логируем в файл
      if (this.logToFile) {
        this.logToFileImpl(/* fullEntry */); // Аргумент закомментирован
      }

      // Логируем в базу данных
      if (this.logToDatabase) {
        this.logToDatabaseImpl(/* fullEntry */); // Аргумент закомментирован
      }
    }
  }

  // Проверка, нужно ли логировать
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL,
    ];

    const minLevelIndex = levels.indexOf(this.minLevel);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex >= minLevelIndex;
  }

  // Логирование в консоль
  private logToConsoleImpl(entry: LogEntry) {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level}] [${entry.type}]`;

    let message = `${prefix} ${entry.message}`;

    if (entry.userId) {
      message += ` | User: ${entry.userId}`;
    }

    if (entry.username) {
      message += ` (${entry.username})`;
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        if (entry.error) {
          console.error(entry.error);
        }
        break;
    }

    if (
      entry.data &&
      entry.level !== LogLevel.ERROR &&
      entry.level !== LogLevel.FATAL
    ) {
      console.log("Additional data:", entry.data);
    }
  }

  // Логирование в файл (заглушка)
  private logToFileImpl(/* entry: LogEntry */) {
    // Реализация логирования в файл
    // Будет добавлена позже
  }

  // Логирование в базу данных (заглушка)
  private logToDatabaseImpl(/* entry: LogEntry */) {
    // Реализация логирования в базу данных
    // Будет добавлена позже
  }

  // Вспомогательные методы для разных уровней логирования

  public debug(
    message: string,
    options?: Omit<LogEntry, "timestamp" | "level" | "message">
  ) {
    this.log({
      level: LogLevel.DEBUG,
      type: options?.type || LogType.SYSTEM,
      message,
      ...options,
    });
  }

  public info(
    message: string,
    options?: Omit<LogEntry, "timestamp" | "level" | "message">
  ) {
    this.log({
      level: LogLevel.INFO,
      type: options?.type || LogType.SYSTEM,
      message,
      ...options,
    });
  }

  public warn(
    message: string,
    options?: Omit<LogEntry, "timestamp" | "level" | "message">
  ) {
    this.log({
      level: LogLevel.WARN,
      type: options?.type || LogType.SYSTEM,
      message,
      ...options,
    });
  }

  public error(
    message: string,
    options?: Omit<LogEntry, "timestamp" | "level" | "message">
  ) {
    this.log({
      level: LogLevel.ERROR,
      type: options?.type || LogType.ERROR,
      message,
      ...options,
    });
  }

  public fatal(
    message: string,
    options?: Omit<LogEntry, "timestamp" | "level" | "message">
  ) {
    this.log({
      level: LogLevel.FATAL,
      type: options?.type || LogType.ERROR,
      message,
      ...options,
    });
  }

  // Логирование действий пользователя
  public userAction(
    message: string,
    options?: Omit<LogEntry, "timestamp" | "level" | "type" | "message">
  ) {
    this.log({
      level: LogLevel.INFO,
      type: LogType.USER_ACTION,
      message,
      ...options,
    });
  }

  // Логирование действий бота
  public botAction(
    message: string,
    options?: Omit<LogEntry, "timestamp" | "level" | "type" | "message">
  ) {
    this.log({
      level: LogLevel.INFO,
      type: LogType.SYSTEM,
      message,
      ...options,
    });
  }
}

// Экспортируем экземпляр логгера
export const logger = Logger.getInstance();
