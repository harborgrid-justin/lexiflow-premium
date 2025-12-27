#!/bin/bash

# Production Memory-Optimized Startup Script
# LexiFlow Premium - Backend Service
# 
# Usage: ./start-production-memory-optimized.sh [environment]
# Environment: production | staging | development (default: production)

set -e

ENV="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "================================================"
echo "  LexiFlow Backend - Memory-Optimized Startup"
echo "================================================"
echo "Environment: $ENV"
echo "Script Dir: $SCRIPT_DIR"
echo "Project Root: $PROJECT_ROOT"
echo ""

# Load environment variables
if [ -f "$PROJECT_ROOT/.env.$ENV" ]; then
  echo "Loading environment from .env.$ENV"
  export $(cat "$PROJECT_ROOT/.env.$ENV" | grep -v '^#' | xargs)
elif [ -f "$PROJECT_ROOT/.env" ]; then
  echo "Loading environment from .env"
  export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)
else
  echo "WARNING: No .env file found"
fi

# Memory optimization flags
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
export NODE_OPTIONS="$NODE_OPTIONS --max-semi-space-size=64"
export NODE_OPTIONS="$NODE_OPTIONS --max-old-space-size=4096"
export NODE_OPTIONS="$NODE_OPTIONS --optimize-for-size"
export NODE_OPTIONS="$NODE_OPTIONS --gc-interval=100"
export NODE_OPTIONS="$NODE_OPTIONS --expose-gc"

# Thread pool optimization
export UV_THREADPOOL_SIZE="${UV_THREADPOOL_SIZE:-8}"

# Logging
export LOG_LEVEL="${LOG_LEVEL:-info}"
export LOG_FORMAT="${LOG_FORMAT:-json}"

echo "Node Options: $NODE_OPTIONS"
echo "UV Thread Pool Size: $UV_THREADPOOL_SIZE"
echo ""

# Check if node_modules exists
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  echo "ERROR: node_modules not found. Run 'npm install' first."
  exit 1
fi

# Check if dist exists
if [ ! -d "$PROJECT_ROOT/dist" ]; then
  echo "Building application..."
  cd "$PROJECT_ROOT"
  npm run build
fi

# Database migrations (production only)
if [ "$ENV" = "production" ]; then
  echo "Running database migrations..."
  cd "$PROJECT_ROOT"
  npm run migration:run
fi

# Start the application
echo ""
echo "Starting application with memory optimizations..."
echo "================================================"
echo ""

cd "$PROJECT_ROOT"

if [ "$ENV" = "production" ]; then
  # Production mode - use compiled JS
  node dist/main.js
else
  # Development/Staging - use ts-node with optimizations
  npm run start:dev
fi
