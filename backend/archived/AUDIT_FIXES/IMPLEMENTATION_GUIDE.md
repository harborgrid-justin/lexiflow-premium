# MIDDLEWARE/INTERCEPTORS FIX IMPLEMENTATION GUIDE

## Quick Reference for Developers

This guide provides step-by-step instructions to implement all middleware and interceptor fixes identified in the audit.

---

## ⚡ CRITICAL FIXES (DO FIRST - 4-6 hours)

### Fix 1: Remove Duplicate Exception Filter

**File:** `/backend/src/main.ts`

**Remove these lines (around line 64):**
```typescript
// REMOVE THIS
app.useGlobalFilters(new EnterpriseExceptionFilter());
```

**Keep ONLY the APP_FILTER provider in AppModule** - it's already there.

✅ **Verify:** Check that errors are handled correctly without duplicate processing

---

### Fix 2: Add Body Parser Configuration

**File:** `/backend/src/main.ts`

**Replace:**
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});
```

**With:**
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  bodyParser: false, // Disable to configure manually
});

// Add these imports at top
import * as express from 'express';

// Add AFTER app creation, BEFORE any other middleware
app.use(express.json({
  limit: MasterConfig.REQUEST_BODY_LIMIT,
  strict: true,
  type: ['application/json', 'application/csp-report'],
}));

app.use(express.urlencoded({
  limit: MasterConfig.REQUEST_BODY_LIMIT,
  extended: true,
  parameterLimit: MasterConfig.REQUEST_PARAMETER_LIMIT,
}));
```

✅ **Verify:** Try sending a 100MB JSON payload - should be rejected

---

### Fix 3: Enhance Helmet Configuration

**File:** `/backend/src/main.ts`

**Replace:**
```typescript
app.use(helmet());
```

**With:**
```typescript
app.use(helmet({
  hsts: {
    maxAge: MasterConfig.HELMET_HSTS_MAX_AGE,
    includeSubDomains: MasterConfig.HELMET_HSTS_INCLUDE_SUBDOMAINS,
    preload: MasterConfig.HELMET_HSTS_PRELOAD,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  dnsPrefetchControl: { allow: false },
  ieNoOpen: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}));
```

✅ **Verify:** Check response headers include CSP, HSTS, X-Frame-Options

---

### Fix 4: Add Missing Configurations

**File:** `/backend/src/main.ts`

**Add these BEFORE `await app.listen()`:**
```typescript
// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Enable graceful shutdown
app.enableShutdownHooks();
```

✅ **Verify:** IP addresses in logs are correct, not load balancer IPs

---

### Fix 5: Enhanced CORS Configuration

**File:** `/backend/src/main.ts`

**Replace:**
```typescript
app.enableCors({
  origin: configService.get('cors.origin'),
  credentials: configService.get('cors.credentials'),
});
```

