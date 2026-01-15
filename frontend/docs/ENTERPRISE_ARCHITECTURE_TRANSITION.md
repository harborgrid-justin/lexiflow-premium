# Enterprise React Architecture Transition Plan

## LexiFlow Premium Frontend Migration

**Date:** January 14, 2026
**Target:** Enterprise React Architecture Standard (React v18 + React Router v7)
**Status:** Phase 0 - Planning Complete

---

## Executive Summary

Transition from **hybrid architecture** (custom React Query + mixed loaders + client-heavy SSR) to **Enterprise React Architecture Standard** with:

- React Router v7 loaders as single data source
- Explicit Suspense + Await boundaries for streaming SSR
- Server-first data fetching with HTTP-only cookies
- Canonical folder structure (routes/, providers/, contexts/, components/, lib/)
- Context layering governance (Infrastructure → Application → Domain → UI)
- Pure presentation Views separated from data-orchestrating Pages

---

## Current State Analysis

### ✅ Strengths

- React Router v7.11.0 (framework mode) already in place
- Backend-first architecture (PostgreSQL + NestJS) operational
- 90+ domain API services consolidated
- Type-safe route params via `useParams<typeof loader>`
- Declarative routing in `routes.ts`
- Error boundaries per route

### 🔴 Critical Gaps

1. **Inconsistent data fetching**: Custom React Query (530 lines) + loaders + useEffect
2. **Authentication blocks SSR**: localStorage tokens prevent 30+ routes from server-side loading
3. **No streaming SSR**: React 18 Suspense underutilized, no `defer()` pattern
4. **Component duplication**: `components/` vs `features/` overlap
5. **Context sprawl**: 11 providers with complex dependencies

---

## Architecture Transformation

### Data Flow: BEFORE → AFTER

#### BEFORE (Current Hybrid)

```
Component → useEffect → DataService → API
Component → useQuery (custom) → queryClient → DataService → API
Route → clientLoader → DataService → API
```

#### AFTER (Enterprise Standard)

```
ROUTER LOADER (server/client)
   ↓
defer({ data: fetchData() })
   ↓
<Suspense fallback={<Skeleton />}>
   ↓
<Await resolve={data}>
   ↓
<FeaturePage> (orchestration)
   ↓
<FeatureProvider> (domain context)
   ↓
<FeatureView> (pure render)
```

### Context Hierarchy: BEFORE → AFTER

#### BEFORE (Current)

```tsx
<QueryClientProvider>      // Custom implementation
  <AuthProvider>            // Global
    <ThemeProvider>         // Global
      <ToastProvider>       // Global
        <DataSourceProvider> // Global
          <CaseProvider>    // Global (!!)
            <SyncProvider>  // Global (!!)
              <WindowProvider>
                {children}
```

#### AFTER (Enterprise Standard)

```tsx
// GLOBAL (providers/)
<EnvProvider>
  <ThemeProvider>
    <AuthContext>           // App-level auth only
      <PermissionsContext>  // App-level permissions
        <Outlet />          // Router
```

```tsx
// PER-ROUTE (routes/cases/case-detail.tsx)
<Suspense fallback={<CaseSkeleton />}>
  <Await resolve={caseData}>
    {(data) => (
      <CaseProvider initialData={data}>
        {" "}
        // Domain context scoped to route
        <CaseView /> // Pure presentation
      </CaseProvider>
    )}
  </Await>
</Suspense>
```

---

## Migration Phases

### Phase 0: Foundation ✅ (Complete)

- [x] Audit current architecture
- [x] Document transition plan
- [x] Identify all data fetching patterns
- [x] Map provider hierarchy

### Phase 1: Data Flow Consolidation (Week 1)

**Goal:** Single source of truth = React Router loaders

#### 1.1 Remove Custom React Query

**Files to modify:**

- `services/infrastructure/queryClient.ts` → Mark deprecated, create migration guide
- `hooks/useQueryHooks.ts` → Replace with `useLoaderData()` wrappers

**Migration pattern:**

```typescript
// BEFORE
const { data, isLoading } = useQuery(["cases"], () =>
  DataService.cases.getAll()
);

// AFTER
// In routes/cases/index.tsx
export async function loader() {
  return defer({
    cases: DataService.cases.getAll(),
  });
}

// In component
const { cases } = useLoaderData<typeof loader>();
```

**Routes to migrate (40+ components):**

