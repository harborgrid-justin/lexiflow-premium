# LexiFlow Premium - Production Release
# Memory Management Implementation
# Version: 1.0.0
# Date: December 27, 2025

## 🎯 Production Release Checklist

### ✅ Core Memory Management

- [x] Memory monitoring utilities (`common/utils/memory-management.utils.ts`)
- [x] Memory leak detector service (`common/services/memory-leak-detector.service.ts`)
- [x] Enhanced memory health indicators (`health/indicators/enhanced-memory.health.ts`)
- [x] Memory management controller (`monitoring/memory-management.controller.ts`)
- [x] Memory management module (`common/memory-management.module.ts`)

### ✅ Backend Fixes

- [x] Connection pool optimizer cleanup
- [x] Cache strategy service with LRU eviction
- [x] Reports service with bounded memory
- [x] Event bus service cleanup
- [x] IP reputation guard timeout management
- [x] Bulk operations memory cleanup
- [x] Search service cache management
- [x] WebSocket gateway graceful shutdown

### ✅ Frontend Enhancements

- [x] Frontend memory monitor (`frontend/src/utils/memoryMonitor.ts`)
- [x] Performance tracking hooks (`frontend/src/hooks/usePerformanceTracking.ts`)
- [x] Existing React 18 hooks verified (useAdaptiveLoading, useAppController)

### ✅ Production Scripts

- [x] Bash startup script (`backend/scripts/start-production-memory-optimized.sh`)
- [x] PowerShell startup script (`backend/scripts/start-production-memory-optimized.ps1`)
- [x] Production environment template (`.env.production.template`)

## 🚀 Deployment Instructions

### Step 1: Environment Configuration

1. Copy `.env.production.template` to `.env.production`
2. Update all `CHANGE_ME_*` values with production credentials
3. Configure memory thresholds based on your server specs
4. Set up Redis connection details

```bash
cd backend
cp .env.production.template .env.production
# Edit .env.production with your values
```

### Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

### Step 3: Database Setup

```bash
cd backend
npm run migration:run
npm run seed  # Optional: seed initial data
```

### Step 4: Start Services

**Linux/Mac:**
```bash
cd backend/scripts
chmod +x start-production-memory-optimized.sh
./start-production-memory-optimized.sh production
```

**Windows:**
```powershell
cd backend\scripts
.\start-production-memory-optimized.ps1 -Environment production
```

**Docker (Alternative):**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 5: Verify Deployment

1. **Health Check:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Memory Stats:**
   ```bash
   curl http://localhost:3000/api/monitoring/memory/stats
   ```

3. **Memory Health:**
   ```bash
   curl http://localhost:3000/api/monitoring/memory/health
   ```

## 📊 Monitoring Endpoints

### Production Monitoring

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Overall health including memory |
| `/api/monitoring/memory/stats` | GET | Current memory statistics |
| `/api/monitoring/memory/health` | GET | Memory health with recommendations |
| `/api/monitoring/memory/heap-statistics` | GET | V8 heap details |
| `/api/monitoring/memory/leaks` | GET | Detected memory leaks |
| `/api/monitoring/memory/process-info` | GET | Process information |

### Admin Operations

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/monitoring/memory/gc` | POST | Force garbage collection | Admin |
| `/api/monitoring/memory/leaks/check` | POST | Trigger leak detection | Admin |
| `/api/monitoring/memory/leaks/snapshot` | POST | Take memory snapshot | Admin |
| `/api/monitoring/memory/leaks/configure` | POST | Configure leak detector | Admin |

## 🔍 Monitoring Setup

### Prometheus Metrics

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'lexiflow-backend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/monitoring/memory-metrics'
    scrape_interval: 30s
```

### Alerting Rules

Create `alerts/memory.yml`:

```yaml
groups:
  - name: memory
    interval: 30s
    rules:
      - alert: HighMemoryUsage
        expr: heap_usage_percent > 85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value }}%"

      - alert: MemoryLeak
        expr: heap_growth_mb > 100
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Potential memory leak detected"
          description: "Heap grew by {{ $value }}MB"
```

### Grafana Dashboard

Import dashboard JSON from `docs/monitoring/grafana-memory-dashboard.json`

Key Panels:
- Heap usage over time
- Memory growth rate
- Garbage collection frequency
- Leak detection alerts
- Component render performance (frontend)

## 🔧 Configuration Options

### Memory Thresholds

