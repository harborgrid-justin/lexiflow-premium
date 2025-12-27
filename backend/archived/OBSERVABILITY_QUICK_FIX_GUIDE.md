# Observability Quick Fix Guide
## Critical Issues - Fix Now

**Agent 10 Observability Audit - December 27, 2025**

---

## 🚨 CRITICAL: Application Will Crash If Tracing Is Enabled

### Problem
Missing dependency `@opentelemetry/sdk-trace-base` will cause runtime error.

### Fix (5 minutes)
```bash
cd /home/user/lexiflow-premium/backend
npm install @opentelemetry/sdk-trace-base@^1.29.0
```

---

## 🔴 CRITICAL: Enable OpenTelemetry

### Current State
```bash
OTEL_ENABLED=false  # Tracing disabled
```

### Fix
Edit `.env` file:
```bash
OTEL_ENABLED=true
OTEL_SERVICE_NAME=lexiflow-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
OTEL_LOG_LEVEL=info
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

---

## 🔴 CRITICAL: Add Trace Sampling (Avoid 100% Capture)

### File: `src/monitoring/services/distributed.tracing.service.ts`

**Line 1** - Add import:
```typescript
import { TraceIdRatioBasedSampler, ParentBasedSampler } from '@opentelemetry/sdk-trace-base';
```

**Line 84** - Replace:
```typescript
// BEFORE
this.sdk = new NodeSDK({
  resource,
  spanProcessors: [spanProcessor],
});

// AFTER
const samplerArg = parseFloat(process.env.OTEL_TRACES_SAMPLER_ARG || '0.1');
const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(samplerArg),
});

this.sdk = new NodeSDK({
  resource,
  spanProcessors: [spanProcessor],
  sampler, // Add this line
});
```

---

## 🟠 HIGH PRIORITY: Correlate Logs and Traces

### File: `src/monitoring/services/structured.logger.service.ts`

**Line 1** - Add import:
```typescript
import { trace } from '@opentelemetry/api';
```

**Line 220** - Update `buildMetadata` method:
```typescript
private buildMetadata(context?: string | LogContext, additionalMeta?: any): any {
  const currentContext = this.getContext();
  let contextData: LogContext = {};

  if (typeof context === 'string') {
    contextData.context = context;
  } else if (context) {
    contextData = context;
  }

  // ADD THIS BLOCK - Inject trace context
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    contextData.traceId = spanContext.traceId;
    contextData.spanId = spanContext.spanId;
    contextData.traceFlags = spanContext.traceFlags;
  }
  // END OF NEW BLOCK

  const metadata = {
    ...currentContext,
    ...contextData,
    ...additionalMeta,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'lexiflow-backend',
  };

  return this.redactPII(metadata);
}
```

---

## 🟠 HIGH PRIORITY: Enable Telemetry Module

### File: `src/app.module.ts`

**Line 34** - Uncomment:
```typescript
// BEFORE
// Note: OpenTelemetry telemetry module is available but optional
// Uncomment to enable: import { TelemetryModule } from './telemetry/telemetry.module';

// AFTER
import { TelemetryModule } from './telemetry/telemetry.module';
```

**Line 214** - Add to imports:
```typescript
imports: [
  // ... other imports

  // Telemetry & Observability
  TelemetryModule, // Add this line

  // ... rest of imports
]
```

---

## 🟡 MEDIUM PRIORITY: Install Additional Instrumentation

### Optional but Recommended
```bash
npm install \
  @opentelemetry/instrumentation-http@^0.54.0 \
  @opentelemetry/instrumentation-express@^0.43.0 \
  @opentelemetry/instrumentation-pg@^0.47.0 \
  @opentelemetry/instrumentation-redis-4@^0.43.0
```

---

## Testing the Fixes

### 1. Start OpenTelemetry Collector (Docker)

```bash
docker run -d --name otel-collector \
  -p 4318:4318 \
  -p 4317:4317 \
  otel/opentelemetry-collector:latest
```

### 2. Start the Application

```bash
npm run start:dev
```

### 3. Verify Tracing is Working

**Check logs for:**
```
[Telemetry] OpenTelemetry initialized successfully
```

**Make a test request:**
```bash
curl http://localhost:5000/api/v1/health
```

**Check logs for trace ID:**
```json
{
  "timestamp": "2025-12-27 10:30:45.123",
  "level": "info",
  "message": "Request completed: GET /api/v1/health - 200 - 45ms",
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "spanId": "q1w2e3r4t5y6u7i8"
}
```

✅ If you see `traceId` and `spanId` in logs, tracing is working!

---

## Common Issues

### Issue: "Cannot find module '@opentelemetry/sdk-trace-base'"
**Solution:** Run `npm install @opentelemetry/sdk-trace-base@^1.29.0`

### Issue: No traces appearing
**Solution:** Check `OTEL_ENABLED=true` in .env and restart application

### Issue: Too many traces / high costs
**Solution:** Adjust `OTEL_TRACES_SAMPLER_ARG` (0.1 = 10% sampling)

### Issue: Logs don't have trace IDs
**Solution:** Verify trace ID injection code in `structured.logger.service.ts`

---

## Quick Verification Checklist

- [ ] Install `@opentelemetry/sdk-trace-base`
- [ ] Set `OTEL_ENABLED=true` in .env
- [ ] Add sampling configuration
- [ ] Add trace ID injection to logs
- [ ] Enable TelemetryModule in app.module.ts
- [ ] Restart application
- [ ] Make test request
- [ ] Verify trace ID appears in logs
- [ ] Check OpenTelemetry collector receives traces

---

## Performance Impact

| Configuration | Traces Captured | Performance Impact | Cost Impact |
|--------------|-----------------|-------------------|-------------|
| No sampling (current) | 100% | High (5-10% overhead) | Very High |
| 10% sampling (recommended) | 10% | Low (0.5-1% overhead) | Low |
| 1% sampling | 1% | Minimal (<0.1%) | Very Low |

**Recommendation:** Start with 10% (`OTEL_TRACES_SAMPLER_ARG=0.1`), adjust based on traffic.

---

## Next Steps After Quick Fixes

1. **Set up Grafana dashboards** (see main audit report)
2. **Implement SLA monitoring** (code provided in JSON report)
3. **Choose and integrate APM platform** (Datadog or New Relic)
4. **Add business metrics** for legal operations

---

## Need Help?

- **Full Audit Report:** `OBSERVABILITY_AUDIT_REPORT.json`
- **Detailed Summary:** `OBSERVABILITY_AUDIT_SUMMARY.md`
- **OpenTelemetry Docs:** https://opentelemetry.io/docs/

---

**Created by:** Enterprise Agent 10 - Observability Audit
**Date:** December 27, 2025
