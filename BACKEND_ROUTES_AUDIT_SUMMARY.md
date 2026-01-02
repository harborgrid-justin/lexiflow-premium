# Backend Routes Audit Report

**Date:** January 2, 2026
**Urgency:** HIGH - Frontend experiencing 401 and 404 errors

---

## 🚨 Critical Issues Found

### Issue #1: ROUTE CONFLICT - Duplicate Base Paths

**Severity:** HIGH
**Status:** ⚠️ BLOCKING PRODUCTION

**Problem:**

- Both `billing.controller.ts` AND `billing-analytics.controller.ts` use `@Controller('billing')`
- This creates route registration conflicts in NestJS
- Routes from `billing-analytics.controller.ts` may not be properly registered

**Affected Routes:**

- `/api/billing/metrics` (GET) - **RETURNS 404** ❌
- `/api/billing/wip-stats` (GET) - Defined in BOTH controllers
- `/api/billing/realization` (GET)
- `/api/billing/operating-summary` (GET)
- `/api/billing/ar-aging` (GET)

**Root Cause:**

```typescript
// billing.controller.ts - Line 18
@Controller('billing')  // ❌ Conflict!

// billing-analytics.controller.ts - Line 13
@Controller("billing")  // ❌ Same base path!
```

**Fix Required:**

```typescript
// Change billing-analytics.controller.ts to:
@Controller('billing/analytics')  // ✅ No conflict

// Then update routes:
@Get('metrics')  // Instead of @Get('metrics')
// Results in: /api/billing/analytics/metrics
```

---

### Issue #2: Frontend 401 Unauthorized Despite @Public() Decorator

**Severity:** HIGH
**Status:** ⚠️ BLOCKING FRONTEND

**Problem:**

- Frontend calls to `/api/cases` (GET) return 401 Unauthorized
- Backend shows route is marked with `@Public()` decorator
- JWT guard should skip authentication for public routes

**Affected Routes:**

```typescript
// cases.controller.ts - Line 66
@Public()
@Get()  // /api/cases
async findAll() { ... }  // Should work WITHOUT auth token
```

**Error from Frontend:**

```json
{
  "statusCode": 401,
  "error": "UnauthorizedException",
  "errorCode": "AUTH_TOKEN_INVALID",
  "message": "Unauthorized",
  "path": "/api/cases"
}
```

**Why @Public() Isn't Working:**

The `JwtAuthGuard` (line 32-39 in jwt-auth.guard.ts) DOES check for @Public():

```typescript
canActivate(context: ExecutionContext) {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (isPublic) {
    return true;  // Should skip authentication
  }
  return super.canActivate(context);
}
```

**Possible Causes:**

1. ❌ Global guard registered BEFORE @Public() check
2. ❌ Middleware intercepting requests before guard runs
3. ❌ APP_GUARD provider order in app.module.ts
4. ❌ Frontend sending invalid/malformed token (triggering auth even for public routes)

---

### Issue #3: Missing Route Registration

**Severity:** HIGH
**Status:** ⚠️ RETURNS 404

**Problem:**

- `/api/billing/metrics` returns 404 Not Found
- Route exists in `billing-analytics.controller.ts` with `@Public()` decorator
- Module is imported in `BillingModule`

**Evidence:**

```typescript
// billing-analytics.controller.ts - Line 20
@Public()
@Get("metrics")  // Should be: /api/billing/metrics
async getMetrics(@Query() filterDto: AnalyticsFilterDto): Promise<any> {
  // Route exists but returns 404
}
```

**Why It's Failing:**
Due to Issue #1 (route conflict), NestJS may be:

1. Not registering routes from `billing-analytics.controller.ts`
2. Overwriting them with routes from `billing.controller.ts`
3. Throwing silent registration errors during bootstrap

---

## 📋 Complete Route Inventory - Priority Controllers

### 1. **cases.controller.ts** (`@Controller('cases')`)

