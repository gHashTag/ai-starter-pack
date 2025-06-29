#!/bin/bash
# 🌐 Microservices Development Launcher
# Starts all microservices with event-driven communication

set -e

# 🎨 Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 🕉️ Sacred Header
echo -e "${PURPLE}🕉️ ========================================= 🕉️${NC}"
echo -e "${PURPLE}   Bible VibeCoder Microservices Stack${NC}"
echo -e "${PURPLE}   Event-Driven Functional Communication${NC}"
echo -e "${PURPLE}🕉️ ========================================= 🕉️${NC}"
echo

# 📁 Directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="$PROJECT_ROOT/infrastructure"
SERVICES_DIR="$PROJECT_ROOT/services"

echo -e "${CYAN}📁 Project Root: $PROJECT_ROOT${NC}"
echo -e "${CYAN}🏗️ Infrastructure: $INFRA_DIR${NC}"
echo -e "${CYAN}⚙️ Services: $SERVICES_DIR${NC}"
echo

# 🔧 Functions
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    # Check Bun
    if ! command -v bun &> /dev/null; then
        echo -e "${YELLOW}⚠️ Bun is not installed (required for local development)${NC}"
    fi
    
    echo -e "${GREEN}✅ Prerequisites checked${NC}"
}

setup_shared_modules() {
    echo -e "${BLUE}📦 Setting up shared modules...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Create shared package.json if it doesn't exist
    if [ ! -f "shared/package.json" ]; then
        mkdir -p shared
        cat > shared/package.json << EOF
{
  "name": "@bible-vibecoder/shared",
  "version": "1.0.0",
  "description": "Shared types and utilities for microservices",
  "type": "module",
  "main": "index.ts",
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
EOF
    fi
    
    echo -e "${GREEN}✅ Shared modules ready${NC}"
}

build_docker_images() {
    echo -e "${BLUE}🐳 Building Docker images...${NC}"
    
    cd "$INFRA_DIR"
    
    # Build all services
    docker-compose build --parallel
    
    echo -e "${GREEN}✅ Docker images built${NC}"
}

start_infrastructure() {
    echo -e "${BLUE}🏗️ Starting infrastructure services...${NC}"
    
    cd "$INFRA_DIR"
    
    # Start infrastructure services first
    docker-compose up -d redis postgres prometheus grafana jaeger
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for infrastructure to be ready...${NC}"
    sleep 10
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
        echo -e "${GREEN}✅ Redis is ready${NC}"
    else
        echo -e "${RED}❌ Redis is not responding${NC}"
    fi
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U developer; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
    else
        echo -e "${RED}❌ PostgreSQL is not responding${NC}"
    fi
    
    echo -e "${GREEN}✅ Infrastructure services started${NC}"
}

start_microservices() {
    echo -e "${BLUE}⚙️ Starting microservices...${NC}"
    
    cd "$INFRA_DIR"
    
    # Start all services
    docker-compose up -d
    
    echo -e "${GREEN}✅ All microservices started${NC}"
}

show_service_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    
    cd "$INFRA_DIR"
    
    # Show running containers
    docker-compose ps
    
    echo
    echo -e "${CYAN}🌐 Service URLs:${NC}"
    echo -e "  🎨 Carousel Generator: http://localhost:3001/health"
    echo -e "  🧠 AI Content Service: http://localhost:3002"
    echo -e "  📱 Telegram Gateway: http://localhost:3000"
    echo -e "  💾 Data Persistence: http://localhost:3003"
    echo -e "  📊 Analytics: http://localhost:3004"
    echo -e "  🔄 Event Orchestrator: http://localhost:3005"
    echo -e "  🌐 API Gateway: http://localhost:8080"
    echo
    echo -e "${CYAN}📊 Monitoring URLs:${NC}"
    echo -e "  📈 Grafana: http://localhost:3006 (admin/admin)"
    echo -e "  📊 Prometheus: http://localhost:9090"
    echo -e "  🔍 Jaeger: http://localhost:16686"
    echo
    echo -e "${CYAN}🗃️ Database URLs:${NC}"
    echo -e "  🗃️ PostgreSQL: localhost:5432 (developer/dev_password)"
    echo -e "  📨 Redis: localhost:6379"
}

health_check() {
    echo -e "${BLUE}🏥 Running health checks...${NC}"
    
    # Check Carousel Generator
    if curl -f -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Carousel Generator: Healthy${NC}"
    else
        echo -e "${RED}❌ Carousel Generator: Unhealthy${NC}"
    fi
    
    # Check Grafana
    if curl -f -s http://localhost:3006/api/health > /dev/null; then
        echo -e "${GREEN}✅ Grafana: Healthy${NC}"
    else
        echo -e "${YELLOW}⏳ Grafana: Starting up...${NC}"
    fi
    
    # Check Prometheus
    if curl -f -s http://localhost:9090/-/healthy > /dev/null; then
        echo -e "${GREEN}✅ Prometheus: Healthy${NC}"
    else
        echo -e "${YELLOW}⏳ Prometheus: Starting up...${NC}"
    fi
}

show_logs() {
    echo -e "${BLUE}📝 Following service logs...${NC}"
    echo -e "${YELLOW}   Press Ctrl+C to stop following logs${NC}"
    echo
    
    cd "$INFRA_DIR"
    docker-compose logs -f carousel-generator
}

cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    
    cd "$INFRA_DIR"
    docker-compose down
    
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# 🎯 Main execution
case "${1:-start}" in
    "start")
        check_prerequisites
        setup_shared_modules
        build_docker_images
        start_infrastructure
        start_microservices
        echo
        show_service_status
        echo
        health_check
        echo
        echo -e "${GREEN}🚀 All microservices are running!${NC}"
        echo -e "${CYAN}   Run '$0 logs' to see service logs${NC}"
        echo -e "${CYAN}   Run '$0 stop' to stop all services${NC}"
        ;;
    
    "stop")
        cleanup
        ;;
    
    "restart")
        cleanup
        sleep 2
        $0 start
        ;;
    
    "status")
        show_service_status
        ;;
    
    "health")
        health_check
        ;;
    
    "logs")
        show_logs
        ;;
    
    "build")
        build_docker_images
        ;;
    
    *)
        echo -e "${CYAN}🌐 Bible VibeCoder Microservices Manager${NC}"
        echo
        echo -e "${YELLOW}Usage: $0 [command]${NC}"
        echo
        echo -e "${CYAN}Commands:${NC}"
        echo -e "  start     Start all microservices (default)"
        echo -e "  stop      Stop all microservices"
        echo -e "  restart   Restart all microservices"
        echo -e "  status    Show service status"
        echo -e "  health    Run health checks"
        echo -e "  logs      Follow service logs"
        echo -e "  build     Build Docker images"
        echo
        echo -e "${PURPLE}🕉️ May your microservices be in harmony${NC}"
        ;;
esac