**With:**
```typescript
app.enableCors({
  origin: configService.get('cors.origin'),
  credentials: configService.get('cors.credentials'),
  methods: MasterConfig.CORS_ALLOWED_METHODS,
  allowedHeaders: MasterConfig.CORS_ALLOWED_HEADERS,
  exposedHeaders: MasterConfig.CORS_EXPOSED_HEADERS,
  maxAge: MasterConfig.CORS_MAX_AGE,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

✅ **Verify:** Preflight requests are cached (check OPTIONS response)

---

## 🔥 HIGH PRIORITY FIXES (DO SECOND - 8-12 hours)

### Fix 6: Create Request ID Middleware

**Create new file:** `/backend/src/common/middleware/request-id.middleware.ts`

**Copy from:** `AUDIT_FIXES/request-id.middleware.ts`

**Register in AppModule:**
```typescript
// app.module.ts - in configure() method
configure(consumer: MiddlewareConsumer) {
  // MUST BE FIRST
  consumer
    .apply(RequestIdMiddleware)
    .forRoutes('*');

  // Then sanitization
  consumer
    .apply(SanitizationMiddleware)
    .exclude(
      { path: 'health', method: RequestMethod.GET },
      { path: 'api/docs', method: RequestMethod.ALL },
      { path: 'api/docs/(.*)', method: RequestMethod.ALL },
    )
    .forRoutes('*');
}
```

✅ **Verify:** All requests have X-Request-ID header in response

---

### Fix 7: Replace Logging Interceptor

**Replace file:** `/backend/src/common/interceptors/logging.interceptor.ts`

**Copy from:** `AUDIT_FIXES/logging.interceptor.ENHANCED.ts`

**No registration changes needed** - already registered in AppModule

✅ **Verify:** Logs include correlationId, structured JSON format

---

### Fix 8: Replace Timeout Interceptor

**Replace file:** `/backend/src/common/interceptors/timeout.interceptor.ts`

**Copy from:** `AUDIT_FIXES/timeout.interceptor.ENHANCED.ts`

**Update AppModule registration:**
```typescript
// app.module.ts - providers array
{
  provide: APP_INTERCEPTOR,
  useFactory: () => new TimeoutInterceptor(MasterConfig.REQUEST_TIMEOUT_MS),
},
```

✅ **Verify:** Uploads get 5min timeout, APIs get 30sec timeout

---

### Fix 9: Replace Sanitization Middleware

**Replace file:** `/backend/src/common/middleware/sanitization.middleware.ts`

**Copy from:** `AUDIT_FIXES/sanitization.middleware.FIXED.ts`

**No registration changes needed** - already registered in AppModule

✅ **Verify:** Test with "A & B < C" - should NOT be HTML encoded

---

### Fix 10: Add Performance Monitoring

**Create new file:** `/backend/src/common/interceptors/performance-monitoring.interceptor.ts`

**Copy from:** `AUDIT_FIXES/performance-monitoring.interceptor.ts`

**Register in AppModule:**
```typescript
// app.module.ts - providers array
{
  provide: APP_INTERCEPTOR,
  useClass: PerformanceMonitoringInterceptor,
},
```

✅ **Verify:** Logs show aggregate metrics every 60 seconds

---

### Fix 11: Update Interceptor Ordering in AppModule

**File:** `/backend/src/app.module.ts`

**Replace the providers array with this ordering:**
```typescript
providers: [
  AppService,

  // Global Guards
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },

  // Global Interceptors - ORDER MATTERS!
  // 1. Correlation ID - Must be first
  {
    provide: APP_INTERCEPTOR,
    useClass: CorrelationIdInterceptor,
  },
  // 2. Performance Monitoring - Needs correlation ID
  {
    provide: APP_INTERCEPTOR,
    useClass: PerformanceMonitoringInterceptor,
  },
  // 3. Logging - Needs correlation ID
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },
  // 4. Timeout - Should wrap handler
  {
    provide: APP_INTERCEPTOR,
    useFactory: () => new TimeoutInterceptor(MasterConfig.REQUEST_TIMEOUT_MS),
  },
  // 5. Response Transform - Should be last
  {
    provide: APP_INTERCEPTOR,
    useClass: ResponseTransformInterceptor,
  },

  // Global Filters
  {
    provide: APP_FILTER,
    useClass: EnterpriseExceptionFilter,
  },
],
```

✅ **Verify:** Correlation IDs appear in all logs, performance metrics include IDs

---

## 🟡 MEDIUM PRIORITY FIXES (DO THIRD - 4-6 hours)

### Fix 12: Add Security Headers Middleware

**Create new file:** `/backend/src/common/middleware/security-headers.middleware.ts`

**Copy from:** `AUDIT_FIXES/security-headers.middleware.ts`

**Register in AppModule (OPTIONAL - already covered by Helmet):**
```typescript
// Only needed if you want additional API-specific headers
consumer
  .apply(SecurityHeadersMiddleware)
  .forRoutes('*');
```

✅ **Verify:** Response includes Permissions-Policy, CORP headers

---

### Fix 13: Enhanced Compression

**File:** `/backend/src/main.ts`

**Replace:**
```typescript
app.use(compression.default());
```

**With:**
```typescript
app.use(compression.default({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.default.filter(req, res);
  },
  level: MasterConfig.COMPRESSION_LEVEL,
  threshold: MasterConfig.COMPRESSION_THRESHOLD,
  memLevel: 8,
}));
```

✅ **Verify:** Small responses (<1KB) not compressed, large ones are

---

## 📋 TESTING CHECKLIST

### Unit Tests

```bash
# Test each component
npm test -- logging.interceptor.spec.ts
npm test -- timeout.interceptor.spec.ts
npm test -- sanitization.middleware.spec.ts
npm test -- request-id.middleware.spec.ts
npm test -- performance-monitoring.interceptor.spec.ts
```

### Integration Tests

```bash
# Test the full pipeline
npm run test:e2e
```

### Manual Testing

1. **Correlation IDs:**
```bash
curl -X GET http://localhost:3000/api/health \
  -H "X-Correlation-ID: test-123"

# Response should include: X-Correlation-ID: test-123
```

2. **Body Size Limits:**
```bash
# Should fail with 413 Payload Too Large
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d @large-file.json
```

3. **Security Headers:**
```bash
curl -I http://localhost:3000/api/health

