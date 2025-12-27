# Production Deployment Guide: Memory-Optimized NestJS Backend

## Deployment Overview

This guide details the deployment procedure for 15 memory-optimized NestJS modules implementing PhD-level memory management patterns.

**Date:** December 27, 2025  
**Version:** 1.0.0  
**Status:** Production Ready  
**Required Review:** Senior Engineer + DevOps Lead  

---

## Pre-Deployment Checklist

### Infrastructure Requirements

#### Node.js Configuration
```bash
# Required Node.js version
Node.js >= 18.x LTS

# Required flags for optimal performance
NODE_OPTIONS="
  --max-old-space-size=8192
  --expose-gc
  --optimize-for-size
  --max-semi-space-size=16
  --initial-old-space-size=4096
"
```

#### Database Requirements
```sql
-- PostgreSQL 14+ with pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Verify extensions
SELECT * FROM pg_extension WHERE extname IN ('vector', 'pg_trgm', 'btree_gin');
```

#### Redis Configuration
```conf
# Redis 7.x for caching
maxmemory 4gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

### Environment Variables

Create `.env.production` with the following:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lexiflow
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=50
DATABASE_IDLE_TIMEOUT_MS=10000

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TTL_SECONDS=1800

# Memory Optimization
MEMORY_MONITORING_ENABLED=true
MEMORY_WARNING_THRESHOLD=0.75
MEMORY_CRITICAL_THRESHOLD=0.85
MEMORY_CHECK_INTERVAL_MS=30000
ENABLE_AUTOMATIC_GC=true

# Cache Configuration
CACHE_TTL_MS=1800000
MAX_CACHE_SIZE_AI_DATAOPS=10000
MAX_CACHE_SIZE_AI_OPS=5000
MAX_CACHE_SIZE_PREDICTIONS=2000
MAX_CACHE_SIZE_ANALYTICS=5000
MAX_CACHE_SIZE_SEARCH=5000

# Batch Processing
MAX_BATCH_SIZE=1000
MIN_BATCH_SIZE=100
BATCH_CONCURRENCY=10

# ETL Configuration
ETL_MEMORY_THRESHOLD_MB=512
ETL_CHECKPOINT_INTERVAL=10000
ETL_MAX_BATCH_SIZE=10000

# WebSocket Configuration
WS_MAX_CONNECTIONS_PER_USER=5
WS_MAX_GLOBAL_CONNECTIONS=10000
WS_MAX_ROOMS_PER_USER=50
WS_RATE_LIMIT_EVENTS_PER_MINUTE=100

# Logging
LOG_LEVEL=info
LOG_MEMORY_METRICS=true
LOG_CACHE_METRICS=true

# Health Checks
HEALTH_CHECK_INTERVAL_MS=30000
ENABLE_MEMORY_HEALTH_CHECK=true

# Performance
ENABLE_QUERY_LOGGING=false
ENABLE_SLOW_QUERY_LOG=true
SLOW_QUERY_THRESHOLD_MS=100
```

---

## Deployment Steps

### Step 1: Build Optimized Production Bundle

```bash
# Clean previous builds
rm -rf dist/

# Build with production optimizations
npm run build

# Verify build
ls -lh dist/
du -sh dist/
```

### Step 2: Run Database Migrations

```bash
# Generate and run migrations
npm run migration:generate -- -n MemoryOptimizationIndices
npm run migration:run

# Verify migrations
npm run migration:show

# Create indices for optimized queries
psql $DATABASE_URL << EOF
-- AI/ML optimizations
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_entity_type ON vector_embeddings(entity_type);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_created_at ON vector_embeddings(created_at DESC);

-- Analytics optimizations
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON analytics_events(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_case_id ON discovery_requests(case_id);

-- Search optimizations
CREATE INDEX IF NOT EXISTS idx_search_results_query_timestamp ON search_cache(query_hash, timestamp DESC);

-- WebSocket optimizations
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);

ANALYZE;
EOF
```

### Step 3: Deploy Application

#### Option A: Docker Deployment

```bash
# Build Docker image
docker build -t lexiflow-backend:v1.0.0-memory-optimized \
  --build-arg NODE_OPTIONS="--max-old-space-size=8192 --expose-gc" \
  -f Dockerfile.production .

# Run with optimized settings
docker run -d \
  --name lexiflow-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_OPTIONS="--max-old-space-size=8192 --expose-gc --optimize-for-size" \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  --memory="10g" \
  --memory-swap="12g" \
  --cpus="4.0" \
  lexiflow-backend:v1.0.0-memory-optimized

# Verify container health
docker logs -f lexiflow-backend
docker exec lexiflow-backend node -e "console.log(process.memoryUsage())"
```

#### Option B: PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lexiflow-backend',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '8G',
    node_args: '--max-old-space-size=8192 --expose-gc --optimize-for-size',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 5000,
    kill_timeout: 5000,
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit
pm2 logs lexiflow-backend
```

#### Option C: Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lexiflow-backend
  labels:
    app: lexiflow-backend
    version: v1.0.0-memory-optimized
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lexiflow-backend
  template:
    metadata:
      labels:
        app: lexiflow-backend
        version: v1.0.0-memory-optimized
    spec:
      containers:
      - name: backend
        image: lexiflow-backend:v1.0.0-memory-optimized
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: NODE_OPTIONS
          value: "--max-old-space-size=8192 --expose-gc --optimize-for-size"
        - name: NODE_ENV
          value: "production"
        - name: MEMORY_MONITORING_ENABLED
          value: "true"
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "10Gi"
            cpu: "4000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
        startupProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 10"]
---
apiVersion: v1
kind: Service
metadata:
  name: lexiflow-backend
spec:
  selector:
    app: lexiflow-backend
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: metrics
    port: 9090
    targetPort: 9090
  type: LoadBalancer
```