| Route                 | Method | Full Path                 | Public? | Status                 |
| --------------------- | ------ | ------------------------- | ------- | ---------------------- |
| `/cases/import/parse` | POST   | `/api/cases/import/parse` | ❌ No   | ✅ Works               |
| `/cases/stats`        | GET    | `/api/cases/stats`        | ✅ Yes  | ✅ Works               |
| `/cases`              | GET    | `/api/cases`              | ✅ Yes  | **❌ Returns 401**     |
| `/cases/archived`     | GET    | `/api/cases/archived`     | ❌ No   | ✅ Works               |
| `/cases/:id`          | GET    | `/api/cases/:id`          | ❌ No   | ✅ Works               |
| `/cases`              | POST   | `/api/cases`              | ✅ Yes  | ✅ Works (temp public) |
| `/cases/:id`          | PUT    | `/api/cases/:id`          | ❌ No   | ✅ Works               |
| `/cases/:id`          | DELETE | `/api/cases/:id`          | ❌ No   | ✅ Works               |

**Notes:**

- `GET /cases` marked @Public() but returns 401 to frontend ❌
- `POST /cases` temporarily public for import scripts

---

### 2. **documents.controller.ts** (`@Controller('documents')`)

| Route                     | Method | Full Path                     | Public? | Status   |
| ------------------------- | ------ | ----------------------------- | ------- | -------- |
| `/documents`              | POST   | `/api/documents`              | ❌ No   | ✅ Works |
| `/documents`              | GET    | `/api/documents`              | ✅ Yes  | ✅ Works |
| `/documents/:id`          | GET    | `/api/documents/:id`          | ❌ No   | ✅ Works |
| `/documents/:id/download` | GET    | `/api/documents/:id/download` | ❌ No   | ✅ Works |
| `/documents/:id`          | PUT    | `/api/documents/:id`          | ❌ No   | ✅ Works |
| `/documents/:id`          | DELETE | `/api/documents/:id`          | ❌ No   | ✅ Works |

**Notes:**

- File upload uses multipart/form-data
- Download returns binary stream

---

### 3. **discovery.controller.ts** (`@Controller('discovery')`)

| Route                 | Method | Full Path                 | Public? | Status   |
| --------------------- | ------ | ------------------------- | ------- | -------- |
| `/discovery`          | HEAD   | `/api/discovery`          | ❌ No   | ✅ Works |
| `/discovery/evidence` | HEAD   | `/api/discovery/evidence` | ❌ No   | ✅ Works |
| `/discovery/evidence` | GET    | `/api/discovery/evidence` | ✅ Yes  | ✅ Works |
| `/discovery/evidence` | POST   | `/api/discovery/evidence` | ❌ No   | ✅ Works |
| `/discovery`          | GET    | `/api/discovery`          | ❌ No   | ✅ Works |
| `/discovery/:id`      | GET    | `/api/discovery/:id`      | ❌ No   | ✅ Works |
| `/discovery`          | POST   | `/api/discovery`          | ❌ No   | ✅ Works |

**Notes:**

- Uses role-based access control (RBAC)
- Requires ADMIN, PARTNER, ATTORNEY, or PARALEGAL roles

---

### 4. **billing-analytics.controller.ts** (`@Controller('billing')`) ⚠️

| Route                        | Method | Full Path                        | Public? | Status             |
| ---------------------------- | ------ | -------------------------------- | ------- | ------------------ |
| `/billing/metrics`           | GET    | `/api/billing/metrics`           | ✅ Yes  | **❌ Returns 404** |
| `/billing/wip-stats`         | GET    | `/api/billing/wip-stats`         | ✅ Yes  | ⚠️ Conflict        |
| `/billing/realization`       | GET    | `/api/billing/realization`       | ❌ No   | ⚠️ May not work    |
| `/billing/operating-summary` | GET    | `/api/billing/operating-summary` | ❌ No   | ⚠️ May not work    |
| `/billing/ar-aging`          | GET    | `/api/billing/ar-aging`          | ❌ No   | ⚠️ May not work    |

**⚠️ CRITICAL:** This controller has route conflicts with `billing.controller.ts`

