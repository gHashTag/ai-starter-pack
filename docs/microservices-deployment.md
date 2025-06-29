# 🌐 Microservices Deployment Guide

## Bible VibeCoder - Event-Driven Functional Architecture

### 🚀 Quick Start

1. **Start all microservices in development mode:**

   ```bash
   bash scripts/microservices-dev.sh
   ```

2. **Check service health:**

   ```bash
   bash scripts/microservices-dev.sh health
   ```

3. **View service logs:**

   ```bash
   bash scripts/microservices-dev.sh logs
   ```

4. **Stop all services:**
   ```bash
   bash scripts/microservices-dev.sh stop
   ```

### 📊 Service Overview

| Service               | Port | Description                          | Status Endpoint              |
| --------------------- | ---- | ------------------------------------ | ---------------------------- |
| 🎨 Carousel Generator | 3001 | Instagram carousel generation        | http://localhost:3001/health |
| 🧠 AI Content         | 3002 | AI content analysis (placeholder)    | http://localhost:3002        |
| 📱 Telegram Gateway   | 3000 | Telegram bot interface (placeholder) | http://localhost:3000        |
| 💾 Data Persistence   | 3003 | Database operations (placeholder)    | http://localhost:3003        |
| 📊 Analytics          | 3004 | Metrics and monitoring (placeholder) | http://localhost:3004        |
| 🔄 Event Orchestrator | 3005 | Workflow management (placeholder)    | http://localhost:3005        |
| 🌐 API Gateway        | 8080 | Route aggregation                    | http://localhost:8080        |

### 🏗️ Infrastructure Services

| Service       | Port  | Credentials            | Purpose              |
| ------------- | ----- | ---------------------- | -------------------- |
| 📨 Redis      | 6379  | -                      | Event bus & caching  |
| 🗃️ PostgreSQL | 5432  | developer/dev_password | Primary database     |
| 📊 Prometheus | 9090  | -                      | Metrics collection   |
| 📈 Grafana    | 3006  | admin/admin            | Monitoring dashboard |
| 🔍 Jaeger     | 16686 | -                      | Distributed tracing  |

### 🔄 Event Flow Architecture

```mermaid
graph TD
    A[Telegram Bot] -->|user.message.received| B[Event Bus]
    B -->|carousel.generate.requested| C[Carousel Generator]
    C -->|ai.content.requested| D[AI Content Service]
    D -->|ai.analysis.completed| C
    C -->|carousel.slides.generated| E[Image Renderer]
    E -->|carousel.images.rendered| C
    C -->|carousel.completed| F[Data Persistence]
    F -->|user.interaction.tracked| G[Analytics]
```

### 🧪 Testing the Architecture

#### 1. **Unit Tests for Event Communication:**

```bash
cd /Users/playra/bible_vibecoder
bun test src/__tests__/microservices/event-driven-communication.test.ts
```

#### 2. **End-to-End Workflow Test:**

```bash
# Start services
bash scripts/microservices-dev.sh start

# Test carousel generation workflow
curl -X POST http://localhost:3001/test-carousel \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Functional Programming with TypeScript",
    "slidesCount": 5,
    "userId": "test-user-123"
  }'
```

#### 3. **Event Bus Health Check:**

```bash
curl -s http://localhost:3001/stats | jq '.eventBus'
```

### 🎯 Event Types & Communication

#### **Carousel Generation Events:**

- `carousel.generate.requested` → Initiates carousel creation
- `carousel.content.analyzed` → AI analysis completed
- `carousel.slides.generated` → Slide content ready
- `carousel.images.rendered` → Images generated
- `carousel.completed` → Process finished

#### **Analytics Events:**

- `user.interaction.tracked` → User action logging
- `metrics.collected` → Performance metrics
- `alert.triggered` → System alerts

#### **Health Monitoring Events:**

- `health.checked` → Service health status
- `system.error.occurred` → Error reporting

### 🛠️ Development Workflow

#### **1. Adding a New Service:**

1. Create service directory:

   ```bash
   mkdir -p services/new-service/src
   ```

2. Copy carousel-generator template:

   ```bash
   cp services/carousel-generator/package.json services/new-service/
   cp services/carousel-generator/Dockerfile services/new-service/
   ```

3. Update `infrastructure/docker-compose.yml`:
   ```yaml
   new-service:
     build:
       context: ..
       dockerfile: services/new-service/Dockerfile
     ports:
       - '3007:3007'
     networks:
       - bible-microservices
   ```

#### **2. Adding New Event Types:**

