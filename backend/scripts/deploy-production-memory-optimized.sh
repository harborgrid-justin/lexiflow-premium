#!/bin/bash

# LexiFlow Backend - Production Memory-Optimized Deployment Script
# This script automates the complete production deployment with memory optimizations

set -e

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/deployment-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $*" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $*" | tee -a "$LOG_FILE"
}

# Header
echo "================================================" | tee "$LOG_FILE"
echo "  LexiFlow Backend - Production Deployment" | tee -a "$LOG_FILE"
echo "  Memory-Optimized Enterprise Setup" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Pre-deployment checks
log "Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_NODE="18.0.0"
if ! [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
    error "Node.js version $NODE_VERSION is below required $REQUIRED_NODE"
    exit 1
fi
success "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
success "NPM version: $NPM_VERSION"

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ] && [ ! -f "$PROJECT_ROOT/.env" ]; then
    warning "No environment file found. Creating from template..."
    if [ -f "$PROJECT_ROOT/.env.production.template" ]; then
        cp "$PROJECT_ROOT/.env.production.template" "$PROJECT_ROOT/.env.$ENVIRONMENT"
        warning "Please edit $PROJECT_ROOT/.env.$ENVIRONMENT with your production values"
        exit 1
    else
        error "No .env template found"
        exit 1
    fi
fi

# Load environment variables
if [ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
    log "Loading environment from .env.$ENVIRONMENT"
    export $(cat "$PROJECT_ROOT/.env.$ENVIRONMENT" | grep -v '^#' | xargs)
elif [ -f "$PROJECT_ROOT/.env" ]; then
    log "Loading environment from .env"
    export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
fi

# Set production memory defaults if not set
export NODE_ENV="${NODE_ENV:-production}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048 --max-semi-space-size=16 --expose-gc --optimize-for-size --gc-interval=100}"
export UV_THREADPOOL_SIZE="${UV_THREADPOOL_SIZE:-8}"
export MEMORY_MONITORING_ENABLED="${MEMORY_MONITORING_ENABLED:-true}"

log "Memory configuration:"
log "  NODE_OPTIONS: $NODE_OPTIONS"
log "  UV_THREADPOOL_SIZE: $UV_THREADPOOL_SIZE"
log "  MEMORY_MONITORING_ENABLED: $MEMORY_MONITORING_ENABLED"

# Install dependencies
log "Installing dependencies..."
if ! npm ci --production=false >> "$LOG_FILE" 2>&1; then
    error "Failed to install dependencies"
    exit 1
fi
success "Dependencies installed"

# Run security audit
log "Running security audit..."
if npm audit --audit-level=moderate >> "$LOG_FILE" 2>&1; then
    success "Security audit passed"
else
    warning "Security vulnerabilities found - review audit output"
fi

# Type checking
log "Running type checking..."
if ! npm run typecheck >> "$LOG_FILE" 2>&1; then
    error "Type checking failed"
    exit 1
fi
success "Type checking passed"

# Linting
log "Running linting..."
if ! npm run lint:check >> "$LOG_FILE" 2>&1; then
    error "Linting failed"
    exit 1
fi
success "Linting passed"

# Build application
log "Building application..."
if ! NODE_OPTIONS="--max-old-space-size=8192" npm run build >> "$LOG_FILE" 2>&1; then
    error "Build failed"
    exit 1
fi
success "Build completed"

# Run tests (optional for production)
if [ "${SKIP_TESTS:-false}" != "true" ]; then
    log "Running tests..."
    if ! npm run test:unit >> "$LOG_FILE" 2>&1; then
        error "Unit tests failed"
        exit 1
    fi
    success "Unit tests passed"
fi

# Database setup
log "Checking database connection..."
if ! npm run db:test >> "$LOG_FILE" 2>&1; then
    error "Database connection failed"
    exit 1
fi
success "Database connection OK"

# Run migrations
log "Running database migrations..."
if ! npm run migration:run >> "$LOG_FILE" 2>&1; then
    error "Database migrations failed"
    exit 1
fi
success "Database migrations completed"

# Seed data (if needed)
if [ "${SEED_DATA:-false}" = "true" ]; then
    log "Seeding database..."
    if ! npm run seed >> "$LOG_FILE" 2>&1; then
        warning "Database seeding failed - continuing..."
    else
        success "Database seeded"
    fi
fi

# Pre-deployment health check
log "Running pre-deployment health check..."
sleep 2

# Start application for health check
log "Starting application for health check..."
npm run start:prod:memory >> "$LOG_FILE" 2>&1 &
APP_PID=$!

# Wait for startup
sleep 10

# Health check
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:5000/api/health}"
log "Checking health endpoint: $HEALTH_CHECK_URL"
if curl -f -s "$HEALTH_CHECK_URL" >> "$LOG_FILE" 2>&1; then
    success "Health check passed"
else
    error "Health check failed"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# Stop test instance
kill $APP_PID 2>/dev/null || true
sleep 2

# Create systemd service file (Linux)
if [ -f /etc/os-release ] && grep -q "ID=ubuntu\|ID=debian\|ID=centos\|ID=fedora\|ID=rhel" /etc/os-release; then
    log "Creating systemd service..."

    SERVICE_FILE="/etc/systemd/system/lexiflow-backend.service"
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=LexiFlow Backend - Memory-Optimized
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_ROOT
Environment=NODE_ENV=production
Environment=NODE_OPTIONS=--max-old-space-size=2048 --max-semi-space-size=16 --expose-gc --optimize-for-size --gc-interval=100
Environment=UV_THREADPOOL_SIZE=8
Environment=MEMORY_MONITORING_ENABLED=true
ExecStart=$PROJECT_ROOT/node_modules/.bin/npm run start:prod:memory
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lexiflow-backend

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable lexiflow-backend.service
    success "Systemd service created and enabled"
fi

# Deployment complete
echo "" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
success "LexiFlow Backend deployment completed successfully!"
echo "" | tee -a "$LOG_FILE"
echo "Next steps:" | tee -a "$LOG_FILE"
echo "1. Review configuration in .env.$ENVIRONMENT" | tee -a "$LOG_FILE"
echo "2. Start service: systemctl start lexiflow-backend" | tee -a "$LOG_FILE"
echo "3. Check logs: journalctl -u lexiflow-backend -f" | tee -a "$LOG_FILE"
echo "4. Monitor health: curl http://localhost:5000/api/health" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Memory optimizations active:" | tee -a "$LOG_FILE"
echo "• V8 Heap: 2GB limit with optimized GC" | tee -a "$LOG_FILE"
echo "• Real-time monitoring: Enabled" | tee -a "$LOG_FILE"
echo "• Stream processing: 10MB+ files" | tee -a "$LOG_FILE"
echo "• LRU caching: All services optimized" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"

# Save deployment info
cat > "$PROJECT_ROOT/.deployment-info" << EOF
Deployment completed at: $(date)
Environment: $ENVIRONMENT
Node.js version: $NODE_VERSION
Memory optimizations: Enabled
Health check URL: $HEALTH_CHECK_URL
Log file: $LOG_FILE
EOF

log "Deployment information saved to .deployment-info"