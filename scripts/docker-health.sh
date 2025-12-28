#!/bin/bash
# =============================================================================
# LexiFlow Premium - Docker Health Check Script
# =============================================================================
# Checks the health status of all Docker containers
# Usage: ./scripts/docker-health.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "LexiFlow Premium - Health Check"
echo "=============================================="

cd "$PROJECT_ROOT"

echo ""
echo "Container Status:"
echo "----------------------------------------------"
docker compose ps

echo ""
echo "Service Health:"
echo "----------------------------------------------"

# Check frontend
echo -n "Frontend: "
if curl -sf http://localhost:80/health > /dev/null 2>&1; then
    echo "✓ Healthy"
elif curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Healthy (dev mode)"
else
    echo "✗ Unhealthy or not running"
fi

# Check backend
echo -n "Backend:  "
if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✓ Healthy"
else
    echo "✗ Unhealthy or not running"
fi

# Check Redis
echo -n "Redis:    "
if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✓ Healthy"
else
    echo "✗ Unhealthy or not running"
fi

echo ""
echo "Resource Usage:"
echo "----------------------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
