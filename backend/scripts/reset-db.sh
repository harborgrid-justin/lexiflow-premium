#!/bin/bash

# LexiFlow Database Reset Script
# This script drops all tables, re-runs migrations, and optionally seeds the database

set -e

echo "==========================================="
echo "LexiFlow Database Reset"
echo "==========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Confirmation prompt
if [ "$1" != "--force" ] && [ "$1" != "-f" ]; then
    echo -e "${RED}WARNING: This will delete all data in the database!${NC}"
    echo -e "${YELLOW}Are you sure you want to continue? (yes/no)${NC}"
    read -r response

    if [ "$response" != "yes" ]; then
        echo "Operation cancelled."
        exit 0
    fi
fi

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

# Drop all tables
echo -e "${YELLOW}Dropping all tables...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" << EOF
DO \$\$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;

    -- Drop all types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END \$\$;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}All tables dropped successfully!${NC}"
else
    echo -e "${RED}ERROR: Failed to drop tables${NC}"
    exit 1
fi
echo ""

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

# Run seeds
if [ "$2" == "--with-seed" ] || [ "$2" == "-s" ] || [ "$1" == "--with-seed" ] || [ "$1" == "-s" ]; then
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
echo "Database reset completed!"
echo "===========================================${NC}"
echo ""
echo "You can now start the application with:"
echo "  npm run start:dev"
echo ""