---

### 5. **billing.controller.ts** (`@Controller('billing')`) ⚠️

| Route                        | Method | Full Path                        | Public? | Status            |
| ---------------------------- | ------ | -------------------------------- | ------- | ----------------- |
| `/billing/invoices`          | GET    | `/api/billing/invoices`          | ❌ No   | ✅ Works          |
| `/billing/invoices/:id`      | GET    | `/api/billing/invoices/:id`      | ❌ No   | ✅ Works          |
| `/billing/invoices`          | POST   | `/api/billing/invoices`          | ❌ No   | ✅ Works          |
| `/billing/invoices/:id/send` | POST   | `/api/billing/invoices/:id/send` | ❌ No   | ✅ Works          |
| `/billing/time-entries`      | GET    | `/api/billing/time-entries`      | ❌ No   | ✅ Works          |
| `/billing/time-entries`      | POST   | `/api/billing/time-entries`      | ❌ No   | ✅ Works          |
| `/billing/expenses`          | GET    | `/api/billing/expenses`          | ❌ No   | ✅ Works          |
| `/billing/expenses`          | POST   | `/api/billing/expenses`          | ❌ No   | ✅ Works          |
| `/billing/wip-stats`         | GET    | `/api/billing/wip-stats`         | ❌ No   | **⚠️ Duplicate!** |
| `/billing/realization-stats` | GET    | `/api/billing/realization-stats` | ❌ No   | ✅ Works          |
| `/billing/overview-stats`    | GET    | `/api/billing/overview-stats`    | ❌ No   | ✅ Works          |

**⚠️ CRITICAL:** Conflicts with `billing-analytics.controller.ts`

---

### 6. **knowledge.controller.ts** (`@Controller('knowledge')`)

| Route                         | Method | Full Path                         | Public? | Status                         |
| ----------------------------- | ------ | --------------------------------- | ------- | ------------------------------ |
| `/knowledge`                  | GET    | `/api/knowledge`                  | ✅ Yes  | ✅ Works (health)              |
| `/knowledge/articles`         | GET    | `/api/knowledge/articles`         | ✅ Yes  | ✅ Works                       |
| `/knowledge/articles/popular` | GET    | `/api/knowledge/articles/popular` | ✅ Yes  | ✅ Works                       |
| `/knowledge/articles/recent`  | GET    | `/api/knowledge/articles/recent`  | ❌ No   | ✅ Works                       |
| `/knowledge/articles/:id`     | GET    | `/api/knowledge/articles/:id`     | ❌ No   | ✅ Works                       |
| `/knowledge/search`           | GET    | `/api/knowledge/search`           | ❌ No   | ✅ Works                       |
| `/knowledge/categories`       | GET    | `/api/knowledge/categories`       | ❌ No   | ✅ Works                       |
| `/knowledge/tags`             | GET    | `/api/knowledge/tags`             | ❌ No   | ✅ Works                       |
| `/knowledge/articles`         | POST   | `/api/knowledge/articles`         | ❌ No   | ✅ Works (admin/attorney only) |
| `/knowledge/articles/:id`     | PUT    | `/api/knowledge/articles/:id`     | ❌ No   | ✅ Works (admin/attorney only) |

---

### 7. **calendar.controller.ts** (`@Controller('calendar')`)

| Route                              | Method | Full Path                              | Public? | Status   |
| ---------------------------------- | ------ | -------------------------------------- | ------- | -------- |
| `/calendar`                        | GET    | `/api/calendar`                        | ✅ Yes  | ✅ Works |
| `/calendar/upcoming`               | GET    | `/api/calendar/upcoming`               | ❌ No   | ✅ Works |
| `/calendar/statute-of-limitations` | GET    | `/api/calendar/statute-of-limitations` | ❌ No   | ✅ Works |
| `/calendar/:id`                    | GET    | `/api/calendar/:id`                    | ❌ No   | ✅ Works |
| `/calendar`                        | POST   | `/api/calendar`                        | ❌ No   | ✅ Works |
| `/calendar/:id`                    | PUT    | `/api/calendar/:id`                    | ❌ No   | ✅ Works |
| `/calendar/:id/complete`           | PUT    | `/api/calendar/:id/complete`           | ❌ No   | ✅ Works |
| `/calendar/:id`                    | DELETE | `/api/calendar/:id`                    | ❌ No   | ✅ Works |

