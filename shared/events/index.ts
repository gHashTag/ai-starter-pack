// 🕉️ Shared Event Types for Microservices
// Pure functional event definitions for cross-service communication

// 🌊 Core Event Envelope
export interface EventEnvelope<T = unknown> {
  readonly id: string;
  readonly type: string;
  readonly timestamp: Date;
  readonly source: string;
  readonly version: string;
  readonly data: T;
  readonly metadata: EventMetadata;
  readonly correlationId?: string;
  readonly causationId?: string;
}

// 📊 Event Metadata
export interface EventMetadata {
  readonly userId?: string;
  readonly sessionId?: string;
  readonly requestId?: string;
  readonly source: string;
  readonly environment: 'development' | 'production' | 'test';
  readonly traceId?: string;
  readonly spanId?: string;
}

// 🎯 Event Result Types
export interface EventResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: EventError;
  readonly metadata?: Record<string, unknown>;
}

export interface EventError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;
}

// 📱 Telegram Gateway Events
export namespace TelegramGatewayEvents {
  export interface UserMessageReceived {
    readonly userId: string;
    readonly chatId: string;
    readonly messageId: string;
    readonly text: string;
    readonly messageType:
      | 'text'
      | 'command'
      | 'callback'
      | 'photo'
      | 'document';
    readonly from: {
      readonly id: number;
      readonly username?: string;
      readonly firstName?: string;
      readonly lastName?: string;
    };
  }

  export interface CommandExecuted {
    readonly command: string;
    readonly args: readonly string[];
    readonly userId: string;
    readonly chatId: string;
    readonly success: boolean;
    readonly executionTime: number;
  }

  export interface UserSessionCreated {
    readonly userId: string;
    readonly sessionId: string;
    readonly userProfile: {
      readonly telegramId: number;
      readonly username?: string;
      readonly firstName?: string;
      readonly lastName?: string;
    };
  }

  export interface BotResponseSent {
    readonly userId: string;
    readonly chatId: string;
    readonly messageId: string;
    readonly responseType: 'text' | 'photo' | 'carousel' | 'keyboard';
    readonly success: boolean;
  }
}

// 🎨 Carousel Generation Events
export namespace CarouselEvents {
  export interface GenerateRequested {
    readonly requestId: string;
    readonly userId: string;
    readonly chatId: string;
    readonly messageId: string;
    readonly topic: string;
    readonly slidesCount: number;
    readonly style?: 'minimal' | 'vibrant' | 'professional';
    readonly language: 'ru' | 'en';
  }

  export interface ContentAnalyzed {
    readonly requestId: string;
    readonly topic: string;
    readonly extractedContent: {
      readonly title: string;
      readonly principles: readonly string[];
      readonly quotes: readonly string[];
      readonly concepts: readonly string[];
      readonly keywords: readonly string[];
    };
    readonly analysisMetadata: {
      readonly tokensUsed: number;
      readonly analysisTime: number;
      readonly confidenceScore: number;
    };
  }

  export interface SlidesGenerated {
    readonly requestId: string;
    readonly slides: readonly CarouselSlide[];
    readonly generationMetadata: {
      readonly totalSlides: number;
      readonly generationTime: number;
      readonly tokensUsed: number;
    };
  }

  export interface ImagesRendered {
    readonly requestId: string;
    readonly images: readonly RenderedImage[];
    readonly renderingMetadata: {
      readonly totalImages: number;
      readonly renderingTime: number;
      readonly totalSize: number;
    };
  }

  export interface CarouselCompleted {
    readonly requestId: string;
    readonly userId: string;
    readonly chatId: string;
    readonly success: boolean;
    readonly carouselData: {
      readonly slides: readonly CarouselSlide[];
      readonly images: readonly RenderedImage[];
      readonly totalProcessingTime: number;
    };
  }

  export interface CarouselSlide {
    readonly id: string;
    readonly type: 'title' | 'principle' | 'quote' | 'concept' | 'summary';
    readonly title: string;
    readonly content: string;
    readonly backgroundStyle: string;
    readonly textStyle: {
      readonly fontSize: number;
      readonly fontFamily: string;
      readonly color: string;
      readonly alignment: 'left' | 'center' | 'right';
    };
  }

