// 🕉️ Functional Event Bus
// Pure functional event-driven communication system

import { randomUUID } from 'crypto';
import {
  EventEnvelope,
  EventResult,
  EventError,
  EventMetadata,
  AllEventData,
} from '../events/index.js';

// 🎯 Core Event Handler Types
export type EventHandler<T = AllEventData> = (
  event: EventEnvelope<T>
) => Promise<EventResult>;

export type EventSubscription = {
  readonly id: string;
  readonly eventType: string;
  readonly handler: EventHandler;
  readonly priority: number;
  readonly enabled: boolean;
};

export type EventBusConfig = {
  readonly serviceName: string;
  readonly environment: 'development' | 'production' | 'test';
  readonly enableLogging: boolean;
  readonly enableMetrics: boolean;
  readonly retryAttempts: number;
  readonly retryDelay: number;
};

// 🌊 Event Bus State (Immutable)
export interface EventBusState {
  readonly subscriptions: ReadonlyMap<string, readonly EventSubscription[]>;
  readonly eventHistory: readonly EventEnvelope[];
  readonly config: EventBusConfig;
  readonly isRunning: boolean;
}

// 🎯 Event Creation Utilities
export const createEvent = <T extends AllEventData>(
  type: string,
  data: T,
  metadata: Partial<EventMetadata> = {}
): EventEnvelope<T> => ({
  id: randomUUID(),
  type,
  timestamp: new Date(),
  source: metadata.source || 'unknown',
  version: '1.0.0',
  data,
  metadata: {
    environment: (process.env.NODE_ENV as any) || 'development',
    ...metadata,
  } as EventMetadata,
});

export const createEventWithCorrelation = <T extends AllEventData>(
  type: string,
  data: T,
  correlationId: string,
  causationId?: string,
  metadata: Partial<EventMetadata> = {}
): EventEnvelope<T> => ({
  ...createEvent(type, data, metadata),
  correlationId,
  causationId,
});

// 🎯 Error Creation Utilities
export const createEventError = (
  code: string,
  message: string,
  retryable: boolean = false,
  details: Record<string, unknown> = {}
): EventError => ({
  code,
  message,
  details,
  retryable,
});

export const createSuccessResult = <T>(
  data?: T,
  metadata?: Record<string, unknown>
): EventResult<T> => ({
  success: true,
  data,
  metadata,
});

export const createErrorResult = (
  error: EventError,
  metadata?: Record<string, unknown>
): EventResult => ({
  success: false,
  error,
  metadata,
});

// 🔧 Pure Event Bus Functions
export const createEventBus = (config: EventBusConfig): EventBusState => ({
  subscriptions: new Map(),
  eventHistory: [],
  config,
  isRunning: false,
});

export const addSubscription = (
  state: EventBusState,
  eventType: string,
  handler: EventHandler,
  priority: number = 0
): EventBusState => {
  const subscription: EventSubscription = {
    id: randomUUID(),
    eventType,
    handler,
    priority,
    enabled: true,
  };

  const existingSubscriptions = state.subscriptions.get(eventType) || [];
  const newSubscriptions = [...existingSubscriptions, subscription].sort(
    (a, b) => b.priority - a.priority
  ); // Higher priority first

  return {
    ...state,
    subscriptions: new Map(state.subscriptions).set(
      eventType,
      newSubscriptions
    ),
  };
};

export const removeSubscription = (
  state: EventBusState,
  subscriptionId: string
): EventBusState => {
  const newSubscriptions = new Map();

  for (const [eventType, subscriptions] of state.subscriptions.entries()) {
    const filtered = subscriptions.filter(sub => sub.id !== subscriptionId);
    if (filtered.length > 0) {
      newSubscriptions.set(eventType, filtered);
    }
  }

  return {
    ...state,
    subscriptions: newSubscriptions,
  };
};

export const getSubscriptions = (
  state: EventBusState,
  eventType: string
): readonly EventSubscription[] => {
  return state.subscriptions.get(eventType) || [];
};

export const getAllSubscriptions = (
  state: EventBusState
): ReadonlyMap<string, readonly EventSubscription[]> => {
  return state.subscriptions;
};

// 🎯 Event Processing Functions
export const processEvent = async (
  state: EventBusState,
  event: EventEnvelope<AllEventData>
): Promise<readonly EventResult[]> => {
  const subscriptions = getSubscriptions(state, event.type);
  const enabledSubscriptions = subscriptions.filter(sub => sub.enabled);

  if (enabledSubscriptions.length === 0) {
    if (state.config.enableLogging) {
      console.warn(`No handlers found for event type: ${event.type}`);
    }
    return [];
  }

  const results: EventResult[] = [];

  for (const subscription of enabledSubscriptions) {
    try {
      const result = await executeWithRetry(
        () => subscription.handler(event as EventEnvelope<AllEventData>),
        state.config.retryAttempts,
        state.config.retryDelay
      );
      results.push(result);
    } catch (error) {
      const eventError = createEventError(
        'HANDLER_EXECUTION_ERROR',
        error instanceof Error ? error.message : String(error),
        true,
        { subscriptionId: subscription.id, eventType: event.type }
      );
      results.push(createErrorResult(eventError));
    }
  }

  return results;
};

export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number,
  delayMs: number
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError!;
};

