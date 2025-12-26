#!/bin/bash
set -e

echo "🔄 Restarting backend server to apply authentication bypass..."

# Kill any existing backend processes
pkill -f "nest start" || echo "No existing nest processes found"
pkill -f "backend/dist/main" || echo "No existing backend processes found"

# Wait a moment
sleep 2

# Change to backend directory
cd /workspaces/lexiflow-premium/backend

# Clean any cached builds
echo "🧹 Cleaning build cache..."
rm -rf dist/
rm -rf node_modules/.cache/ || echo "No cache directory found"

# Rebuild and start
echo "🔨 Rebuilding and starting backend..."
npm run build
npm run start:dev