Adjust in `.env.production`:

```bash
MEMORY_WARNING_THRESHOLD=75     # Warn at 75% heap usage
MEMORY_CRITICAL_THRESHOLD=85    # Critical at 85%
MEMORY_CHECK_INTERVAL_MS=60000  # Check every minute
```

### Leak Detection

```bash
LEAK_DETECTION_ENABLED=true
LEAK_CHECK_INTERVAL_MS=300000      # Check every 5 minutes
HEAP_GROWTH_THRESHOLD_MB=50        # Alert if heap grows 50MB
AUTO_GC_ON_LEAK=false              # Don't auto-GC (use manual)
```

### Cache Limits

```bash
CACHE_MAX_MEMORY_ENTRIES=10000     # Max 10k cache entries
CACHE_MAX_MEMORY_SIZE=104857600    # 100MB max cache size
CACHE_CLEANUP_INTERVAL_MS=60000    # Cleanup every minute
```

## 🧪 Testing Memory Management

### Load Testing

Use provided k6 scripts:

```bash
k6 run tests/load/memory-stress.js --vus 100 --duration 30m
```

### Memory Profiling

1. **Start with profiling:**
   ```bash
   node --inspect dist/main.js
   ```

2. **Open Chrome DevTools:**
   - Navigate to `chrome://inspect`
   - Click "inspect" on the Node process
   - Go to Memory tab
   - Take heap snapshots

3. **Analyze:**
   - Look for detached DOM nodes (frontend)
   - Check for retained closures
   - Monitor heap growth over time

### Automated Testing

```bash
# Backend tests
cd backend
npm run test:memory

# Frontend tests
cd frontend
npm run test:performance
```

## 📈 Performance Benchmarks

### Expected Metrics (4GB heap)

| Metric | Idle | Normal Load | Peak Load |
|--------|------|-------------|-----------|
| Heap Used | 150-200 MB | 400-600 MB | 1.2-1.8 GB |
| RSS | 250-300 MB | 600-800 MB | 1.5-2.0 GB |
| Response Time | < 100ms | < 200ms | < 500ms |
| GC Pauses | < 10ms | < 20ms | < 50ms |

### Frontend Metrics

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Heap Usage | < 50 MB | < 100 MB | > 150 MB |
| Render Time | < 16ms | < 50ms | > 100ms |
| Memory Trend | Stable | Slight growth | Constant growth |

## 🛠️ Troubleshooting

### High Memory Usage

1. **Check current stats:**
   ```bash
   curl http://localhost:3000/api/monitoring/memory/health
   ```

2. **Review leaks:**
   ```bash
   curl http://localhost:3000/api/monitoring/memory/leaks
   ```

3. **Force GC:**
   ```bash
   curl -X POST http://localhost:3000/api/monitoring/memory/gc \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

### Memory Leaks Detected

1. **Take snapshot:**
   ```bash
   curl -X POST http://localhost:3000/api/monitoring/memory/leaks/snapshot \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

2. **Review leak history:**
   ```bash
   curl http://localhost:3000/api/monitoring/memory/leaks?limit=20
   ```

3. **Analyze patterns:**
   - Check leak types (heap-growth, retained-objects)
   - Review timestamp correlations
   - Identify affected components

### Cache Issues

1. **Check cache stats:**
   ```bash
   curl http://localhost:3000/api/monitoring/cache/stats
   ```

2. **Clear specific namespace:**
   ```bash
   curl -X POST http://localhost:3000/api/cache/clear/namespace \
     -H "Content-Type: application/json" \
     -d '{"namespace": "cases"}'
   ```

## 📚 Related Documentation

- [COMPREHENSIVE_MEMORY_AUDIT.md](./COMPREHENSIVE_MEMORY_AUDIT.md) - Complete audit report
- [backend/MEMORY_OPTIMIZATION_SUMMARY.md](./backend/MEMORY_OPTIMIZATION_SUMMARY.md) - Backend specifics
- [backend/PERFORMANCE_AUDIT_REPORT.md](./backend/PERFORMANCE_AUDIT_REPORT.md) - Performance analysis

## 🆘 Support

For issues or questions:
1. Check logs: `./backend/logs/application.log`
2. Review health endpoints
3. Consult troubleshooting guide above
4. Contact DevOps team

## 📝 License

LexiFlow Premium - Enterprise Legal OS
Copyright © 2025 - All Rights Reserved