// 📊 Event History Functions
export const addToHistory = (
  state: EventBusState,
  event: EventEnvelope
): EventBusState => {
  const maxHistorySize = 1000; // Configurable
  const newHistory = [...state.eventHistory, event];

  if (newHistory.length > maxHistorySize) {
    newHistory.shift(); // Remove oldest event
  }

  return {
    ...state,
    eventHistory: newHistory,
  };
};

export const getEventHistory = (
  state: EventBusState,
  filter?: {
    eventType?: string;
    source?: string;
    fromTimestamp?: Date;
    toTimestamp?: Date;
  }
): readonly EventEnvelope[] => {
  let history = state.eventHistory;

  if (filter) {
    history = history.filter(event => {
      if (filter.eventType && event.type !== filter.eventType) return false;
      if (filter.source && event.source !== filter.source) return false;
      if (filter.fromTimestamp && event.timestamp < filter.fromTimestamp)
        return false;
      if (filter.toTimestamp && event.timestamp > filter.toTimestamp)
        return false;
      return true;
    });
  }

  return history;
};

// 🎯 Event Bus Statistics
export const getEventBusStats = (state: EventBusState) => {
  const subscriptionsByType = new Map<string, number>();

  for (const [eventType, subscriptions] of state.subscriptions.entries()) {
    subscriptionsByType.set(eventType, subscriptions.length);
  }

  const eventCountsByType = new Map<string, number>();
  for (const event of state.eventHistory) {
    const count = eventCountsByType.get(event.type) || 0;
    eventCountsByType.set(event.type, count + 1);
  }

  return {
    totalSubscriptions: Array.from(state.subscriptions.values()).reduce(
      (total, subs) => total + subs.length,
      0
    ),
    subscriptionsByType: Object.fromEntries(subscriptionsByType),
    totalEventsProcessed: state.eventHistory.length,
    eventCountsByType: Object.fromEntries(eventCountsByType),
    isRunning: state.isRunning,
  };
};

// 🔄 Event Bus Class Implementation
export class FunctionalEventBus {
  private state: EventBusState;

  constructor(config: EventBusConfig) {
    this.state = createEventBus(config);
  }

  // 🎯 Public API
  public subscribe<T extends AllEventData>(
    eventType: string,
    handler: EventHandler<T>,
    priority: number = 0
  ): string {
    this.state = addSubscription(
      this.state,
      eventType,
      handler as EventHandler,
      priority
    );
    const subscriptions = getSubscriptions(this.state, eventType);
    return subscriptions[subscriptions.length - 1].id;
  }

  public unsubscribe(subscriptionId: string): void {
    this.state = removeSubscription(this.state, subscriptionId);
  }

  public async emit<T extends AllEventData>(
    eventType: string,
    data: T,
    metadata?: Partial<EventMetadata>
  ): Promise<readonly EventResult[]> {
    const event = createEvent(eventType, data, {
      source: this.state.config.serviceName,
      ...metadata,
    });

    this.state = addToHistory(this.state, event);

    if (this.state.config.enableLogging) {
      console.log(`[EventBus] Emitting event: ${eventType}`, {
        eventId: event.id,
      });
    }

    return await processEvent(this.state, event);
  }

  public async emitWithCorrelation<T extends AllEventData>(
    eventType: string,
    data: T,
    correlationId: string,
    causationId?: string,
    metadata?: Partial<EventMetadata>
  ): Promise<readonly EventResult[]> {
    const event = createEventWithCorrelation(
      eventType,
      data,
      correlationId,
      causationId,
      { source: this.state.config.serviceName, ...metadata }
    );

    this.state = addToHistory(this.state, event);

    if (this.state.config.enableLogging) {
      console.log(`[EventBus] Emitting correlated event: ${eventType}`, {
        eventId: event.id,
        correlationId,
      });
    }

    return await processEvent(this.state, event);
  }

  public getHistory(filter?: Parameters<typeof getEventHistory>[1]) {
    return getEventHistory(this.state, filter);
  }

  public getStats() {
    return getEventBusStats(this.state);
  }

  public getSubscriptionsForEvent(eventType: string) {
    return getSubscriptions(this.state, eventType);
  }

  public getAllSubscriptions() {
    return getAllSubscriptions(this.state);
  }

  public start(): void {
    this.state = { ...this.state, isRunning: true };
    if (this.state.config.enableLogging) {
      console.log(
        `[EventBus] Started for service: ${this.state.config.serviceName}`
      );
    }
  }

  public stop(): void {
    this.state = { ...this.state, isRunning: false };
    if (this.state.config.enableLogging) {
      console.log(
        `[EventBus] Stopped for service: ${this.state.config.serviceName}`
      );
    }
  }

  public isRunning(): boolean {
    return this.state.isRunning;
  }
}

// 🎯 Factory Function
export const createFunctionalEventBus = (
  config: EventBusConfig
): FunctionalEventBus => {
  return new FunctionalEventBus(config);
};

// 🎯 Default Configuration
export const createDefaultEventBusConfig = (
  serviceName: string
): EventBusConfig => ({
  serviceName,
  environment: (process.env.NODE_ENV as any) || 'development',
  enableLogging: process.env.NODE_ENV !== 'production',
  enableMetrics: true,
  retryAttempts: 3,
  retryDelay: 1000,
});

// 🕉️ Wisdom: "सर्वे भवन्तु सुखिनः" - "May all beings be happy"
// Events connect all services in harmonious communication
