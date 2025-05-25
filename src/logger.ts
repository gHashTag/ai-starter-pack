// Реэкспортируем логгер из utils/logger для удобства
import { logger as utilsLogger, LogLevel, LogType } from "./utils/logger";

// Экспортируем логгер и типы для внешнего использования
export const logger = utilsLogger;
export { LogLevel, LogType };