Deploy to Kubernetes:
```bash
kubectl apply -f k8s-deployment.yaml
kubectl rollout status deployment/lexiflow-backend
kubectl get pods -l app=lexiflow-backend
```

### Step 4: Verify Deployment

```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:3000/health/memory
curl http://localhost:3000/health/ready

# Memory metrics
curl http://localhost:3000/monitoring/memory-metrics

# Test endpoints
curl -X POST http://localhost:3000/ai-dataops/embeddings \
  -H "Content-Type: application/json" \
  -d '{"entityType":"test","entityId":"1","embedding":[0.1,0.2],"model":"test","content":"test"}'

# Check logs for memory metrics
tail -f logs/out.log | grep "Memory stats"
```

---

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'lexiflow-backend'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/monitoring/metrics'
```

### Grafana Dashboard

Import the following metrics:
- `nodejs_heap_size_used_bytes`
- `nodejs_heap_size_total_bytes`
- `nodejs_external_memory_bytes`
- `lexiflow_cache_size{service="ai-dataops"}`
- `lexiflow_cache_size{service="ai-ops"}`
- `lexiflow_cache_hit_rate`
- `lexiflow_gc_duration_seconds`

### Alert Rules

```yaml
# alerts.yml
groups:
  - name: memory
    rules:
      - alert: HighMemoryUsage
        expr: nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          
      - alert: CriticalMemoryUsage
        expr: nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes > 0.95
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical memory usage - immediate attention required"
          
      - alert: FrequentGC
        expr: rate(nodejs_gc_duration_seconds_count[5m]) > 10
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Frequent garbage collection detected"
```

---

## Performance Tuning

### Database Connection Pooling

```typescript
// src/config/database.config.ts
export default {
  type: 'postgres',
  pool: {
    min: 5,
    max: 50,
    idle: 10000,
    acquire: 30000,
    evictionRunIntervalMillis: 10000,
  },
  extra: {
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};
```

### Redis Configuration

```typescript
// src/config/redis.config.ts
export default {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
  connectTimeout: 10000,
  lazyConnect: true,
  enableOfflineQueue: true,
  maxRetriesPerRequest: 3,
};
```

---

## Rollback Procedure

If issues are detected:

```bash
# Docker rollback
docker stop lexiflow-backend
docker run -d --name lexiflow-backend-v0 [previous_image]

# PM2 rollback
pm2 stop lexiflow-backend
git checkout [previous_version]
npm run build
pm2 restart lexiflow-backend

# Kubernetes rollback
kubectl rollout undo deployment/lexiflow-backend
kubectl rollout status deployment/lexiflow-backend
```

---

## Post-Deployment Validation

### Memory Metrics Validation

```bash
# Run memory stress test
npm run test:memory:stress

# Expected results:
# - Heap usage should stabilize under 4GB with 10K concurrent requests
# - Cache hit rate should be > 80%
# - GC pause time should be < 50ms p99
# - No memory leaks over 1 hour sustained load
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load/memory-optimized.js

# Expected thresholds:
# - p95 latency < 200ms
# - p99 latency < 500ms
# - Error rate < 0.1%
# - Memory growth < 100MB per million requests
```

### Smoke Tests

```bash
# Run full test suite
npm run test:e2e

# Verify critical paths
npm run test:e2e:critical

# Check for memory leaks
npm run test:memory:leak-detection
```

---

## Support and Troubleshooting

### Common Issues

#### Issue: High memory usage after deployment
**Solution:**
1. Check cache sizes: `curl http://localhost:3000/monitoring/memory-metrics`
2. Verify GC is enabled: `node -e "console.log(typeof global.gc)"`
3. Review batch sizes in configuration
4. Force GC: `curl -X POST http://localhost:3000/monitoring/gc`

#### Issue: Slow query performance
**Solution:**
1. Check query cache hit rates
2. Verify database indices are created
3. Review slow query logs
4. Adjust batch sizes based on memory

#### Issue: WebSocket connection limits
**Solution:**
1. Verify WS_MAX_GLOBAL_CONNECTIONS setting
2. Check Redis connection
3. Review connection cleanup logs

### Emergency Procedures

#### Memory Leak Detected
```bash
# Take heap snapshot
curl -X POST http://localhost:3000/monitoring/heap-snapshot > heap-$(date +%s).heapsnapshot

# Analyze in Chrome DevTools
# Open chrome://inspect -> Memory -> Load snapshot

# Restart application if critical
pm2 restart lexiflow-backend
```

---

## Success Criteria

✅ Application starts without errors  
✅ All health checks return 200 OK  
✅ Memory usage stabilizes under 4GB  
✅ Cache hit rate > 80%  
✅ p95 latency < 200ms  
✅ Zero memory leaks after 1 hour  
✅ GC pause time < 50ms p99  
✅ All E2E tests passing  

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | _____________ | _______ | _________ |
| DevOps Lead | _____________ | _______ | _________ |
| QA Lead | _____________ | _______ | _________ |
| Product Manager | _____________ | _______ | _________ |

---

**Deployment Status:** ⏳ Awaiting Approval  
**Next Review:** [Date]  
**Rollback Plan:** Documented ✅  
**Monitoring:** Configured ✅  
**Documentation:** Complete ✅  
