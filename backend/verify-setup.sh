#!/bin/bash

# LexiFlow Infrastructure Verification Script

echo "=========================================="
echo "LexiFlow Infrastructure Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        return 1
    fi
}

check_executable() {
    if [ -x "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 (executable)"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 (not executable)"
        return 1
    fi
}

echo "Checking Docker Compose Files..."
check_file "docker-compose.yml"
check_file "docker-compose.dev.yml"
check_file "docker-compose.prod.yml"
check_file "docker-compose.test.yml"
echo ""

echo "Checking Configuration Files..."
check_file "Dockerfile"
check_file ".dockerignore"
check_file ".env.example"
check_file "Makefile"
echo ""

echo "Checking Scripts..."
check_executable "scripts/docker-helper.sh"
check_executable "scripts/init-db.sh"
check_executable "scripts/migrate.sh"
check_executable "scripts/seed-db.sh"
check_executable "scripts/backup-db.sh"
check_executable "scripts/restore-db.sh"
check_executable "scripts/reset-db.sh"
echo ""

echo "Checking SQL Files..."
check_file "scripts/init-postgres.sql"
check_file "scripts/pgadmin-servers.json"
echo ""

echo "Checking Documentation..."
check_file "DOCKER_SETUP.md"
check_file "QUICK_REFERENCE.md"
check_file "INFRASTRUCTURE_SUMMARY.md"
check_file "scripts/README.md"
echo ""

echo "Checking Directories..."
if [ -d "backups" ]; then
    echo -e "${GREEN}✓${NC} backups/"
else
    echo -e "${RED}✗${NC} backups/ (missing)"
fi

if [ -d "logs" ]; then
    echo -e "${GREEN}✓${NC} logs/"
else
    echo -e "${RED}✗${NC} logs/ (missing)"
fi
echo ""

echo "Checking System Requirements..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker installed ($(docker --version | cut -d' ' -f3 | tr -d ','))"
else
    echo -e "${RED}✗${NC} Docker not installed"
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose installed ($(docker-compose --version | cut -d' ' -f4 | tr -d ','))"
else
    echo -e "${RED}✗${NC} Docker Compose not installed"
fi

if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js installed ($(node --version))"
else
    echo -e "${RED}✗${NC} Node.js not installed"
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm installed ($(npm --version))"
else
    echo -e "${RED}✗${NC} npm not installed"
fi
echo ""

echo "=========================================="
echo "Verification Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Copy .env.example to .env and configure"
echo "2. Run: make quick-start"
echo "3. Access services at http://localhost:3000"
echo ""
