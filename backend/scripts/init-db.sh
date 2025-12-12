#!/bin/bash

# LexiFlow Database Initialization Script
# This script initializes the database with all necessary migrations and seed data

set -e

echo "==========================================="
echo "LexiFlow Database Initialization"
echo "==========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if TypeORM CLI is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm is not installed${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npm run migration:run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Migrations completed successfully!${NC}"
else
    echo -e "${RED}ERROR: Migration failed${NC}"
    exit 1
fi
echo ""

# Run seeds (optional)
if [ "$1" == "--with-seed" ] || [ "$1" == "-s" ]; then
    echo -e "${YELLOW}Running database seeds...${NC}"
    npm run seed

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Seeds completed successfully!${NC}"
    else
        echo -e "${RED}ERROR: Seeding failed${NC}"
        exit 1
    fi
    echo ""
fi

echo -e "${GREEN}==========================================="
echo "Database initialization completed!"
echo "===========================================${NC}"
echo ""
echo "You can now start the application with:"
echo "  npm run start:dev"
echo ""
