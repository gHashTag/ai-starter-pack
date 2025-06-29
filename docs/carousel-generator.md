# Carousel Generator Service

The Carousel Generator Service is an event-driven microservice designed to generate Instagram carousels.

## Features

- **Event-driven architecture:** Utilizes a functional event bus.
- **Configurable:** Supports multiple styles and languages.
- **Health checks and stats:** Provides endpoints for service monitoring.

## Getting Started

### Prerequisites

- Docker
- Bun

### Local Development

To start the service locally:

```bash
bun run dev
```

### Building Docker Image

To build the Docker image:

```bash
docker build -f services/carousel-generator/Dockerfile -t carousel-generator .
```

### Running with Docker Compose

Ensure Docker daemon is running, then execute:

```bash
docker-compose up
```

Visit `http://localhost:3001/health` for health check and `http://localhost:3001/stats` for service stats.

### Configuration

- **Environment Variables:**
  - `CAROUSEL_SERVICE_PORT`: Port to run the service on.
  - `AI_SERVICE_URL`: URL for the AI content analysis service.

## Endpoints

- **GET /health:** Health check endpoint.
- **GET /stats:** Service statistics.

## License

This project is licensed under the MIT License.