  export interface RenderedImage {
    readonly slideId: string;
    readonly imageUrl: string;
    readonly localPath?: string;
    readonly size: { readonly width: number; readonly height: number };
    readonly format: 'png' | 'jpg' | 'webp';
    readonly quality: number;
  }
}

// 🧠 AI Content Service Events
export namespace AIContentEvents {
  export interface ContentRequested {
    readonly requestId: string;
    readonly contentType: 'wisdom' | 'analysis' | 'carousel' | 'summary';
    readonly prompt: string;
    readonly parameters: {
      readonly maxTokens?: number;
      readonly temperature?: number;
      readonly model?: string;
    };
  }

  export interface AnalysisCompleted {
    readonly requestId: string;
    readonly inputText: string;
    readonly analysis: {
      readonly summary: string;
      readonly keyPoints: readonly string[];
      readonly sentiment: 'positive' | 'neutral' | 'negative';
      readonly topics: readonly string[];
      readonly confidence: number;
    };
    readonly metadata: {
      readonly model: string;
      readonly tokensUsed: number;
      readonly processingTime: number;
    };
  }

  export interface WisdomGenerated {
    readonly requestId: string;
    readonly category: 'daily' | 'random' | 'contextual';
    readonly wisdom: {
      readonly text: string;
      readonly source: string;
      readonly translation?: string;
      readonly explanation?: string;
    };
  }
}

// 💾 Data Persistence Events
export namespace DataPersistenceEvents {
  export interface UserCreated {
    readonly userId: string;
    readonly userProfile: {
      readonly telegramId: number;
      readonly username?: string;
      readonly firstName?: string;
      readonly lastName?: string;
      readonly createdAt: Date;
    };
  }

  export interface UserUpdated {
    readonly userId: string;
    readonly changes: Record<string, unknown>;
    readonly previousValues: Record<string, unknown>;
  }

  export interface SessionSaved {
    readonly sessionId: string;
    readonly userId: string;
    readonly sessionData: Record<string, unknown>;
    readonly expiresAt: Date;
  }

  export interface HistoryLogged {
    readonly userId: string;
    readonly action: string;
    readonly details: Record<string, unknown>;
    readonly timestamp: Date;
  }

  export interface CarouselSaved {
    readonly carouselId: string;
    readonly userId: string;
    readonly topic: string;
    readonly slides: readonly CarouselEvents.CarouselSlide[];
    readonly metadata: Record<string, unknown>;
  }
}

// 📊 Analytics Events
export namespace AnalyticsEvents {
  export interface MetricsCollected {
    readonly source: string;
    readonly metrics: readonly Metric[];
    readonly timestamp: Date;
  }

  export interface HealthChecked {
    readonly service: string;
    readonly status: 'healthy' | 'degraded' | 'unhealthy';
    readonly responseTime: number;
    readonly details: Record<string, unknown>;
  }

  export interface AlertTriggered {
    readonly alertId: string;
    readonly severity: 'info' | 'warning' | 'error' | 'critical';
    readonly message: string;
    readonly source: string;
    readonly metadata: Record<string, unknown>;
  }

  export interface UserInteractionTracked {
    readonly userId: string;
    readonly action: string;
    readonly context: Record<string, unknown>;
    readonly timestamp: Date;
  }

  export interface Metric {
    readonly name: string;
    readonly value: number;
    readonly unit: string;
    readonly tags: Record<string, string>;
  }
}

// 🔄 Workflow Events
export namespace WorkflowEvents {
  export interface WorkflowStarted {
    readonly workflowId: string;
    readonly type: string;
    readonly initiator: string;
    readonly parameters: Record<string, unknown>;
  }

  export interface WorkflowStepCompleted {
    readonly workflowId: string;
    readonly stepId: string;
    readonly stepName: string;
    readonly success: boolean;
    readonly result?: unknown;
    readonly error?: EventError;
    readonly duration: number;
  }

  export interface WorkflowCompleted {
    readonly workflowId: string;
    readonly success: boolean;
    readonly result?: unknown;
    readonly error?: EventError;
    readonly totalDuration: number;
    readonly stepsExecuted: number;
  }

