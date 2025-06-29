// 🎨 Carousel Generation Service
// Microservice for generating Instagram carousels with functional event-driven architecture

import express from 'express';
import { randomUUID } from 'crypto';
import {
  FunctionalEventBus,
  createDefaultEventBusConfig,
  createFunctionalEventBus,
  createSuccessResult,
  createErrorResult,
  createEventError,
} from '../../../shared/utils/event-bus.js';
import {
  EventTypes,
  CarouselEvents,
  AIContentEvents,
} from '../../../shared/events/index.js';

// 🎯 Service Configuration
interface CarouselServiceConfig {
  readonly port: number;
  readonly serviceName: string;
  readonly aiServiceUrl?: string;
  readonly maxSlidesPerCarousel: number;
  readonly defaultStyle: 'minimal' | 'vibrant' | 'professional';
  readonly supportedLanguages: readonly string[];
}

const createCarouselServiceConfig = (): CarouselServiceConfig => ({
  port: parseInt(process.env.CAROUSEL_SERVICE_PORT || '3001'),
  serviceName: 'carousel-generator',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:3002',
  maxSlidesPerCarousel: 10,
  defaultStyle: 'vibrant',
  supportedLanguages: ['ru', 'en'] as const,
});

// 🎨 Carousel Generation Logic (Pure Functions)
export const validateCarouselRequest = (
  data: CarouselEvents.GenerateRequested
): { success: boolean; error?: string } => {
  if (!data.topic?.trim()) {
    return { success: false, error: 'Topic is required' };
  }

  if (data.topic.length > 200) {
    return { success: false, error: 'Topic is too long (max 200 characters)' };
  }

  if (data.slidesCount < 1 || data.slidesCount > 15) {
    return { success: false, error: 'Slides count must be between 1 and 15' };
  }

  return { success: true };
};

export const createCarouselRequestId = (): string => randomUUID();

export const generateSlideStructure = (
  content: CarouselEvents.ContentAnalyzed
): readonly CarouselEvents.CarouselSlide[] => {
  const slides: CarouselEvents.CarouselSlide[] = [];

  // Title slide
  slides.push({
    id: randomUUID(),
    type: 'title',
    title: content.extractedContent.title,
    content: `🕉️ ${content.extractedContent.title}\\n\\n📱 Свайпни для изучения →`,
    backgroundStyle: 'gradient-primary',
    textStyle: {
      fontSize: 24,
      fontFamily: 'Inter',
      color: '#FFFFFF',
      alignment: 'center',
    },
  });

  // Principle slides
  content.extractedContent.principles.slice(0, 4).forEach(principle => {
    slides.push({
      id: randomUUID(),
      type: 'principle',
      title: 'Принцип',
      content: `💡 ${principle}`,
      backgroundStyle: 'gradient-principle',
      textStyle: {
        fontSize: 18,
        fontFamily: 'Inter',
        color: '#1F2937',
        alignment: 'left',
      },
    });
  });

  // Quote slides
  content.extractedContent.quotes.slice(0, 3).forEach(quote => {
    slides.push({
      id: randomUUID(),
      type: 'quote',
      title: 'Мудрость',
      content: `"${quote}"\\n\\n— Из документации VIBECODING`,
      backgroundStyle: 'gradient-quote',
      textStyle: {
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#374151',
        alignment: 'center',
      },
    });
  });

  // Concept slides
  content.extractedContent.concepts.slice(0, 2).forEach(concept => {
    slides.push({
      id: randomUUID(),
      type: 'concept',
      title: 'Концепция',
      content: `🎯 ${concept}`,
      backgroundStyle: 'gradient-concept',
      textStyle: {
        fontSize: 17,
        fontFamily: 'Inter',
        color: '#1F2937',
        alignment: 'left',
      },
    });
  });

  // Summary slide
  if (slides.length > 1) {
    slides.push({
      id: randomUUID(),
      type: 'summary',
      title: 'Заключение',
      content: `✨ Применяй эти принципы в своей практике\\n\\n🔄 Делись с сообществом\\n\\n🙏 Путь к мастерству через осознание`,
      backgroundStyle: 'gradient-summary',
      textStyle: {
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#FFFFFF',
        alignment: 'center',
      },
    });
  }

  return slides.slice(0, 10); // Limit to max slides
};

