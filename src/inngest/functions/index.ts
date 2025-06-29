/**
 * Inngest Functions Registry
 *
 * Центральный реестр всех Inngest функций приложения.
 * Экспортирует все функции для регистрации в сервере.
 */

import { helloWorld } from './hello-world';
import { generateCarousel } from './generate-carousel';

/**
 * Массив всех Inngest функций для регистрации
 */
export const functions = [
  helloWorld,
  generateCarousel,
  // Здесь будут добавляться новые функции
] as const;

/**
 * Именованные экспорты функций для прямого импорта
 */
export { helloWorld };
export { generateCarousel };

/**
 * Экспорт событий и типов
 */
export {
  HELLO_WORLD_EVENT,
  sendHelloWorldEvent,
  type HelloWorldEventData,
  type HelloWorldResult,
} from './hello-world';

/**
 * Экспорт по умолчанию для удобства
 */
export default functions;
