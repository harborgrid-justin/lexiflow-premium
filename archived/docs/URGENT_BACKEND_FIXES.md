# URGENT: Backend Route Fixes Required

## 🚨 Critical Issue Summary

Your frontend is experiencing:

1. **404 errors** on `/api/billing/metrics`
2. **401 errors** on `/api/cases` (marked @Public() but still requiring auth)

## Root Cause Identified

### Issue 1: Route Conflict Between Two Controllers

**Problem:** Both controllers use `@Controller('billing')`:

- `billing.controller.ts` (line 18): `@Controller('billing')`
- `billing-analytics.controller.ts` (line 13): `@Controller("billing")`

When NestJS registers routes, the second controller's routes may be:

- Overwritten by the first
- Not registered at all
- Causing registration errors

**Result:** `/api/billing/metrics` returns 404 because the route never gets registered.

### Issue 2: Frontend Sending Requests Without Proper Token

The 401 errors show the JWT guard is rejecting requests, but the route IS marked `@Public()`. The guard code looks correct and should skip authentication for public routes.

**Possible causes:**

- Frontend is sending a malformed token
- Global guard configuration issue
- Module loading order

---

## 🔧 Immediate Fixes Required

### Fix #1: Rename Billing Analytics Controller Path

**File:** `backend/src/billing/analytics/billing-analytics.controller.ts`

**Line 13 - Change:**

```typescript
// BEFORE:
@Controller("billing")

// AFTER:
@Controller('billing/analytics')
```

This will make the routes:

- ❌ OLD: `/api/billing/metrics`
- ✅ NEW: `/api/billing/analytics/metrics`

**No other changes needed in the controller** - all route decorators stay the same:

```typescript
@Get("metrics")           // → /api/billing/analytics/metrics
@Get("wip-stats")         // → /api/billing/analytics/wip-stats
@Get("realization")       // → /api/billing/analytics/realization
@Get("operating-summary") // → /api/billing/analytics/operating-summary
@Get("ar-aging")          // → /api/billing/analytics/ar-aging
```

### Fix #2: Update Frontend API Calls

**Files to update:**

- `nextjs/src/lib/api-config.ts` (or wherever billing API calls are made)
- `nextjs/src/app/(main)/billing/page.tsx` (mentioned in error logs)

**Change all billing analytics endpoints:**

```typescript
// BEFORE:
const response = await fetch("/api/billing/metrics");

// AFTER:
const response = await fetch("/api/billing/analytics/metrics");
```

### Fix #3: Investigate @Public() Not Working

**File:** `backend/src/app.module.ts`

Check the `providers` array around line 100-150. Look for:

```typescript
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

If this exists, the guard is applied globally. The `canActivate` method in `jwt-auth.guard.ts` should still respect `@Public()`, but there might be an issue with:

1. **Reflector not being injected properly**
2. **IS_PUBLIC_KEY constant mismatch**
3. **Metadata not being set on the route**

**Quick Test:**
Add logging to `jwt-auth.guard.ts` at line 32:

```typescript
canActivate(context: ExecutionContext) {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  // ADD THIS:
  console.log('[JwtAuthGuard] Route:', context.getHandler().name, 'isPublic:', isPublic);

  if (isPublic) {
    return true;
  }

  return super.canActivate(context);
}
```

Restart backend and check logs when frontend calls `/api/cases`. You should see:

```
[JwtAuthGuard] Route: findAll isPublic: true
```

If you see `isPublic: false`, then the decorator isn't being applied correctly.

---

## 📋 Complete Route Mappings

### Before Fixes (Current State)

#### Billing Analytics Routes ❌

```
GET  /api/billing/metrics           → 404 Not Found
GET  /api/billing/wip-stats         → Conflict with billing.controller
GET  /api/billing/realization       → May not work
GET  /api/billing/operating-summary → May not work
GET  /api/billing/ar-aging          → May not work
```

#### Cases Routes ⚠️

```
GET  /api/cases                     → 401 Unauthorized (should be public)
GET  /api/cases/stats               → Works (public)
POST /api/cases                     → Works (public)
GET  /api/cases/:id                 → Works (auth required)
```

### After Fixes (Expected State)

#### Billing Analytics Routes ✅

```
GET  /api/billing/analytics/metrics           → 200 OK (public)
GET  /api/billing/analytics/wip-stats         → 200 OK (public)
GET  /api/billing/analytics/realization       → 200 OK (auth required)
GET  /api/billing/analytics/operating-summary → 200 OK (auth required)
GET  /api/billing/analytics/ar-aging          → 200 OK (auth required)
```

#### Cases Routes ✅

```
GET  /api/cases                     → 200 OK (public, no auth needed)
GET  /api/cases/stats               → 200 OK (public)
POST /api/cases                     → 201 Created (public)
GET  /api/cases/:id                 → 200 OK (auth required)
```

---

## 🧪 Testing After Fixes

### Test 1: Billing Metrics Endpoint

```bash
# Should return 200 OK with billing data
curl http://localhost:3001/api/billing/analytics/metrics

# Should NOT return 404
```

### Test 2: Cases Endpoint (Public)

```bash
# Should return 200 OK with cases list (no auth token)
curl http://localhost:3001/api/cases

# Should NOT return 401 Unauthorized
```

### Test 3: Frontend Integration

1. Clear Next.js cache: `cd nextjs && rm -rf .next .turbo`
2. Restart both backend and frontend
3. Navigate to `/case-overview` page
4. Should see cases list, NOT "Failed to load cases" error
5. Navigate to `/billing` page
6. Should see billing metrics, NOT 404 error

---

## 📝 Change Checklist

- [ ] Update `billing-analytics.controller.ts` line 13: `@Controller('billing/analytics')`
- [ ] Update frontend API calls to use `/api/billing/analytics/*` paths
- [ ] Add logging to `jwt-auth.guard.ts` to debug @Public() decorator
- [ ] Check `app.module.ts` for global guard configuration
- [ ] Test `/api/billing/analytics/metrics` returns 200 (not 404)
- [ ] Test `/api/cases` returns 200 without auth (not 401)
- [ ] Verify frontend Case Overview page loads cases
- [ ] Verify frontend Billing page loads metrics

---

## 🔍 If Issues Persist

### If still getting 404 on billing/analytics/metrics:

1. Check NestJS startup logs for route registration
2. Run: `curl http://localhost:3001/api` (should show API info)
3. Check if `BillingAnalyticsModule` is imported in `app.module.ts`
4. Verify TypeORM entities are properly imported

### If still getting 401 on /api/cases:

1. Check the logging output from jwt-auth.guard.ts
2. Verify `IS_PUBLIC_KEY` constant matches in both files:
   - `common/decorators/public.decorator.ts`
   - `common/guards/jwt-auth.guard.ts`
3. Check if Reflector is injected in guard constructor
4. Try removing global guard and applying per-controller instead

---

## 📚 All Controller Routes (Complete List)

See attached file: `BACKEND_ROUTES_AUDIT_SUMMARY.md` for complete route inventory of all 101 controllers.

---

**Priority Level:** 🔴 URGENT - Blocking frontend development

**Estimated Fix Time:** 15-30 minutes

**Testing Time:** 10-15 minutes

**Total Time to Resolution:** ~45 minutes