1. Define events in `shared/events/index.ts`:

   ```typescript
   export namespace NewServiceEvents {
     export interface NewEventData {
       readonly id: string;
       readonly data: string;
     }
   }
   ```

2. Add to EventTypes constants:
   ```typescript
   export const EventTypes = {
     // ... existing events
     NEW_EVENT_TYPE: 'new-service.event.type',
   } as const;
   ```

#### **3. Event Handler Pattern:**

```typescript
export const handleNewEvent = async (
  event: EventEnvelope<NewServiceEvents.NewEventData>,
  eventBus: FunctionalEventBus,
  config: ServiceConfig
): Promise<EventResult> => {
  // Pure functional processing
  const result = processEventData(event.data);

  // Emit follow-up events
  await eventBus.emit(EventTypes.NEXT_EVENT, result);

  return createSuccessResult(result);
};
```

### 🔍 Monitoring & Observability

#### **1. Service Health Monitoring:**

- **Health Checks:** All services expose `/health` endpoints
- **Metrics:** Prometheus scrapes service metrics
- **Alerts:** Grafana dashboards with alerting rules

#### **2. Event Flow Tracing:**

- **Correlation IDs:** Track events across services
- **Jaeger Tracing:** Distributed request tracing
- **Event History:** In-memory event audit trail

#### **3. Performance Metrics:**

- **Event Processing Time:** How long events take to process
- **Service Response Time:** HTTP endpoint latency
- **Error Rates:** Failed event processing percentage
- **Resource Usage:** Memory, CPU per service

### 🐳 Docker Deployment

#### **Development (Docker Compose):**

```bash
cd infrastructure
docker-compose up -d
```

#### **Production (Kubernetes) - Coming Soon:**

```bash
kubectl apply -f infrastructure/k8s/
```

### 🔧 Environment Configuration

#### **Required Environment Variables:**

```bash
# Service Configuration
NODE_ENV=development|production
SERVICE_NAME=carousel-generator

# Database
POSTGRES_URL=postgresql://developer:dev_password@localhost:5432/bible_vibecoder

# Redis
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_key
AI_SERVICE_URL=http://ai-content:3002

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
JAEGER_ENDPOINT=http://jaeger:14268
```

### 🚨 Troubleshooting

#### **Common Issues:**

1. **Port Conflicts:**

   ```bash
   # Check what's using the ports
   lsof -i :3001-3006

   # Kill conflicting processes
   bash scripts/kill-ports.sh
   ```

2. **Event Bus Not Responding:**

   ```bash
   # Check Redis connection
   docker-compose exec redis redis-cli ping

   # Restart event bus services
   docker-compose restart carousel-generator
   ```

3. **Service Health Check Failures:**

   ```bash
   # Check service logs
   docker-compose logs carousel-generator

   # Manual health check
   curl -v http://localhost:3001/health
   ```

#### **Performance Issues:**

1. **High Event Processing Latency:**
   - Check Prometheus metrics for bottlenecks
   - Review Jaeger traces for slow operations
   - Scale horizontally by adding service instances

2. **Memory Leaks:**
   - Monitor service memory usage in Grafana
   - Check event history size (default limit: 1000 events)
   - Restart services if memory usage is excessive

### 🔄 CI/CD Pipeline (GitHub Actions)

#### **Automated Testing:**

```yaml
name: Microservices CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test src/__tests__/microservices/
      - run: bash scripts/microservices-dev.sh build
```

#### **Deployment:**

```yaml
deploy:
  needs: test
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to Railway
      run: railway up --service carousel-generator
```

### 📈 Scaling Strategy

#### **Horizontal Scaling:**

- **Load Balancer:** Nginx for request distribution
- **Service Instances:** Multiple containers per service
- **Database Sharding:** Partition data by user/region

#### **Event Bus Scaling:**

- **Redis Cluster:** Multiple Redis nodes
- **Event Partitioning:** Route events by type or user
- **Circuit Breakers:** Prevent cascade failures

### 🎯 Next Steps

1. **Complete Service Implementation:**
   - AI Content Service (OpenAI integration)
   - Telegram Gateway Service (Telegraf integration)
   - Data Persistence Service (Drizzle ORM)
   - Analytics Service (metrics collection)

2. **Production Readiness:**
   - Kubernetes manifests
   - Helm charts
   - Secrets management
   - SSL/TLS certificates

3. **Advanced Features:**
   - Event replay capability
   - Saga pattern implementation
   - Real-time dashboards
   - Auto-scaling policies

---

_🕉️ "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः"_  
_"May all services be happy, may all be free from errors"_
