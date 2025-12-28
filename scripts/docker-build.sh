#!/bin/bash
# =============================================================================
# LexiFlow Premium - Docker Build Script
# =============================================================================
# Builds all Docker images for the application
# Usage: ./scripts/docker-build.sh [production|development]
# =============================================================================

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "LexiFlow Premium - Docker Build"
echo "Environment: $ENVIRONMENT"
echo "=============================================="

cd "$PROJECT_ROOT"

if [ "$ENVIRONMENT" = "development" ]; then
    echo "Building development images..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml build
else
    echo "Building production images..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml build
fi

echo ""
echo "Build complete!"
echo "Run './scripts/docker-start.sh $ENVIRONMENT' to start the containers"