// 🎯 Event Handlers (Pure Functions)
export const handleCarouselGenerateRequested = async (
  event: any,
  eventBus: FunctionalEventBus,
  config: CarouselServiceConfig
) => {
  const data = event.data as CarouselEvents.GenerateRequested;

  // Validate request
  const validation = validateCarouselRequest(data);
  if (!validation.success) {
    await eventBus.emit(EventTypes.ALERT_TRIGGERED, {
      alertId: randomUUID(),
      severity: 'warning' as const,
      message: `Invalid carousel request: ${validation.error}`,
      source: config.serviceName,
      metadata: { requestId: data.requestId, userId: data.userId },
    });

    return createErrorResult(
      createEventError('VALIDATION_ERROR', validation.error!, false)
    );
  }

  console.log(`🎨 Processing carousel request for topic: "${data.topic}"`);

  // Emit analytics event
  await eventBus.emit(EventTypes.USER_INTERACTION_TRACKED, {
    userId: data.userId,
    action: 'carousel_generation_started',
    context: {
      topic: data.topic,
      requestId: data.requestId,
      slidesCount: data.slidesCount,
    },
    timestamp: new Date(),
  });

  // Request AI content analysis
  await eventBus.emit(EventTypes.AI_CONTENT_REQUESTED, {
    requestId: data.requestId,
    contentType: 'carousel' as const,
    prompt: `Analyze the topic "${data.topic}" for Instagram carousel generation. Extract key principles, quotes, and concepts related to conscious programming and VIBECODING philosophy.`,
    parameters: {
      maxTokens: 2000,
      temperature: 0.7,
      model: 'gpt-4',
    },
  });

  return createSuccessResult({
    status: 'analysis_requested',
    requestId: data.requestId,
  });
};

export const handleAIAnalysisCompleted = async (
  event: any,
  eventBus: FunctionalEventBus,
  _config: CarouselServiceConfig
) => {
  const data = event.data as AIContentEvents.AnalysisCompleted;

  console.log(`🧠 AI analysis completed for request: ${data.requestId}`);

  // Generate carousel structure based on analysis
  const mockContentAnalyzed: CarouselEvents.ContentAnalyzed = {
    requestId: data.requestId,
    topic: 'Mock Topic from Analysis',
    extractedContent: {
      title: data.analysis.summary.slice(0, 50) + '...',
      principles: data.analysis.keyPoints.slice(0, 4),
      quotes: [
        'Сознательное программирование - это путь к гармонии кода и разума',
        'Каждая строка кода - это мантра, каждая функция - медитация',
        'В чистом коде отражается чистота мысли',
      ],
      concepts: data.analysis.topics.slice(0, 3),
      keywords: data.analysis.topics,
    },
    analysisMetadata: {
      tokensUsed: data.metadata.tokensUsed,
      analysisTime: data.metadata.processingTime,
      confidenceScore: data.analysis.confidence,
    },
  };

  // Generate slides
  const slides = generateSlideStructure(mockContentAnalyzed);

  // Emit content analyzed event
  await eventBus.emit(
    EventTypes.CAROUSEL_CONTENT_ANALYZED,
    mockContentAnalyzed
  );

  // Emit slides generated event
  await eventBus.emit(EventTypes.CAROUSEL_SLIDES_GENERATED, {
    requestId: data.requestId,
    slides,
    generationMetadata: {
      totalSlides: slides.length,
      generationTime: 250,
      tokensUsed: 150,
    },
  });

  return createSuccessResult({
    status: 'slides_generated',
    requestId: data.requestId,
    slidesCount: slides.length,
  });
};

export const handleSlidesGenerated = async (
  event: any,
  eventBus: FunctionalEventBus,
  _config: CarouselServiceConfig
) => {
  const data = event.data as CarouselEvents.SlidesGenerated;

  console.log(`🖼️ Generating images for ${data.slides.length} slides`);

  // Mock image rendering (in real implementation, this would call image generation service)
  const images: CarouselEvents.RenderedImage[] = data.slides.map(slide => ({
    slideId: slide.id,
    imageUrl: `https://example.com/carousel-images/${slide.id}.png`,
    localPath: `./generated-images/${slide.id}.png`,
    size: { width: 1080, height: 1080 },
    format: 'png' as const,
    quality: 95,
  }));

  // Simulate image rendering time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Emit images rendered event
  await eventBus.emit(EventTypes.CAROUSEL_IMAGES_RENDERED, {
    requestId: data.requestId,
    images,
    renderingMetadata: {
      totalImages: images.length,
      renderingTime: 1000,
      totalSize: images.length * 1024 * 1024, // Mock 1MB per image
    },
  });

  return createSuccessResult({
    status: 'images_rendered',
    requestId: data.requestId,
    imagesCount: images.length,
  });
};

