#!/bin/bash
# =============================================================================
# LexiFlow Premium - Database Seeding Script
# =============================================================================
# Seeds the database with enterprise demo data
# Usage: ./scripts/docker-seed.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "LexiFlow Premium - Database Seeder"
echo "=============================================="

cd "$PROJECT_ROOT"

# Check if containers are running
if ! docker compose ps --status running | grep -q "lexiflow-postgres"; then
    echo "Error: PostgreSQL container is not running!"
    echo "Start the containers first: ./scripts/docker-start.sh"
    exit 1
fi

if ! docker compose ps --status running | grep -q "lexiflow-backend"; then
    echo "Error: Backend container is not running!"
    echo "Start the containers first: ./scripts/docker-start.sh"
    exit 1
fi

echo ""
echo "Seeding database with enterprise demo data..."
echo ""

# Run the seeder
docker compose run --rm seeder

echo ""
echo "=============================================="
echo "Database seeding complete!"
echo "=============================================="
echo ""
echo "Demo credentials:"
echo "  Email:    admin@lexiflow.com"
echo "  Password: Demo123!"
echo ""
echo "Additional users seeded:"
echo "  - partner@lexiflow.com"
echo "  - senior@lexiflow.com"
echo "  - associate@lexiflow.com"
echo "  - paralegal@lexiflow.com"
echo ""
