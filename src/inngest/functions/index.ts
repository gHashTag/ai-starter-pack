/**
 * Inngest Functions Registry
 *
 * Центральный реестр всех Inngest функций приложения.
 * Экспортирует все функции для регистрации в сервере.
 */

import { helloWorld } from './hello-world';
import { generateCarousel } from './generate-carousel';
import { vibeCodingBroadcast } from './vibecoding-broadcast';
import {
  vibeCodingResearch,
  vibeCodingQuickAnswer,
} from './vibecoding-research';

/**
 * Массив всех Inngest функций для регистрации
 */
export const functions = [
  helloWorld,
  generateCarousel,
  vibeCodingBroadcast,
  vibeCodingResearch,
  vibeCodingQuickAnswer,
];

/**
 * Экспорт отдельных функций для прямого импорта
 */
export {
  helloWorld,
  generateCarousel,
  vibeCodingBroadcast,
  vibeCodingResearch,
  vibeCodingQuickAnswer,
};

/**
 * Экспорт событий и типов
 */
export {
  HELLO_WORLD_EVENT,
  sendHelloWorldEvent,
  type HelloWorldEventData,
  type HelloWorldResult,
} from './hello-world';

// VibeCoding broadcast экспорты удалены после рефакторинга

/**
 * Экспорт по умолчанию для удобства
 */
export default functions;