export const handleImagesRendered = async (
  event: any,
  eventBus: FunctionalEventBus,
  _config: CarouselServiceConfig
) => {
  const data = event.data as CarouselEvents.ImagesRendered;

  console.log(`✅ Carousel completed for request: ${data.requestId}`);

  // Get slides from previous event (in real implementation, this would be stored)
  const mockSlides: CarouselEvents.CarouselSlide[] = []; // Would retrieve from storage

  // Emit carousel completed event
  await eventBus.emit(EventTypes.CAROUSEL_COMPLETED, {
    requestId: data.requestId,
    userId: 'user-from-context', // Would get from context
    chatId: 'chat-from-context', // Would get from context
    success: true,
    carouselData: {
      slides: mockSlides,
      images: data.images,
      totalProcessingTime: 3000, // Mock total time
    },
  });

  // Track completion
  await eventBus.emit(EventTypes.USER_INTERACTION_TRACKED, {
    userId: 'user-from-context',
    action: 'carousel_generation_completed',
    context: {
      requestId: data.requestId,
      imagesCount: data.images.length,
      totalProcessingTime: 3000,
    },
    timestamp: new Date(),
  });

  return createSuccessResult({
    status: 'completed',
    requestId: data.requestId,
  });
};

// 🎯 Service Setup
export const createCarouselGeneratorService = () => {
  const config = createCarouselServiceConfig();
  const eventBusConfig = createDefaultEventBusConfig(config.serviceName);
  const eventBus = createFunctionalEventBus(eventBusConfig);

  // Subscribe to events
  eventBus.subscribe(
    EventTypes.CAROUSEL_GENERATE_REQUESTED,
    event => handleCarouselGenerateRequested(event, eventBus, config),
    10 // High priority
  );

  eventBus.subscribe(
    EventTypes.AI_ANALYSIS_COMPLETED,
    event => handleAIAnalysisCompleted(event, eventBus, config),
    5
  );

  eventBus.subscribe(
    EventTypes.CAROUSEL_SLIDES_GENERATED,
    event => handleSlidesGenerated(event, eventBus, config),
    5
  );

  eventBus.subscribe(
    EventTypes.CAROUSEL_IMAGES_RENDERED,
    event => handleImagesRendered(event, eventBus, config),
    5
  );

  // Create Express app for health checks and API
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    const stats = eventBus.getStats();
    res.json({
      status: 'healthy',
      service: config.serviceName,
      eventBus: {
        isRunning: eventBus.isRunning(),
        totalSubscriptions: stats.totalSubscriptions,
        totalEventsProcessed: stats.totalEventsProcessed,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Stats endpoint
  app.get('/stats', (_req, res) => {
    res.json({
      service: config.serviceName,
      config: {
        maxSlidesPerCarousel: config.maxSlidesPerCarousel,
        defaultStyle: config.defaultStyle,
        supportedLanguages: config.supportedLanguages,
      },
      eventBus: eventBus.getStats(),
    });
  });

  // Start service
  const start = async () => {
    eventBus.start();

    const server = app.listen(config.port, () => {
      console.log(
        `🎨 Carousel Generator Service started on port ${config.port}`
      );
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`📈 Stats: http://localhost:${config.port}/stats`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`🛑 Received ${signal}, shutting down gracefully...`);
      eventBus.stop();
      server.close(() => {
        console.log('🎨 Carousel Generator Service stopped');
        process.exit(0);
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

    return { app, eventBus, config };
  };

  return { start, eventBus, config };
};

// 🚀 Entry Point
if (import.meta.main) {
  const service = createCarouselGeneratorService();
  service.start().catch(error => {
    console.error('❌ Failed to start Carousel Generator Service:', error);
    process.exit(1);
  });
}

export default createCarouselGeneratorService;