- `features/operations/billing/BillingDashboard.tsx`
- `features/operations/crm/ClientCRM.tsx`
- `features/operations/compliance/ComplianceDashboard.tsx`
- `features/admin/users/UserManagement.tsx`
- `features/admin/settings/SystemSettings.tsx`
- [See full list in `MIGRATION_CHECKLIST.md`]

#### 1.2 Standardize Loader Pattern

**Current inconsistency:** Mix of `loader` vs `clientLoader`

**Decision:** Use `loader` (server-side) by default, `clientLoader` only for:

- Client-only features (IndexedDB debugging mode)
- Browser API dependencies (localStorage, window)

**Refactor 30+ routes:**

```typescript
// BEFORE
export async function clientLoader() {
  const token = localStorage.getItem("token"); // ❌ Blocks SSR
  const cases = await DataService.cases.getAll();
  return { cases };
}
clientLoader.hydrate = true;

// AFTER (Phase 1 workaround, Phase 2 fixes auth)
export async function loader({ request }: LoaderFunctionArgs) {
  // Move auth to cookie-based (Phase 2)
  const cases = await DataService.cases.getAll();
  return defer({ cases });
}
```

#### 1.3 Remove useEffect Fetching

**Pattern to eliminate:**

```typescript
// ❌ ANTI-PATTERN
useEffect(() => {
  DataService.cases.getAll().then(setCases);
}, []);

// ✅ CORRECT
// Data comes from loader via useLoaderData()
```

**Estimated Impact:** 60+ components

---

### Phase 2: Authentication Refactor (Week 2)

**Goal:** Enable true SSR with HTTP-only cookies

#### 2.1 Backend Session Management

**Backend changes required:**

- Implement session middleware in NestJS
- Add HTTP-only cookie support
- Create `/api/auth/session` endpoint
- Add CSRF protection

**Files to create/modify:**

```
backend/src/auth/
├── session.middleware.ts
├── session.guard.ts
└── session.service.ts
```

#### 2.2 Frontend Auth Context Refactor

**Files to modify:**

- `contexts/auth/AuthContext.tsx`
- `api/index.ts` (add credentials: 'include')
- `routes/layout.tsx` (update loader)

**New pattern:**

```typescript
// routes/layout.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  // Session comes from HTTP-only cookie (automatic)
  const session = await api.auth.getSession();

  if (!session.user && !isPublicRoute(request.url)) {
    throw redirect("/login");
  }

  return defer({
    user: session.user,
    permissions: session.permissions,
  });
}
```

#### 2.3 Convert clientLoader → loader

**Unlock SSR for 30+ routes:**

- `routes/cases/index.tsx`
- `routes/cases/case-detail.tsx`
- `routes/billing/index.tsx`
- `routes/docket/detail.tsx`
- [Full list TBD]

**Expected benefit:**

- Server-side data prefetching
- Faster Time to Interactive (TTI)
- SEO-friendly pages
- Reduced client-side loading states

---

### Phase 3: Suspense + Streaming SSR (Week 3)

**Goal:** Leverage React 18 concurrent features

#### 3.1 Add Suspense Boundaries

**Layout-level fallback:**

```typescript
// routes/layout.tsx
export default function Layout() {
  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}
```

**Route-level fallbacks:**

```typescript
// routes/cases/case-detail.tsx
export default function CaseDetailPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<CaseSkeleton />}>
      <Await resolve={data.case} errorElement={<ErrorDisplay />}>
        {(caseData) => (
          <CaseProvider initialData={caseData}>
            <CaseView />
          </CaseProvider>
        )}
      </Await>
    </Suspense>
  );
}
```

#### 3.2 Implement defer() Pattern

**Parallel data loading:**

```typescript
export async function loader({ params }: LoaderFunctionArgs) {
  // These fetch in parallel, render progressively
  return defer({
    case: DataService.cases.getById(params.caseId), // Critical
    docketEntries: DataService.docket.getByCaseId(params.caseId), // Deferred
    documents: DataService.documents.getByCaseId(params.caseId), // Deferred
    timeline: DataService.cases.getTimeline(params.caseId), // Deferred
  });
}
```

**Waterfall elimination:**

- Current: Sequential fetches in components
- Target: Parallel fetches in loader
- Expected: 60-80% reduction in loading time for detail pages

#### 3.3 Progressive Rendering

**Critical path first:**

