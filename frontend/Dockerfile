# =============================================================================
# LexiFlow Premium Frontend - Production Dockerfile
# =============================================================================
# Multi-stage build optimized for production deployment
# - Stage 1: Build React/Vite application with Node.js
# - Stage 2: Serve static files with Nginx
# Based on Docker best practices 2025
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./

# Copy shared-types package (workspace dependency)
COPY ../packages/shared-types ../packages/shared-types

# Install dependencies with npm ci for deterministic builds
RUN npm ci --legacy-peer-deps

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy shared-types for build
COPY --from=deps /packages/shared-types ../packages/shared-types

# Build arguments for environment configuration
ARG VITE_API_URL=http://localhost:5000
ARG VITE_API_PREFIX=/api/v1
ARG VITE_USE_BACKEND_API=true
ARG VITE_ENV=production

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_PREFIX=$VITE_API_PREFIX
ENV VITE_USE_BACKEND_API=$VITE_USE_BACKEND_API
ENV VITE_ENV=$VITE_ENV
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Production Runtime with Nginx
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-app nginx-app && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Create required directories
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx-app:nginx-app /var/cache/nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Run as non-root user
USER nginx-app

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Labels for container metadata
# =============================================================================
LABEL org.opencontainers.image.title="LexiFlow Premium Frontend"
LABEL org.opencontainers.image.description="Enterprise Legal Practice Management System - React Frontend"
LABEL org.opencontainers.image.vendor="LexiFlow"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/lexiflow/lexiflow-premium"