# Should include:
# X-Content-Security-Policy
# Strict-Transport-Security
# X-Frame-Options: DENY
```

4. **Slow Request Logging:**
```bash
# Make a request to a slow endpoint
# Check logs for "SLOW REQUEST DETECTED" warning
```

5. **Sanitization:**
```bash
# Test that legitimate data isn't corrupted
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"text": "A & B < C"}'

# Response should preserve: "A & B < C"
# NOT: "&amp;amp; &amp;lt;"
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Deploy to Staging

```bash
# 1. Apply all fixes
git checkout -b fix/middleware-audit-fixes

# 2. Copy all AUDIT_FIXES files to their destinations
cp AUDIT_FIXES/request-id.middleware.ts src/common/middleware/
cp AUDIT_FIXES/logging.interceptor.ENHANCED.ts src/common/interceptors/logging.interceptor.ts
cp AUDIT_FIXES/timeout.interceptor.ENHANCED.ts src/common/interceptors/timeout.interceptor.ts
cp AUDIT_FIXES/sanitization.middleware.FIXED.ts src/common/middleware/sanitization.middleware.ts
cp AUDIT_FIXES/performance-monitoring.interceptor.ts src/common/interceptors/

# 3. Update main.ts and app.module.ts manually (see fixes above)

# 4. Test locally
npm run test
npm run test:e2e

# 5. Commit and push
git add .
git commit -m "fix: implement middleware/interceptor audit fixes"
git push origin fix/middleware-audit-fixes

# 6. Deploy to staging
npm run deploy:staging
```

### Step 2: Validate Staging

```bash
# Run load tests
npm run test:load

# Check logs for correlation IDs
# Verify slow request tracking
# Test security headers
# Validate error handling
```

### Step 3: Deploy to Production

```bash
# Create PR and get approval
# Merge to main
# Deploy to production with monitoring

npm run deploy:production

# Monitor for 2 hours
# Check error rates
# Verify correlation IDs in logs
# Confirm no performance degradation
```

---

## 📊 MONITORING AFTER DEPLOYMENT

### Dashboards to Create

1. **Request Performance:**
   - P50, P95, P99 latencies
   - Slow requests (>3s) per hour
   - Timeout rate

2. **Error Tracking:**
   - 4xx vs 5xx errors
   - Top error endpoints
   - Error rate trending

3. **Security Events:**
   - Sanitization triggers
   - Rate limit violations
   - Unusual patterns

### Alerts to Configure

```yaml
# Critical: High error rate
- alert: HighErrorRate
  expr: error_rate > 5%
  severity: critical

# Warning: Slow requests
- alert: SlowRequests
  expr: p95_latency > 5000ms
  severity: warning

# Critical: Timeout spike
- alert: TimeoutSpike
  expr: timeout_rate > 1%
  severity: critical
```

---

## 🆘 ROLLBACK PLAN

If issues occur in production:

```bash
# 1. Immediate rollback
git revert <commit-hash>
git push origin main
npm run deploy:production

# 2. Investigate logs
# Look for correlation IDs
# Check error patterns
# Review slow requests

# 3. Fix and redeploy
# Address specific issue
# Test in staging
# Redeploy to production
```

---

## ✅ COMPLETION CHECKLIST

### Before Marking Complete

- [ ] All CRITICAL fixes deployed
- [ ] All HIGH priority fixes deployed
- [ ] All tests passing
- [ ] Staging validated
- [ ] Production deployed
- [ ] Monitoring dashboards created
- [ ] Alerts configured
- [ ] Team trained on new logging format
- [ ] Documentation updated
- [ ] Runbook created for common issues

### Success Criteria

- ✅ No duplicate filter errors
- ✅ Body size limits enforced (test with large payloads)
- ✅ Security headers present (check with curl -I)
- ✅ Correlation IDs in all logs
- ✅ Slow requests tracked (>3s)
- ✅ Performance metrics aggregating
- ✅ Sanitization preserves legitimate data
- ✅ Error rate <0.1%
- ✅ P95 latency <2s
- ✅ Timeout rate <0.01%

---

## 📞 SUPPORT

If you encounter issues during implementation:

1. **Check the full audit report:** `MIDDLEWARE_INTERCEPTORS_AUDIT_REPORT.md`
2. **Review error logs** with correlation IDs
3. **Test each fix individually** before combining
4. **Use the provided test cases** to validate
5. **Monitor metrics** during deployment

**Estimated Total Time:** 16-24 hours (2-3 days)

**Priority Order:** CRITICAL → HIGH → MEDIUM

**Deployment Strategy:** Incremental (test each phase separately)

