/**
 * Inngest Module - Main Export
 *
 * Основной модуль для работы с Inngest в приложении Bible VibeCoder.
 * Предоставляет все необходимые компоненты для работы с Inngest функциями.
 */

// Клиент и конфигурация
export {
  inngest,
  INNGEST_PORTS,
  getInngestUrls,
  checkPortAvailability,
} from './client';

// Сервер и обработчики
export { inngestHandler, inngestConfig, startInngestServer } from './server';

// Функции и события
export {
  functions,
  helloWorld as helloWorldFunction,
  HELLO_WORLD_EVENT,
  sendHelloWorldEvent,
  type HelloWorldEventData,
  type HelloWorldResult,
} from './functions';

/**
 * Экспорт по умолчанию для удобства импорта
 */
export { inngest as default } from './client';
