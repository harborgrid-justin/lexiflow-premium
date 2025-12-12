#!/bin/bash

# ============================================
# LexiFlow Database Restore Script
# ============================================
# This script restores a PostgreSQL database from a backup

set -e

echo "==========================================="
echo "LexiFlow Database Restore"
echo "==========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}ERROR: Backup file not specified${NC}"
    echo ""
    echo "Usage: $0 <backup-file.sql.gz>"
    echo ""
    echo "Available backups:"
    BACKUP_DIR=${BACKUP_DIR:-./backups}
    ls -lh "$BACKUP_DIR"/lexiflow_backup_*.sql.gz 2>/dev/null || echo "  (none found)"
    echo ""
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}ERROR: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}Backup file found: $BACKUP_FILE${NC}"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Size: $BACKUP_SIZE"
echo ""

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

# Confirmation prompt
echo -e "${RED}WARNING: This will delete all existing data in the database!${NC}"
echo -e "${YELLOW}Database: $DB_DATABASE on $DB_HOST:$DB_PORT${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (yes/no)${NC}"
read -r response

if [ "$response" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -c '\q' 2>/dev/null; then
    echo -e "${RED}ERROR: Could not connect to PostgreSQL${NC}"
    exit 1
fi

echo -e "${GREEN}PostgreSQL connection successful!${NC}"
echo ""

# Create a temporary directory for decompression
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Decompress the backup if needed
RESTORE_FILE="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${BLUE}Decompressing backup file...${NC}"
    RESTORE_FILE="$TEMP_DIR/restore.sql"
    gunzip -c "$BACKUP_FILE" > "$RESTORE_FILE"

    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Failed to decompress backup file${NC}"
        exit 1
    fi
    echo -e "${GREEN}Decompression complete!${NC}"
    echo ""
fi

# Drop existing connections to the database
echo -e "${BLUE}Terminating existing database connections...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d postgres << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_DATABASE'
  AND pid <> pg_backend_pid();
EOF

echo ""

# Restore the database
echo -e "${BLUE}Restoring database from backup...${NC}"
echo "This may take a few minutes depending on the backup size..."
echo ""

PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USERNAME" \
    -d "$DB_DATABASE" \
    --quiet \
    < "$RESTORE_FILE"

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}ERROR: Database restore failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}==========================================="
echo "Database restore completed successfully!"
echo "===========================================${NC}"
echo ""

# Verify restoration
echo -e "${BLUE}Verifying restoration...${NC}"
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

echo "Number of tables in database: $TABLE_COUNT"
echo ""

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}Database verification successful!${NC}"
else
    echo -e "${YELLOW}Warning: No tables found in the public schema${NC}"
fi

echo ""
echo "You can now start the application with:"
echo "  npm run start:dev"
echo ""
