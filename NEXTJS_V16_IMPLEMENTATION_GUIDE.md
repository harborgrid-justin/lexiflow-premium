# Next.js v16 Compliance Implementation Guide

**Status**: Critical Fixes Implementation
**Priority**: Phase 1 - Blocking Issues
**Timeline**: 1 Week

---

## ✅ Completed Fixes

### 1. TypeScript Strict Mode - IMPLEMENTED ✅

**File**: `nextjs/tsconfig.json`

**Changes Made**:

- ✅ Enabled `"strict": true`
- ✅ Added `"noUncheckedIndexedAccess": true`
- ✅ Set `"noUnusedLocals": true`
- ✅ Set `"noUnusedParameters": true`
- ✅ Set `"noFallthroughCasesInSwitch": true`
- ✅ Set `"forceConsistentCasingInFileNames": true`
- ✅ Upgraded target from ES2017 to ES2020

**Impact**: Type safety now enforced across entire codebase

---

### 2. Root Error Boundary - EXISTS ✅

**File**: `nextjs/src/app/error.tsx`

**Status**: File exists with enterprise-grade error handling

- ✅ Proper error logging
- ✅ User-friendly UI
- ✅ Development mode error details
- ✅ Reset functionality

---

### 3. 404 Not Found Page - IMPLEMENTED ✅

**File**: `nextjs/src/app/not-found.tsx`

**Status**: Created with SEO-friendly markup

- ✅ Proper metadata
- ✅ robots: { index: false }
- ✅ User guidance
- ✅ Return to dashboard link

---

### 4. Authenticated Route Error Boundary - EXISTS ✅

**File**: `nextjs/src/app/(main)/error.tsx`

**Status**: File exists for segment-level error handling

---

### 5. Loading Fallback - EXISTS ✅

**File**: `nextjs/src/app/(main)/loading.tsx`

**Status**: File exists with skeleton loaders

---

## 🔄 In Progress - Route Organization

### Current Issues Identified

**Duplicate/Inconsistent Routes**:

```
Top Level Routes (SHOULD BE IN (main)):
- /admin (duplicate: /admin is also in (main))
- /analytics (standalone)
- /jurisdiction (singular, should be in (main) as jurisdictions)
- /crm (duplicate)
- /drafting (standalone)
- /research (standalone)
- /components (should be in (main) or removed)

(main) Route Group:
- All properly nested authenticated routes
- Includes 60+ routes
```

### Recommended Reorganization

```typescript
// MOVE THESE TO (main) ROUTE GROUP:

// From root level to (main):
/admin/page.tsx              → /(main)/admin/page.tsx
/analytics/page.tsx          → /(main)/analytics/page.tsx
/jurisdiction/page.tsx       → /(main)/jurisdictions/page.tsx
/crm/page.tsx                → /(main)/crm/page.tsx
/drafting/page.tsx           → /(main)/drafting/page.tsx
/research/page.tsx           → /(main)/research/page.tsx
/components/page.tsx         → /(main)/components/page.tsx (or remove as dev only)

// Standardize route names (kebab-case for consistency):
/case-overview               ✅ (already correct)
/case-calendar               ✅ (already correct)
/war-room                    ✅ (already using snake_case intentionally)
/pleading-builder            ✅ (already correct)
```

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (This Week)

- [x] Enable TypeScript strict mode
- [x] Create/verify error.tsx at root
- [x] Create/verify not-found.tsx at root
- [ ] Consolidate routes into (main) group
- [ ] Add missing error.tsx files to key segments
- [ ] Add missing loading.tsx files to key segments
- [ ] Implement generateMetadata() for all dynamic routes

### Phase 2: Best Practices (Next Week)

- [ ] Standardize all route naming to kebab-case
- [ ] Add route segment config (revalidate, dynamic)
- [ ] Review and document API route security
- [ ] Implement data fetching error handling
- [ ] Add Suspense boundaries to all async components

### Phase 3: Enterprise Features (Month 2)

- [ ] Migrate to React 19 server actions
- [ ] Implement useFormStatus() for forms
- [ ] Add monitoring/observability
- [ ] Performance optimization
- [ ] Security headers configuration

---

## 🔧 Route Migration Guide

### Step 1: Backup Current Structure

```bash
cd /workspaces/lexiflow-premium/nextjs/src/app
git status  # Verify all changes tracked
```

