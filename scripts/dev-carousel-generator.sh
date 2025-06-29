#!/bin/bash
# 🎨 Development Script for Carousel Generator Service

set -e

echo "🎨 Starting Carousel Generator Service in development mode..."

# Navigate to service directory
cd "$(dirname "$0")/../services/carousel-generator"

echo "📂 Working from: $(pwd)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Run type check first
echo "🔍 Running type check..."
bun run typecheck

# Start development server
echo "🚀 Starting development server..."
echo "🏥 Health check will be available at: http://localhost:3001/health"
echo "📊 Stats will be available at: http://localhost:3001/stats"
echo ""
echo "Press Ctrl+C to stop the service"

bun run dev