```tsx
<Suspense fallback={<HeaderSkeleton />}>
  <Await resolve={data.case}>
    {(caseData) => <CaseHeader case={caseData} />}
  </Await>
</Suspense>

<Suspense fallback={<DocketSkeleton />}>
  <Await resolve={data.docketEntries}>
    {(entries) => <DocketList entries={entries} />}
  </Await>
</Suspense>
```

---

### Phase 4: Folder Restructure (Week 4)

**Goal:** Canonical Enterprise structure

#### 4.1 New Structure

```
frontend/src/
├── main.tsx
├── router.tsx
├── entry.client.tsx
├── entry.server.tsx
│
├── providers/              # GLOBAL ONLY (Infrastructure)
│   ├── RootProviders.tsx
│   ├── EnvProvider.tsx
│   ├── ThemeProvider.tsx
│   └── AuthBootstrapProvider.tsx
│
├── layouts/               # Shell layouts
│   ├── AppShellLayout.tsx
│   └── PageFrame.tsx
│
├── routes/                # Feature routes (Page + View + Provider + loader)
│   ├── cases/
│   │   ├── index.tsx              # List route
│   │   ├── case-detail.tsx        # Detail route
│   │   ├── CaseListPage.tsx       # Data orchestration
│   │   ├── CaseListView.tsx       # Pure presentation
│   │   ├── CaseDetailPage.tsx
│   │   ├── CaseDetailView.tsx
│   │   ├── CaseProvider.tsx       # Domain context (route-scoped)
│   │   ├── loader.ts              # Shared loaders
│   │   └── action.ts              # Shared actions
│   │
│   ├── billing/
│   │   ├── index.tsx
│   │   ├── BillingPage.tsx
│   │   ├── BillingView.tsx
│   │   ├── BillingProvider.tsx
│   │   └── loader.ts
│   │
│   ├── discovery/
│   │   ├── index.tsx
│   │   ├── evidence.tsx
│   │   ├── DiscoveryPage.tsx
│   │   ├── DiscoveryView.tsx
│   │   ├── DiscoveryProvider.tsx
│   │   └── loader.ts
│   │
│   └── [other features]
│
├── contexts/              # APP-LEVEL ONLY (cross-cutting)
│   ├── AuthContext.tsx    # Authentication state
│   ├── PermissionsContext.tsx
│   └── ThemeContext.tsx   # If not in providers/
│
├── components/            # PURE UI (atoms, molecules, organisms)
│   ├── atoms/            # Button, Input, Badge
│   ├── molecules/        # SearchBar, Card, Table
│   ├── organisms/        # Sidebar, Modal, DataTable
│   └── layouts/          # Grid, Stack (generic layouts)
│
├── lib/                   # Utilities, non-UI
│   ├── api/              # API client
│   ├── validation/       # Schema validation
│   ├── utils/            # Pure functions
│   └── types/            # Shared types
│
└── services/              # Infrastructure (keep for now)
    ├── dataService.ts
    ├── api/
    └── infrastructure/
```

#### 4.2 Migration Strategy

1. **Create new structure** (parallel to old)
2. **Migrate one feature at a time** (cases → billing → discovery)
3. **Update imports** incrementally
4. **Remove old structure** once fully migrated

#### 4.3 Feature Module Template

```typescript
// routes/[feature]/index.tsx (Route definition)
export { loader, action } from './loader';
export { default } from './FeaturePage';

// routes/[feature]/loader.ts (Data layer)
export async function loader({ params, request }: LoaderFunctionArgs) {
  return defer({
    data: fetchData(params),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Handle mutations
  return redirect('/success');
}

// routes/[feature]/FeaturePage.tsx (Orchestration)
export default function FeaturePage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<FeatureSkeleton />}>
      <Await resolve={data.items}>
        {(items) => (
          <FeatureProvider initialData={items}>
            <FeatureView />
          </FeatureProvider>
        )}
      </Await>
    </Suspense>
  );
}

// routes/[feature]/FeatureView.tsx (Pure presentation)
export function FeatureView() {
  const { items, filteredItems, handleAction } = useFeature();

  return (
    <div>
      {filteredItems.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}

// routes/[feature]/FeatureProvider.tsx (Domain context - scoped)
export function FeatureProvider({ initialData, children }) {
  const [items, setItems] = useState(initialData);
  const [filters, setFilters] = useState({});

  const filteredItems = useMemo(() =>
    items.filter(applyFilters(filters)),
    [items, filters]
  );

  const value = useMemo(() => ({
    items,
    filteredItems,
    setFilters,
    handleAction: (id) => { /* ... */ }
  }), [items, filteredItems]);

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}
```

---

