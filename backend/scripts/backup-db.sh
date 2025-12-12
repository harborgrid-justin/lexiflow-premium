#!/bin/bash

# ============================================
# LexiFlow Database Backup Script
# ============================================
# This script creates a backup of the PostgreSQL database

set -e

echo "==========================================="
echo "LexiFlow Database Backup"
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
BACKUP_DIR=${BACKUP_DIR:-./backups}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_DATABASE"
echo "  User: $DB_USERNAME"
echo ""

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/lexiflow_backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="$BACKUP_FILE.gz"

echo -e "${BLUE}Creating database backup...${NC}"
echo "Backup file: $BACKUP_FILE_COMPRESSED"
echo ""

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE" -c '\q' 2>/dev/null; then
    echo -e "${RED}ERROR: Could not connect to PostgreSQL${NC}"
    exit 1
fi

echo -e "${GREEN}PostgreSQL connection successful!${NC}"
echo ""

# Create the backup
echo -e "${BLUE}Dumping database...${NC}"
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USERNAME" \
    -d "$DB_DATABASE" \
    --verbose \
    --format=plain \
    --no-owner \
    --no-acl \
    --encoding=UTF8 \
    --clean \
    --if-exists \
    > "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Database backup failed${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Compress the backup
echo ""
echo -e "${BLUE}Compressing backup file...${NC}"
gzip "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Backup compression failed${NC}"
    exit 1
fi

# Get backup file size
BACKUP_SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)

echo ""
echo -e "${GREEN}==========================================="
echo "Database backup completed successfully!"
echo "===========================================${NC}"
echo ""
echo "Backup Details:"
echo "  File: $BACKUP_FILE_COMPRESSED"
echo "  Size: $BACKUP_SIZE"
echo "  Timestamp: $TIMESTAMP"
echo ""

# Clean up old backups
if [ "$BACKUP_RETENTION_DAYS" -gt 0 ]; then
    echo -e "${YELLOW}Cleaning up backups older than $BACKUP_RETENTION_DAYS days...${NC}"
    find "$BACKUP_DIR" -name "lexiflow_backup_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete

    REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/lexiflow_backup_*.sql.gz 2>/dev/null | wc -l)
    echo -e "${GREEN}Cleanup complete. $REMAINING_BACKUPS backup(s) remaining.${NC}"
    echo ""
fi

# List all existing backups
echo "Available backups:"
ls -lh "$BACKUP_DIR"/lexiflow_backup_*.sql.gz 2>/dev/null || echo "  (none)"
echo ""

echo "To restore this backup, run:"
echo "  ./scripts/restore-db.sh $BACKUP_FILE_COMPRESSED"
echo ""
