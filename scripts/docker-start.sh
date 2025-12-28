#!/bin/bash
# =============================================================================
# LexiFlow Premium - Docker Start Script
# =============================================================================
# Starts all Docker containers for the application
# Usage: ./scripts/docker-start.sh [production|development]
# =============================================================================

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "LexiFlow Premium - Docker Start"
echo "Environment: $ENVIRONMENT"
echo "=============================================="

cd "$PROJECT_ROOT"

# Check for environment file
if [ ! -f ".env.docker" ] && [ ! -f ".env" ]; then
    echo "Warning: No .env.docker or .env file found!"
    echo "Please copy .env.docker.example to .env.docker and configure your values."
    exit 1
fi

# Use .env.docker if available, otherwise .env
ENV_FILE=".env"
if [ -f ".env.docker" ]; then
    ENV_FILE=".env.docker"
fi

if [ "$ENVIRONMENT" = "development" ]; then
    echo "Starting development containers..."
    docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.dev.yml up -d
    echo ""
    echo "Development services started!"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend:  http://localhost:5000"
    echo "  - Redis Commander: http://localhost:8081"
else
    echo "Starting production containers..."
    docker compose --env-file "$ENV_FILE" -f docker-compose.yml -f docker-compose.prod.yml up -d
    echo ""
    echo "Production services started!"
    echo "  - Frontend: http://localhost:80"
    echo "  - Backend:  http://localhost:5000"
fi

echo ""
echo "Use 'docker compose logs -f' to view logs"
