# =============================================================================
# LexiFlow Premium Backend - Production Dockerfile
# =============================================================================
# Multi-stage build optimized for production deployment
# Based on Docker best practices 2025:
# - Alpine base for minimal attack surface
# - Non-root user for security
# - Multi-stage build for minimal image size
# - Health checks for container orchestration
# - BuildKit cache optimization
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies Installation
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

# Install build dependencies for native modules (bcrypt, better-sqlite3)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# Using npm ci for deterministic builds
RUN npm ci --legacy-peer-deps

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production --legacy-peer-deps

# -----------------------------------------------------------------------------
# Stage 3: Production Runtime
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install runtime dependencies only
RUN apk add --no-cache \
    dumb-init \
    curl \
    tini

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Create required directories with proper permissions
RUN mkdir -p /app/uploads /app/logs /app/temp && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose API port
EXPOSE 5000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application with production optimizations
CMD ["node", \
    "--max-old-space-size=2048", \
    "--max-semi-space-size=16", \
    "--expose-gc", \
    "--optimize-for-size", \
    "dist/src/main.js"]

# =============================================================================
# Labels for container metadata
# =============================================================================
LABEL org.opencontainers.image.title="LexiFlow Premium Backend"
LABEL org.opencontainers.image.description="Enterprise Legal Practice Management System - NestJS Backend"
LABEL org.opencontainers.image.vendor="LexiFlow"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/lexiflow/lexiflow-premium"