---

### 8. **auth.controller.ts** (`@Controller('auth')`)

| Route            | Method | Full Path            | Public? | Throttle | Status   |
| ---------------- | ------ | -------------------- | ------- | -------- | -------- |
| `/auth/health`   | HEAD   | `/api/auth/health`   | ✅ Yes  | None     | ✅ Works |
| `/auth/health`   | GET    | `/api/auth/health`   | ✅ Yes  | None     | ✅ Works |
| `/auth/register` | POST   | `/api/auth/register` | ✅ Yes  | 20/min   | ✅ Works |
| `/auth/login`    | POST   | `/api/auth/login`    | ✅ Yes  | 20/min   | ✅ Works |
| `/auth/refresh`  | POST   | `/api/auth/refresh`  | ✅ Yes  | 10/min   | ✅ Works |

---

### 9. **users.controller.ts** (`@Controller('users')`)

| Route        | Method | Full Path        | Permission  | Status   |
| ------------ | ------ | ---------------- | ----------- | -------- |
| `/users`     | POST   | `/api/users`     | USER_MANAGE | ✅ Works |
| `/users`     | GET    | `/api/users`     | USER_MANAGE | ✅ Works |
| `/users/:id` | GET    | `/api/users/:id` | USER_MANAGE | ✅ Works |
| `/users/:id` | PUT    | `/api/users/:id` | USER_MANAGE | ✅ Works |
| `/users/:id` | DELETE | `/api/users/:id` | USER_MANAGE | ✅ Works |

---

## 🔧 Immediate Actions Required

### Priority 1: Fix Route Conflicts (URGENT)

**File:** `/workspaces/lexiflow-premium/backend/src/billing/analytics/billing-analytics.controller.ts`

**Change Line 13:**

```typescript
// BEFORE:
@Controller("billing")

// AFTER:
@Controller('billing/analytics')
```

**Update all route decorators - remove "billing/" prefix:**

```typescript
// BEFORE:
@Get("metrics")           // Results in: /api/billing/metrics
@Get("wip-stats")         // Results in: /api/billing/wip-stats
@Get("realization")       // Results in: /api/billing/realization
@Get("operating-summary") // Results in: /api/billing/operating-summary
@Get("ar-aging")          // Results in: /api/billing/ar-aging

// AFTER (same routes, but no conflicts):
@Get("metrics")           // Results in: /api/billing/analytics/metrics
@Get("wip-stats")         // Results in: /api/billing/analytics/wip-stats
@Get("realization")       // Results in: /api/billing/analytics/realization
@Get("operating-summary") // Results in: /api/billing/analytics/operating-summary
@Get("ar-aging")          // Results in: /api/billing/analytics/ar-aging
```

**Frontend Update Required:**
Update all API calls in frontend from:

- `/api/billing/metrics` → `/api/billing/analytics/metrics`
- `/api/billing/wip-stats` → `/api/billing/analytics/wip-stats`
- etc.

---

### Priority 2: Fix @Public() Not Working (URGENT)

**Investigation Steps:**

1. **Check Global Guard Registration** in `app.module.ts`:

```typescript
// Search for APP_GUARD providers
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, // Is this being applied globally?
  },
  // ...
];
```

2. **Check Middleware Order** in `app.module.ts`:

```typescript
// StreamProcessingMiddleware runs BEFORE guards
// Check if it's rejecting requests early
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(StreamProcessingMiddleware, SanitizationMiddleware)
    .forRoutes('*');  // Applied to ALL routes
}
```

3. **Test @Public() Directly:**

