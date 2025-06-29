#!/bin/bash
# 🎨 Build Carousel Generator Service Docker Image

set -e

echo "🎨 Building Carousel Generator Service..."

# Build from project root with correct context
cd "$(dirname "$0")/.."

echo "📂 Building from: $(pwd)"

# Build the Docker image
docker build -f services/carousel-generator/Dockerfile -t carousel-generator .

echo "✅ Carousel Generator Service built successfully!"
echo "🚀 Run with: docker run -p 3001:3001 carousel-generator"
echo "🏥 Health check: curl http://localhost:3001/health"
echo "📊 Stats: curl http://localhost:3001/stats"
