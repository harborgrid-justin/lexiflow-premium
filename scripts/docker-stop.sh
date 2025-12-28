#!/bin/bash
# =============================================================================
# LexiFlow Premium - Docker Stop Script
# =============================================================================
# Stops all Docker containers for the application
# Usage: ./scripts/docker-stop.sh [--clean]
# =============================================================================

set -e

CLEAN=${1:-}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "LexiFlow Premium - Docker Stop"
echo "=============================================="

cd "$PROJECT_ROOT"

echo "Stopping containers..."
docker compose down

if [ "$CLEAN" = "--clean" ]; then
    echo "Removing volumes..."
    docker compose down -v
    echo "Removing unused images..."
    docker image prune -f
fi

echo ""
echo "Containers stopped!"