### Phase 5: Context Layering Governance (Week 5)

**Goal:** Enforce hierarchy and scope

#### 5.1 Provider Hierarchy Rules

```
LAYER 1: Infrastructure (providers/)
├── EnvProvider            # Environment config
└── ThemeProvider          # Visual theme

LAYER 2: Application (contexts/)
├── AuthContext            # User session
└── PermissionsContext     # Access control

LAYER 3: Domain (routes/[feature]/)
├── CaseProvider           # Case-specific (scoped to route)
├── BillingProvider        # Billing-specific (scoped to route)
└── DiscoveryProvider      # Discovery-specific (scoped to route)

LAYER 4: UI (component-local)
├── useState               # Local component state
└── useReducer             # Complex component state
```

**Enforcement:**

- A context MAY ONLY depend on contexts above it
- Domain contexts MUST be scoped to routes, not global
- Global providers MUST NOT have domain knowledge

#### 5.2 Context Refactoring

**Move these from global → route-scoped:**

- `CaseProvider` → `routes/cases/CaseProvider.tsx`
- `DiscoveryContext` → `routes/discovery/DiscoveryProvider.tsx`
- `DashboardContext` → `routes/dashboard/DashboardProvider.tsx`
- `LitigationContext` → `routes/litigation/LitigationProvider.tsx`

**Keep global (infrastructure/app-level):**

- `AuthContext` (user session)
- `ThemeContext` (visual theme)
- `PermissionsContext` (access control)
- `ToastContext` (notifications)

#### 5.3 Remove Legacy Contexts

- `QueryClientProvider` → Replaced by loader data
- `DataSourceProvider` → Deprecated (backend-first is default)
- `RepositoryContext` → Deprecated (legacy IndexedDB)
- `SyncProvider` → Refactor into route-specific logic
- `WindowProvider` → Evaluate if needed (holographic routing)

---

### Phase 6: Page/View Separation (Week 6)

**Goal:** Pure presentation views

#### 6.1 Responsibility Split

```typescript
// *Page.tsx - DATA ORCHESTRATION
// - useLoaderData()
// - Suspense boundaries
// - Await blocks
// - Provider initialization
// - Error boundaries
// - Navigation logic

// *View.tsx - PURE PRESENTATION
// - useContext() only
// - Props from parent
// - Event handlers (pass events up)
// - NO side effects
// - NO data fetching
// - NO navigation
```

#### 6.2 Migration Pattern

**BEFORE (monolithic component):**

```typescript
// features/cases/CaseDetail.tsx (500+ lines)
export function CaseDetail() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    DataService.cases.getById(caseId).then(setCaseData);
  }, [caseId]);

  const handleUpdate = async (updates) => {
    await DataService.cases.update(caseId, updates);
    navigate('/cases');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* 400 lines of UI */}
    </div>
  );
}
```

**AFTER (Page + View + Provider):**

```typescript
// routes/cases/case-detail.tsx (Route definition)
export async function loader({ params }: LoaderFunctionArgs) {
  return defer({
    case: DataService.cases.getById(params.caseId),
    docket: DataService.docket.getByCaseId(params.caseId),
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await DataService.cases.update(params.caseId, updates);
  return redirect('/cases');
}

export default function CaseDetailPage() {
  return <CaseDetailPageContent />;
}

// routes/cases/CaseDetailPage.tsx (Orchestration - 50 lines)
export function CaseDetailPageContent() {
  const data = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<CaseSkeleton />}>
      <Await resolve={Promise.all([data.case, data.docket])}>
        {([caseData, docketData]) => (
          <CaseProvider initialData={{ case: caseData, docket: docketData }}>
            <CaseDetailView />
          </CaseProvider>
        )}
      </Await>
    </Suspense>
  );
}

// routes/cases/CaseDetailView.tsx (Pure presentation - 300 lines)
export function CaseDetailView() {
  const { caseData, docketEntries, handleUpdate } = useCase();
  const submit = useSubmit();

  const onUpdate = (updates: Partial<Case>) => {
    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => {
      formData.append(key, value);
    });
    submit(formData, { method: 'post' });
  };

  return (
    <div>
      <CaseHeader case={caseData} />
      <CaseDetails case={caseData} onUpdate={onUpdate} />
      <DocketList entries={docketEntries} />
    </div>
  );
}

// routes/cases/CaseProvider.tsx (Domain context - 100 lines)
export function CaseProvider({ initialData, children }) {
  const [caseData, setCaseData] = useState(initialData.case);
  const [filters, setFilters] = useState<CaseFilters>({});
  const revalidator = useRevalidator();

  const filteredDocket = useMemo(() =>
    initialData.docket.filter(entry => matchesFilters(entry, filters)),
    [initialData.docket, filters]
  );

  const handleUpdate = useCallback((updates: Partial<Case>) => {
    setCaseData(prev => ({ ...prev, ...updates }));
    revalidator.revalidate(); // Trigger server revalidation
  }, [revalidator]);

  const value = useMemo(() => ({
    caseData,
    docketEntries: filteredDocket,
    filters,
    setFilters,
    handleUpdate,
  }), [caseData, filteredDocket, filters, handleUpdate]);

  return (
    <CaseContext.Provider value={value}>
      {children}
    </CaseContext.Provider>
  );
}
```