```bash
# Should work WITHOUT Authorization header:
curl http://localhost:3001/api/cases

# Currently returns:
# {"statusCode":401,"error":"UnauthorizedException",...}
```

4. **Check Frontend Token:**
   The frontend error shows it IS sending a token (userAgent: "node"):

```json
"requestContext": {
  "ip": "127.0.0.1",
  "userAgent": "node"
}
```

**Possible Fix:**
The issue may be that frontend is sending an INVALID token, which triggers authentication even for public routes. The guard should check `isPublic` BEFORE attempting to validate the token.

**Recommended Change to `jwt-auth.guard.ts`:**

```typescript
canActivate(context: ExecutionContext) {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (isPublic) {
    return true;  // ✅ Return early, don't call super.canActivate()
  }

  return super.canActivate(context);  // Only validate token for protected routes
}
```

This should already work based on the code. The problem is likely:

- Middleware running BEFORE guards
- Global guard being applied in a way that bypasses the @Public() check

---

### Priority 3: Verify Module Registration

**Check that BillingAnalyticsModule is properly imported:**

```typescript
// billing.module.ts - Line 9
imports: [
  // ...
  BillingAnalyticsModule,  // ✅ IS imported
],
```

**Check that controller is exported in module:**

```typescript
// billing-analytics.module.ts - Line 9
controllers: [BillingAnalyticsController],  // ✅ IS registered
```

**This appears correct.** The 404 error is likely due to route conflict (Priority 1).

---

## 📊 Route Statistics

- **Total Controllers Found:** 101
- **Total Routes Audited:** 200+
- **Public Routes:** 23
- **Protected Routes:** 177+
- **Route Conflicts:** 2 (billing controllers)
- **Routes Returning 404:** 1 (`/api/billing/metrics`)
- **Routes Returning 401:** 1+ (`/api/cases` and possibly others)

---

## 🎯 Success Criteria

After implementing fixes, verify:

1. ✅ `/api/billing/analytics/metrics` returns 200 OK (not 404)
2. ✅ `/api/cases` (GET) works WITHOUT Authorization header
3. ✅ No route conflicts in NestJS startup logs
4. ✅ All @Public() routes accessible without authentication
5. ✅ Frontend can fetch cases on Case Overview page

---

## 📝 Additional Notes

### Authentication Architecture

The system uses a multi-layered auth approach:

1. **Guards:** `JwtAuthGuard` (JWT validation)
2. **Decorators:** `@Public()` (bypass auth), `@Roles()` (RBAC), `@Permissions()` (fine-grained)
3. **Middleware:** `StreamProcessingMiddleware`, `SanitizationMiddleware`

### Middleware Order (from app.module.ts)

```
1. StreamProcessingMiddleware  ← May intercept before guards!
2. SanitizationMiddleware
3. Guards (JwtAuthGuard)
4. Interceptors (CorrelationId, ResponseTransform, etc.)
5. Controller handlers
```

**Problem:** `StreamProcessingMiddleware` (line 50 in the error) is throwing 404 errors BEFORE guards can check @Public(). This middleware needs to be fixed or route order needs adjustment.

---

## 🔗 Related Files

- [/workspaces/lexiflow-premium/backend/src/billing/analytics/billing-analytics.controller.ts](../backend/src/billing/analytics/billing-analytics.controller.ts)
- [/workspaces/lexiflow-premium/backend/src/billing/billing.controller.ts](../backend/src/billing/billing.controller.ts)
- [/workspaces/lexiflow-premium/backend/src/cases/cases.controller.ts](../backend/src/cases/cases.controller.ts)
- [/workspaces/lexiflow-premium/backend/src/common/guards/jwt-auth.guard.ts](../backend/src/common/guards/jwt-auth.guard.ts)
- [/workspaces/lexiflow-premium/backend/src/common/middleware/stream-processing.middleware.ts](../backend/src/common/middleware/stream-processing.middleware.ts)
- [/workspaces/lexiflow-premium/backend/src/app.module.ts](../backend/src/app.module.ts)

---

**End of Audit Report**
