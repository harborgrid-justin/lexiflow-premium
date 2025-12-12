#!/bin/bash

# ============================================
# LexiFlow Database Seeding Script
# ============================================
# This script seeds the database with initial or test data

set -e

echo "==========================================="
echo "LexiFlow Database Seeding"
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

# Check for seed command
if [ -z "$(npm run | grep 'seed')" ]; then
    echo -e "${YELLOW}No 'seed' script found in package.json${NC}"
    echo -e "${YELLOW}Attempting to run seeder directly...${NC}"

    # Try to run seeder using NestJS CLI
    if [ -f "src/database/seeds/comprehensive-seeder.service.ts" ]; then
        echo -e "${BLUE}Running comprehensive seeder...${NC}"
        npx ts-node -r tsconfig-paths/register src/database/seeds/run-seed.ts
    else
        echo -e "${RED}ERROR: No seeder service found${NC}"
        exit 1
    fi
else
    # Run the seed script from package.json
    echo -e "${BLUE}Running database seeds...${NC}"
    npm run seed
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}==========================================="
    echo "Database seeding completed successfully!"
    echo "===========================================${NC}"
else
    echo ""
    echo -e "${RED}==========================================="
    echo "ERROR: Database seeding failed"
    echo "===========================================${NC}"
    exit 1
fi

echo ""
echo "Seeded data includes:"
echo "  - Organizations"
echo "  - Users with different roles"
echo "  - Sample cases"
echo "  - Sample clients"
echo "  - Sample documents"
echo "  - Billing entries"
echo ""
echo "You can now start the application with:"
echo "  npm run start:dev"
echo ""