  export interface EventRouted {
    readonly eventId: string;
    readonly eventType: string;
    readonly sourceService: string;
    readonly targetServices: readonly string[];
    readonly routingDecision: string;
  }
}

// 🎯 Union Type for All Events
export type AllEventData =
  | TelegramGatewayEvents.UserMessageReceived
  | TelegramGatewayEvents.CommandExecuted
  | TelegramGatewayEvents.UserSessionCreated
  | TelegramGatewayEvents.BotResponseSent
  | CarouselEvents.GenerateRequested
  | CarouselEvents.ContentAnalyzed
  | CarouselEvents.SlidesGenerated
  | CarouselEvents.ImagesRendered
  | CarouselEvents.CarouselCompleted
  | AIContentEvents.ContentRequested
  | AIContentEvents.AnalysisCompleted
  | AIContentEvents.WisdomGenerated
  | DataPersistenceEvents.UserCreated
  | DataPersistenceEvents.UserUpdated
  | DataPersistenceEvents.SessionSaved
  | DataPersistenceEvents.HistoryLogged
  | DataPersistenceEvents.CarouselSaved
  | AnalyticsEvents.MetricsCollected
  | AnalyticsEvents.HealthChecked
  | AnalyticsEvents.AlertTriggered
  | AnalyticsEvents.UserInteractionTracked
  | WorkflowEvents.WorkflowStarted
  | WorkflowEvents.WorkflowStepCompleted
  | WorkflowEvents.WorkflowCompleted
  | WorkflowEvents.EventRouted;

// 📋 Event Type Constants
export const EventTypes = {
  // Telegram Gateway
  USER_MESSAGE_RECEIVED: 'telegram.user.message.received',
  COMMAND_EXECUTED: 'telegram.command.executed',
  USER_SESSION_CREATED: 'telegram.user.session.created',
  BOT_RESPONSE_SENT: 'telegram.bot.response.sent',

  // Carousel Generation
  CAROUSEL_GENERATE_REQUESTED: 'carousel.generate.requested',
  CAROUSEL_CONTENT_ANALYZED: 'carousel.content.analyzed',
  CAROUSEL_SLIDES_GENERATED: 'carousel.slides.generated',
  CAROUSEL_IMAGES_RENDERED: 'carousel.images.rendered',
  CAROUSEL_COMPLETED: 'carousel.completed',

  // AI Content
  AI_CONTENT_REQUESTED: 'ai.content.requested',
  AI_ANALYSIS_COMPLETED: 'ai.analysis.completed',
  AI_WISDOM_GENERATED: 'ai.wisdom.generated',

  // Data Persistence
  USER_CREATED: 'data.user.created',
  USER_UPDATED: 'data.user.updated',
  SESSION_SAVED: 'data.session.saved',
  HISTORY_LOGGED: 'data.history.logged',
  CAROUSEL_SAVED: 'data.carousel.saved',

  // Analytics
  METRICS_COLLECTED: 'analytics.metrics.collected',
  HEALTH_CHECKED: 'analytics.health.checked',
  ALERT_TRIGGERED: 'analytics.alert.triggered',
  USER_INTERACTION_TRACKED: 'analytics.user.interaction.tracked',

  // Workflow
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_STEP_COMPLETED: 'workflow.step.completed',
  WORKFLOW_COMPLETED: 'workflow.completed',
  EVENT_ROUTED: 'workflow.event.routed',
} as const;

// 🎯 Event Type Guards
export const isCarouselEvent = (eventType: string): boolean =>
  eventType.startsWith('carousel.');

export const isTelegramEvent = (eventType: string): boolean =>
  eventType.startsWith('telegram.');

export const isAIEvent = (eventType: string): boolean =>
  eventType.startsWith('ai.');

export const isDataEvent = (eventType: string): boolean =>
  eventType.startsWith('data.');

export const isAnalyticsEvent = (eventType: string): boolean =>
  eventType.startsWith('analytics.');

export const isWorkflowEvent = (eventType: string): boolean =>
  eventType.startsWith('workflow.');