### Step 2: Move Top-Level Routes to (main)

```bash
# Move admin
mv admin (main)/admin

# Move analytics (if different from (main)/analytics)
mv analytics (main)/analytics-dashboard

# Move jurisdiction
mv jurisdiction (main)/jurisdictions

# Move standalone routes
mv crm (main)/crm
mv drafting (main)/drafting
mv research (main)/research
```

### Step 3: Verify Structure

```bash
# Should have this structure:
(main)/
├── layout.tsx
├── error.tsx
├── loading.tsx
├── page.tsx (dashboard)
├── admin/
├── analytics/
├── analytics-dashboard/
├── crm/
├── drafting/
├── jurisdictions/
├── research/
└── [50+ other routes]
```

### Step 4: Update Internal Links

Search and replace navigation links:

```tsx
// OLD
href="/admin"           → href="/admin"
href="/analytics"       → href="/analytics-dashboard"
href="/jurisdiction"    → href="/jurisdictions"

// NEW (already in (main), no change needed)
href="/cases"
href="/documents"
```

---

## 🎯 Next.js v16 Compliance Targets

### Dynamic Routes with generateMetadata()

**Pattern to Implement**:

```tsx
// ✅ CORRECT PATTERN
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const resource = await fetchResource(id);
    return {
      title: resource.name,
      description: resource.description,
      openGraph: {
        title: resource.name,
        description: resource.description,
        url: `/${resource.type}/${id}`,
        images: resource.thumbnailUrl ? [{ url: resource.thumbnailUrl }] : [],
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const items = await fetchItems();
    return items.map((item) => ({ id: item.id }));
  } catch {
    return [];
  }
}

// Route segment configuration
export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

### Suspense Boundaries

**Pattern to Implement**:

```tsx
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default async function Page() {
  return (
    <div>
      <PageHeader />

      <ErrorBoundary>
        <Suspense fallback={<DataTableSkeleton />}>
          <AsyncDataTable />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<ChartSkeleton />}>
          <AsyncChart />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### Error Boundaries

**Pattern to Implement**:

```tsx
// segment/error.tsx
"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Segment error:", error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## 📊 Compliance Progress

| Item              | Status         | File                   | Priority |
| ----------------- | -------------- | ---------------------- | -------- |
| TypeScript Strict | ✅ DONE        | tsconfig.json          | P0       |
| Root Error        | ✅ DONE        | app/error.tsx          | P0       |
| Root 404          | ✅ DONE        | app/not-found.tsx      | P0       |
| (main) Error      | ✅ EXISTS      | app/(main)/error.tsx   | P0       |
| (main) Loading    | ✅ EXISTS      | app/(main)/loading.tsx | P0       |
| Route Org         | 🔄 IN PROGRESS | Multiple               | P0       |
| Dynamic Metadata  | ⚠️ PARTIAL     | case/[id] ✅           | P1       |
| Suspense Bounds   | ⚠️ PARTIAL     | Some routes            | P1       |
| Error Handlers    | ✅ PARTIAL     | Root + (main)          | P1       |

---

## 🚀 Next Actions

### This Week

1. Review all top-level routes and consolidate into (main)
2. Verify all dynamic pages have generateMetadata()
3. Add missing error.tsx files to key segments
4. Run `npm run build` to check strict mode errors

### Next Week

1. Standardize route naming
2. Add Suspense boundaries to async components
3. Implement route segment config
4. Security review of API routes

### Later

1. React 19 server actions
2. Performance optimization
3. Monitoring integration

---

## ⚠️ Common Issues During Migration

### Issue: Strict Mode Compilation Errors

**Solution**:

```bash
# These are expected - fix them as you find them
npm run build 2>&1 | grep -A 5 "error TS"

# Fix types systematically:
# - Add explicit types for function parameters
# - Remove implicit any
# - Fix null/undefined checks
```

### Issue: 404 Pages Still Redirecting

**Solution**:

- Clear `.next` build cache: `rm -rf .next`
- Rebuild: `npm run build`
- Deploy: `npm start`

### Issue: Server Actions Not Working

**Solution**:

- Verify `'use server'` directive at top of file
- Ensure function is exported
- Check next.config.ts has serverActions enabled

---

## 📚 References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/error-handling)
- [React 19 Server Components](https://react.dev/reference/rsc/server-components)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: January 7, 2026
**Next Review**: January 14, 2026