#### 6.3 Components to Refactor (Priority Order)

1. **Cases** (25+ components)
   - `CaseDetail.tsx` → `CaseDetailPage.tsx` + `CaseDetailView.tsx`
   - `CaseList.tsx` → `CaseListPage.tsx` + `CaseListView.tsx`
   - `CaseTimeline.tsx` → Pure component (already clean?)

2. **Billing** (20+ components)
   - `BillingDashboard.tsx` → Split
   - `InvoiceDetail.tsx` → Split
   - `LedgerView.tsx` → Split

3. **Discovery** (30+ components)
   - `DiscoveryManager.tsx` → Split
   - `EvidenceDetail.tsx` → Split
   - `DepositionView.tsx` → Split

4. **Documents** (15+ components)
   - `DocumentViewer.tsx` → Split
   - `DocumentList.tsx` → Split

5. **Admin** (20+ components)
   - `UserManagement.tsx` → Split
   - `SystemSettings.tsx` → Split

**Total:** 110+ components to refactor

---

## Transitions & Optimistic Updates

### Transition Pattern

```typescript
import { startTransition } from 'react';
import { useNavigate, useNavigation } from 'react-router';

export function CaseCard({ caseId }) {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const handleClick = () => {
    startTransition(() => {
      navigate(`/cases/${caseId}`);
    });
  };

  const isPending = navigation.state === 'loading';

  return (
    <Card onClick={handleClick} className={isPending ? 'opacity-50' : ''}>
      {/* Content */}
    </Card>
  );
}
```

### Optimistic Update Pattern

```typescript
// routes/cases/CaseProvider.tsx
export function CaseProvider({ initialData, children }) {
  const fetcher = useFetcher();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Partial<Case> | null>(null);

  // Merge optimistic with server state
  const displayData = useMemo(() => ({
    ...initialData,
    ...optimisticUpdates,
  }), [initialData, optimisticUpdates]);

  // Apply optimistic update on submit
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      const formData = fetcher.formData;
      setOptimisticUpdates(Object.fromEntries(formData));
    }

    // Rollback on error or confirm on success
    if (fetcher.state === 'idle') {
      if (fetcher.data?.error) {
        setOptimisticUpdates(null); // Rollback
        toast.error('Update failed');
      } else {
        setOptimisticUpdates(null); // Server state is new truth
      }
    }
  }, [fetcher.state]);

  const value = useMemo(() => ({
    caseData: displayData,
    // ...
  }), [displayData]);

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}
```

---

## Migration Checklist

### Week 1: Data Flow Consolidation

- [ ] Create `MIGRATION_CHECKLIST.md` with all 40+ components using custom React Query
- [ ] Deprecate `services/infrastructure/queryClient.ts` with migration guide
- [ ] Create wrapper hooks for `useLoaderData()` if needed
- [ ] Migrate top 10 high-traffic routes to loaders
- [ ] Remove useEffect fetching from migrated components
- [ ] Update `routes.ts` to export loaders

### Week 2: Authentication Refactor

- [ ] Backend: Implement session middleware
- [ ] Backend: Add HTTP-only cookie support
- [ ] Backend: Create `/api/auth/session` endpoint
- [ ] Frontend: Refactor `AuthContext.tsx` for cookie-based auth
- [ ] Frontend: Update `api/index.ts` with `credentials: 'include'`
- [ ] Frontend: Convert 30+ routes from `clientLoader` to `loader`
- [ ] Test SSR with authenticated routes
- [ ] Remove localStorage token references

### Week 3: Suspense + Streaming SSR

