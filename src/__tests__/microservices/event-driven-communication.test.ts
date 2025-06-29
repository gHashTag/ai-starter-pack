// 🕉️ Event-Driven Microservices Communication Tests
// Testing functional event communication between services

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  FunctionalEventBus,
  createFunctionalEventBus,
  createDefaultEventBusConfig,
  createSuccessResult,
} from '../../../shared/utils/event-bus.js';
import { EventTypes, CarouselEvents } from '../../../shared/events/index.js';

describe('🌐 Microservices Event-Driven Communication', () => {
  let eventBus: FunctionalEventBus;
  let receivedEvents: any[] = [];

  beforeEach(() => {
    eventBus = createFunctionalEventBus(
      createDefaultEventBusConfig('test-service')
    );
    eventBus.start();
    receivedEvents = [];
  });

  afterEach(() => {
    eventBus.stop();
  });

  describe('🎯 Event Bus Functionality', () => {
    it('should create and start event bus successfully', () => {
      expect(eventBus.isRunning()).toBe(true);

      const stats = eventBus.getStats();
      expect(stats.isRunning).toBe(true);
      expect(stats.totalSubscriptions).toBe(0);
      expect(stats.totalEventsProcessed).toBe(0);
    });

    it('should subscribe to events and handle them', async () => {
      // Subscribe to carousel generation events
      const subscriptionId = eventBus.subscribe(
        EventTypes.CAROUSEL_GENERATE_REQUESTED,
        async event => {
          receivedEvents.push(event);
          return createSuccessResult({ handled: true });
        }
      );

      expect(subscriptionId).toBeDefined();

      const stats = eventBus.getStats();
      expect(stats.totalSubscriptions).toBe(1);
    });

    it('should emit and process events correctly', async () => {
      // Subscribe to event
      eventBus.subscribe(
        EventTypes.CAROUSEL_GENERATE_REQUESTED,
        async event => {
          receivedEvents.push(event);
          const carouselData = event.data as CarouselEvents.GenerateRequested;
          return createSuccessResult({
            status: 'processed',
            requestId: carouselData.requestId,
          });
        }
      );

      // Emit event
      const carouselRequest: CarouselEvents.GenerateRequested = {
        requestId: 'test-request-123',
        userId: 'user-456',
        chatId: 'chat-789',
        messageId: 'msg-101112',
        topic: 'Functional Programming with TypeScript',
        slidesCount: 8,
        language: 'ru',
      };

      const results = await eventBus.emit(
        EventTypes.CAROUSEL_GENERATE_REQUESTED,
        carouselRequest
      );

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].data).toEqual({
        status: 'processed',
        requestId: 'test-request-123',
      });

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].data.topic).toBe(
        'Functional Programming with TypeScript'
      );
    });
  });

  describe('🎨 Carousel Generation Workflow', () => {
    it('should process carousel generation workflow end-to-end', async () => {
      const workflowEvents: any[] = [];

      // Subscribe to all carousel events
      eventBus.subscribe(
        EventTypes.CAROUSEL_GENERATE_REQUESTED,
        async event => {
          const carouselData = event.data as CarouselEvents.GenerateRequested;
          workflowEvents.push({ type: 'REQUEST', data: event.data });

          // Simulate AI content request
          await eventBus.emit(EventTypes.AI_CONTENT_REQUESTED, {
            requestId: carouselData.requestId,
            contentType: 'carousel' as const,
            prompt: `Analyze topic: ${carouselData.topic}`,
            parameters: { maxTokens: 1000, temperature: 0.7 },
          });

          return createSuccessResult({ status: 'ai_analysis_requested' });
        }
      );

      eventBus.subscribe(EventTypes.AI_CONTENT_REQUESTED, async event => {
        const aiData = event.data as any; // AI Content Request type
        workflowEvents.push({ type: 'AI_REQUEST', data: event.data });

        // Simulate AI analysis completion
        await eventBus.emit(EventTypes.AI_ANALYSIS_COMPLETED, {
          requestId: aiData.requestId,
          inputText: aiData.prompt,
          analysis: {
            summary:
              'Functional programming emphasizes immutability and pure functions',
            keyPoints: [
              'Pure functions have no side effects',
              'Immutable data structures prevent bugs',
              'Function composition enables reusability',
            ],
            sentiment: 'positive' as const,
            topics: ['functional-programming', 'typescript', 'immutability'],
            confidence: 0.95,
          },
          metadata: {
            model: 'gpt-4',
            tokensUsed: 150,
            processingTime: 1500,
          },
        });

        return createSuccessResult({ status: 'analysis_completed' });
      });

      eventBus.subscribe(EventTypes.AI_ANALYSIS_COMPLETED, async event => {
        const analysisData = event.data as any; // AI Analysis Complete type
        workflowEvents.push({ type: 'AI_ANALYSIS', data: event.data });

        // Simulate slides generation
        const slides: CarouselEvents.CarouselSlide[] = [
          {
            id: 'slide-1',
            type: 'title',
            title: 'Functional Programming',
            content:
              '🕉️ Functional Programming with TypeScript\\n\\n📱 Swipe to learn →',
            backgroundStyle: 'gradient-primary',
            textStyle: {
              fontSize: 24,
              fontFamily: 'Inter',
              color: '#FFFFFF',
              alignment: 'center',
            },
          },
          {
            id: 'slide-2',
            type: 'principle',
            title: 'Pure Functions',
            content: '💡 Pure functions have no side effects',
            backgroundStyle: 'gradient-principle',
            textStyle: {
              fontSize: 18,
              fontFamily: 'Inter',
              color: '#1F2937',
              alignment: 'left',
            },
          },
        ];

        await eventBus.emit(EventTypes.CAROUSEL_SLIDES_GENERATED, {
          requestId: analysisData.requestId,
          slides,
          generationMetadata: {
            totalSlides: slides.length,
            generationTime: 250,
            tokensUsed: 50,
          },
        });

        return createSuccessResult({ status: 'slides_generated' });
      });

      eventBus.subscribe(EventTypes.CAROUSEL_SLIDES_GENERATED, async event => {
        const slidesData = event.data as CarouselEvents.SlidesGenerated;
        workflowEvents.push({ type: 'SLIDES_GENERATED', data: event.data });

        // Simulate image rendering
        const images: CarouselEvents.RenderedImage[] = slidesData.slides.map(
          (slide: CarouselEvents.CarouselSlide) => ({
            slideId: slide.id,
            imageUrl: `https://example.com/images/${slide.id}.png`,
            size: { width: 1080, height: 1080 },
            format: 'png' as const,
            quality: 95,
          })
        );

        await eventBus.emit(EventTypes.CAROUSEL_IMAGES_RENDERED, {
          requestId: slidesData.requestId,
          images,
          renderingMetadata: {
            totalImages: images.length,
            renderingTime: 1000,
            totalSize: images.length * 1024 * 1024,
          },
        });

        return createSuccessResult({ status: 'images_rendered' });
      });

      eventBus.subscribe(EventTypes.CAROUSEL_IMAGES_RENDERED, async event => {
        const imagesData = event.data as CarouselEvents.ImagesRendered;
        workflowEvents.push({ type: 'IMAGES_RENDERED', data: event.data });

        // Complete the workflow
        await eventBus.emit(EventTypes.CAROUSEL_COMPLETED, {
          requestId: imagesData.requestId,
          userId: 'user-456',
          chatId: 'chat-789',
          success: true,
          carouselData: {
            slides: [], // Would contain actual slides
            images: imagesData.images,
            totalProcessingTime: 3000,
          },
        });

        return createSuccessResult({ status: 'workflow_completed' });
      });

      eventBus.subscribe(EventTypes.CAROUSEL_COMPLETED, async event => {
        workflowEvents.push({ type: 'COMPLETED', data: event.data });
        return createSuccessResult({ status: 'final_step_completed' });
      });

      // Start the workflow
      const carouselRequest: CarouselEvents.GenerateRequested = {
        requestId: 'workflow-test-123',
        userId: 'user-456',
        chatId: 'chat-789',
        messageId: 'msg-101112',
        topic: 'Functional Programming with TypeScript',
        slidesCount: 5,
        language: 'ru',
      };

      await eventBus.emit(
        EventTypes.CAROUSEL_GENERATE_REQUESTED,
        carouselRequest
      );

      // Wait a bit for all async events to process
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify workflow execution
      expect(workflowEvents).toHaveLength(6);

      const eventTypes = workflowEvents.map(e => e.type);
      expect(eventTypes).toEqual([
        'REQUEST',
        'AI_REQUEST',
        'AI_ANALYSIS',
        'SLIDES_GENERATED',
        'IMAGES_RENDERED',
        'COMPLETED',
      ]);

      // Verify data flow
      const requestId = 'workflow-test-123';
      workflowEvents.forEach(event => {
        expect(event.data.requestId).toBe(requestId);
      });
    });
  });

  describe('📊 Analytics and Monitoring', () => {
    it('should track user interactions', async () => {
      const analyticsEvents: any[] = [];

      eventBus.subscribe(EventTypes.USER_INTERACTION_TRACKED, async event => {
        analyticsEvents.push(event.data);
        return createSuccessResult({ tracked: true });
      });

      // Emit user interaction event
      await eventBus.emit(EventTypes.USER_INTERACTION_TRACKED, {
        userId: 'user-789',
        action: 'carousel_generation_started',
        context: {
          topic: 'Advanced TypeScript Patterns',
          requestId: 'req-456',
          slidesCount: 7,
        },
        timestamp: new Date(),
      });

      expect(analyticsEvents).toHaveLength(1);
      expect(analyticsEvents[0].action).toBe('carousel_generation_started');
      expect(analyticsEvents[0].context.topic).toBe(
        'Advanced TypeScript Patterns'
      );
    });

    it('should handle health checks', async () => {
      const healthEvents: any[] = [];

      eventBus.subscribe(EventTypes.HEALTH_CHECKED, async event => {
        healthEvents.push(event.data);
        return createSuccessResult({ health_recorded: true });
      });

      await eventBus.emit(EventTypes.HEALTH_CHECKED, {
        service: 'carousel-generator',
        status: 'healthy' as const,
        responseTime: 45,
        details: { memory: '120MB', cpu: '15%' },
      });

      expect(healthEvents).toHaveLength(1);
      expect(healthEvents[0].service).toBe('carousel-generator');
      expect(healthEvents[0].status).toBe('healthy');
    });
  });

  describe('🔄 Error Handling', () => {
    it('should handle failed event processing gracefully', async () => {
      // Subscribe with a handler that throws an error
      eventBus.subscribe(
        EventTypes.CAROUSEL_GENERATE_REQUESTED,
        async _event => {
          throw new Error('Simulated processing error');
        }
      );

      const results = await eventBus.emit(
        EventTypes.CAROUSEL_GENERATE_REQUESTED,
        {
          requestId: 'error-test-123',
          userId: 'user-456',
          chatId: 'chat-789',
          messageId: 'msg-101112',
          topic: 'Error Testing',
          slidesCount: 3,
          language: 'ru',
        }
      );

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error?.code).toBe('HANDLER_EXECUTION_ERROR');
      expect(results[0].error?.message).toBe('Simulated processing error');
    });

    it('should emit alert events for failures', async () => {
      const alertEvents: any[] = [];

      eventBus.subscribe(EventTypes.ALERT_TRIGGERED, async event => {
        alertEvents.push(event.data);
        return createSuccessResult({ alert_processed: true });
      });

      await eventBus.emit(EventTypes.ALERT_TRIGGERED, {
        alertId: 'alert-123',
        severity: 'error' as const,
        message: 'Service carousel-generator is experiencing high error rate',
        source: 'monitoring-system',
        metadata: {
          service: 'carousel-generator',
          errorRate: '25%',
          threshold: '5%',
        },
      });

      expect(alertEvents).toHaveLength(1);
      expect(alertEvents[0].severity).toBe('error');
      expect(alertEvents[0].source).toBe('monitoring-system');
    });
  });

  describe('🕉️ Event Bus Statistics', () => {
    it('should provide accurate statistics', async () => {
      // Subscribe to multiple events
      eventBus.subscribe(EventTypes.CAROUSEL_GENERATE_REQUESTED, async () =>
        createSuccessResult()
      );
      eventBus.subscribe(EventTypes.CAROUSEL_GENERATE_REQUESTED, async () =>
        createSuccessResult()
      );
      eventBus.subscribe(EventTypes.AI_CONTENT_REQUESTED, async () =>
        createSuccessResult()
      );

      // Emit some events
      await eventBus.emit(EventTypes.CAROUSEL_GENERATE_REQUESTED, {
        requestId: 'stats-test-1',
        userId: 'user-1',
        chatId: 'chat-1',
        messageId: 'msg-1',
        topic: 'Test Topic 1',
        slidesCount: 5,
        language: 'ru',
      });

      await eventBus.emit(EventTypes.AI_CONTENT_REQUESTED, {
        requestId: 'stats-test-2',
        contentType: 'analysis' as const,
        prompt: 'Test prompt',
        parameters: {},
      });

      const stats = eventBus.getStats();

      expect(stats.totalSubscriptions).toBe(3);
      expect(stats.totalEventsProcessed).toBe(2);
      expect(
        stats.subscriptionsByType[EventTypes.CAROUSEL_GENERATE_REQUESTED]
      ).toBe(2);
      expect(stats.subscriptionsByType[EventTypes.AI_CONTENT_REQUESTED]).toBe(
        1
      );
      expect(
        stats.eventCountsByType[EventTypes.CAROUSEL_GENERATE_REQUESTED]
      ).toBe(1);
      expect(stats.eventCountsByType[EventTypes.AI_CONTENT_REQUESTED]).toBe(1);
    });
  });
});

// 🕉️ "अहिंसा परमो धर्मः" - "Non-violence is the highest dharma"
// Events should flow harmoniously without conflicts
