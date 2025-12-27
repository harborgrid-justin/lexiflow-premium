#!/bin/bash

echo "========================================"
echo "  LexiFlow Backend Production Deploy"
echo "  Memory-Optimized Configuration"
echo "========================================"
echo ""

if [ -f ".env" ]; then
    echo "✓ Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠ No .env file found. Using defaults."
fi

NODE_ENV="${NODE_ENV:-production}"
PORT="${PORT:-5000}"
NODE_MAX_OLD_SPACE_SIZE="${NODE_MAX_OLD_SPACE_SIZE:-2048}"
NODE_MAX_SEMI_SPACE_SIZE="${NODE_MAX_SEMI_SPACE_SIZE:-16}"

echo "Configuration:"
echo "  Environment: $NODE_ENV"
echo "  Port: $PORT"
echo "  Max Heap Size: ${NODE_MAX_OLD_SPACE_SIZE}MB"
echo "  Max Semi Space: ${NODE_MAX_SEMI_SPACE_SIZE}MB"
echo ""

echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build successful"
echo ""

echo "Running database migrations..."
npm run migration:run

if [ $? -ne 0 ]; then
    echo "⚠ Migration failed or no pending migrations"
fi

echo ""
echo "Starting production server with memory optimization..."
echo ""

exec node \
    --max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE} \
    --max-semi-space-size=${NODE_MAX_SEMI_SPACE_SIZE} \
    --expose-gc \
    --optimize-for-size \
    --max-old-generation-size-mb=1536 \
    dist/src/main.js
