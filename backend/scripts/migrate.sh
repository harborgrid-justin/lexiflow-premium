#!/bin/bash

# ============================================
# LexiFlow Database Migration Script
# ============================================
# This script runs database migrations

set -e

echo "==========================================="
echo "LexiFlow Database Migration"
echo "==========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    echo -e "${GREEN}Loading environment variables from .env file...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}No .env file found, using default values${NC}"
fi

# Set default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-lexiflow_db}
DB_USERNAME=${DB_USERNAME:-lexiflow_user}
DB_PASSWORD=${DB_PASSWORD:-lexiflow_password}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_DATABASE"
echo "  User: $DB_USERNAME"
echo ""

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
max_attempts=30
attempt=0

until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -c '\q' 2>/dev/null || [ $attempt -eq $max_attempts ]; do
    attempt=$((attempt + 1))
    echo "  Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}ERROR: Could not connect to PostgreSQL after $max_attempts attempts${NC}"
    exit 1
fi

echo -e "${GREEN}PostgreSQL is ready!${NC}"
echo ""

# Parse command line arguments
COMMAND=${1:-run}

case $COMMAND in
    run|migrate)
        echo -e "${BLUE}Running pending migrations...${NC}"
        npm run migration:run
        ;;

    revert|rollback)
        echo -e "${YELLOW}Reverting last migration...${NC}"
        npm run migration:revert
        ;;

    generate)
        if [ -z "$2" ]; then
            echo -e "${RED}ERROR: Migration name required${NC}"
            echo "Usage: $0 generate <migration-name>"
            exit 1
        fi
        echo -e "${BLUE}Generating migration: $2${NC}"
        npm run migration:generate -- -n "$2"
        ;;

    create)
        if [ -z "$2" ]; then
            echo -e "${RED}ERROR: Migration name required${NC}"
            echo "Usage: $0 create <migration-name>"
            exit 1
        fi
        echo -e "${BLUE}Creating empty migration: $2${NC}"
        npm run migration:create -- -n "$2"
        ;;

    show|status)
        echo -e "${BLUE}Showing migration status...${NC}"
        npm run migration:show
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  run|migrate         Run pending migrations (default)"
        echo "  revert|rollback     Revert the last migration"
        echo "  generate <name>     Generate a new migration from entity changes"
        echo "  create <name>       Create an empty migration file"
        echo "  show|status         Show migration status"
        echo ""
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}==========================================="
    echo "Migration operation completed!"
    echo "===========================================${NC}"
else
    echo ""
    echo -e "${RED}==========================================="
    echo "ERROR: Migration operation failed"
    echo "===========================================${NC}"
    exit 1
fi

echo ""