- [ ] Add layout-level Suspense in `routes/layout.tsx`
- [ ] Implement `defer()` pattern in all loaders
- [ ] Add route-specific Suspense boundaries
- [ ] Create skeleton components for major features
- [ ] Measure Time to Interactive (TTI) improvement
- [ ] Add error boundaries for `<Await>` blocks

### Week 4: Folder Restructure

- [ ] Create new folder structure (parallel)
- [ ] Migrate `routes/cases/` to new structure
- [ ] Migrate `routes/billing/` to new structure
- [ ] Migrate `routes/discovery/` to new structure
- [ ] Migrate `routes/documents/` to new structure
- [ ] Migrate remaining features
- [ ] Update all imports
- [ ] Remove old `components/` and `features/` folders

### Week 5: Context Layering Governance

- [ ] Create new `providers/` folder with infrastructure contexts
- [ ] Move `AuthContext` to `contexts/` (app-level)
- [ ] Move `CaseProvider` to `routes/cases/` (domain, route-scoped)
- [ ] Move `DiscoveryContext` to `routes/discovery/`
- [ ] Move `BillingContext` to `routes/billing/`
- [ ] Remove `QueryClientProvider`
- [ ] Remove `DataSourceProvider`
- [ ] Remove `RepositoryContext`
- [ ] Refactor `SyncProvider` logic
- [ ] Document context dependency rules

### Week 6: Page/View Separation

- [ ] Create template for Page/View/Provider pattern
- [ ] Split top 10 largest components (cases, billing, discovery)
- [ ] Extract business logic to Providers
- [ ] Convert Views to pure presentation
- [ ] Migrate actions to React Router actions
- [ ] Implement optimistic update pattern
- [ ] Add transitions for navigation
- [ ] Test all refactored features

---

## Success Metrics

### Performance

- **TTI (Time to Interactive):** Target 30-50% reduction
- **LCP (Largest Contentful Paint):** Target sub-2.5s
- **Bundle size:** Target 20-30% reduction (remove custom React Query)
- **Data waterfalls eliminated:** 60-80% reduction in sequential fetches

### Code Quality

- **Data fetching patterns:** 1 (loaders only)
- **Component duplication:** 0 (single folder structure)
- **Context providers (global):** ≤5 (infrastructure + app-level only)
- **Average component LOC:** Target <200 (Page/View separation)

### Developer Experience

- **Onboarding time:** Faster with clear structure
- **PR review time:** Faster with predictable patterns
- **Type safety:** 100% (generated route types)
- **Hot module reload (HMR):** Stable with scoped contexts

---

## Risk Mitigation

### Risk 1: Backend Not Ready for Session Cookies

**Mitigation:** Phase 2 can be delayed. Phase 1 (loaders) still provides value with `clientLoader`.

### Risk 2: Large Components Hard to Split

**Mitigation:** Start with small/medium components to establish pattern. Get team review. Tackle large components last.

### Risk 3: Breaking Changes During Migration

**Mitigation:** Feature flags to toggle old vs new implementation. Gradual rollout per route.

### Risk 4: Holographic Routing System Conflicts

**Mitigation:** Preserve `WindowProvider` if needed. Evaluate if minimizable windows can coexist with standard routing.

### Risk 5: Team Velocity Impact

**Mitigation:** Pair programming during migration. Document every pattern. Weekly knowledge-sharing sessions.

---

## Open Questions

1. **Holographic routing:** Keep or migrate to standard React Router navigation?
2. **IndexedDB fallback:** Remove completely or keep for offline mode?
3. **Custom hooks (100+):** Which migrate to providers, which keep as pure utilities?
4. **Web workers:** Integration with new data flow (search, crypto, graph)?
5. **Testing strategy:** Update test suite during or after migration?

---

## References

- **Enterprise Standard:** `ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md` (provided)
- **Current Architecture:** `README.md`, `.github/copilot-instructions.md`
- **React Router v7 Docs:** https://reactrouter.com/
- **React 18 Docs:** https://react.dev/
- **Project Context:** Backend-first architecture (PostgreSQL + NestJS), 90+ API services

---

## Next Steps

1. **Review this document** with team
2. **Get approval** on phasing and timeline
3. **Start Phase 1** (Week 1: Data Flow Consolidation)
4. **Daily standups** to track progress and blockers
5. **Weekly retros** to adjust plan as needed

---

**Status:** Ready for implementation
**Owner:** Development Team
**Reviewer:** Technical Lead
**ETA:** 6 weeks (aggressive), 8-10 weeks (realistic with testing)
