# ENTERPRISE REACT ARCHITECTURE STANDARD

React v18 + React Router v7 + Context + Suspense
(UPDATED — Frontend APIs, Services, Context Files)

## I. DATA FLOW — EXPLICIT, ONE-DIRECTIONAL ✅ (UNCHANGED)

```
SERVER
│
│  HTTP Request
▼
ROUTER LOADER (server-aware, deterministic)
│
│  loader() returns data / deferred()
▼
ROUTE COMPONENT
│
│  passes data into
▼
FEATURE CONTEXT PROVIDER
│
│  exposes selectors + domain API
▼
FEATURE VIEW (PURE RENDER)
│
│  props + context only
▼
UI COMPONENTS
```

**Canonical Rule**

```
DATA FLOWS DOWN
EVENTS FLOW UP
NAVIGATION FLOWS SIDEWAYS (via router)
```

## II. SUSPENSE + AWAIT — OFFICIAL PLACEMENT RULES ✅ (UNCHANGED)

```
SUSPENSE IS A RENDERING CONCERN
LOADERS ARE A DATA CONCERN
```

```
<Route>
└── element
    └── <Suspense>
        └── <Await>
            └── <FeaturePage>
                └── <FeatureProvider>
                    └── <FeatureView>
```

## III. SERVER VS CLIENT — HARD RESPONSIBILITY SPLIT ✅ (UNCHANGED)

```
NO BUSINESS DECISIONS IN CLIENT COMPONENTS
ALL DOMAIN TRUTH COMES FROM LOADERS/ACTIONS
```

## IV. CONTEXT LAYERING — GOVERNED AND FINITE ✅ (UNCHANGED)

```
OUTER → INFRASTRUCTURE
MID   → APPLICATION
INNER → DOMAIN
LEAF  → UI
```

```
A CONTEXT MAY ONLY DEPEND ON CONTEXTS ABOVE IT
```

## V. ROUTING + DATA — AUTHORITATIVE GRAPH ✅ (UNCHANGED)

Routes remain the authoritative state graph for:

- Navigation
- Data contracts
- Error boundaries
- Capability boundaries

## VI. ENTERPRISE FOLDER STRUCTURE (CANONICAL) ✅ (UNCHANGED)

Your existing structure remains valid and is extended below, not replaced.

## VII. ENTERPRISE INVARIANTS (NON-NEGOTIABLE) ✅ (UNCHANGED)

1. Loaders own data truth
2. Context owns domain derivation
3. Views are pure
4. UI is stateless
5. Routing is declarative
6. Suspense is explicit
7. No implicit globals
8. No side effects in render
9. No mutable shared state
10. URLs are reproducible state

## 🔽 EXTENSIONS (NEW, FORMALIZED)

## X. FRONTEND API LAYER — DOMAIN FIREWALL (NEW)

**FRONTEND API = CLIENT-SIDE DOMAIN CONTRACT**

**Position in the Flow**

```
SERVER
│
▼
BACKEND API
│
▼
FRONTEND API        ←── NORMALIZATION + ERROR SEMANTICS
│
▼
LOADERS / ACTIONS
│
▼
CONTEXT
│
▼
VIEW
```

**Hard Rules**

- UI NEVER calls fetch()
- Loaders/actions NEVER bypass Frontend APIs
- Frontend APIs NEVER mutate state
- Frontend APIs NEVER apply optimism

## XI. REACT SERVICES — CAPABILITY LAYER (NEW)

**SERVICE = IMPERATIVE CAPABILITY**

**Position**

```
CONTEXT / ACTION
│
▼
REACT SERVICE
│
▼
BROWSER / SDK / SIDE EFFECT
```

**Rules**

- Services may touch browser APIs
- Services may integrate SDKs
- Services may NOT fetch domain data
- Services may NOT own state
- Services may NOT import context or UI

## XII. CONTEXT FILES — DOMAIN STATE AUTHORITY (NEW)

**CONTEXT = CLIENT-SIDE DOMAIN STATE**

**Responsibilities**

- ✔ Derive UI-ready state
- ✔ Own optimistic overlays
- ✔ Expose selectors + domain actions
- ✔ Coordinate services

**Forbidden**

- ✗ fetch()
- ✗ navigation
- ✗ JSX layout
- ✗ business truth

## XIII. FULL DATA FLOW (UPDATED — END TO END)

```
SERVER
│
▼
Backend API
│
▼
Frontend API
│
▼
Loader / Action
│
▼
Context File
│
├── serverState
├── optimisticState
└── derivedState
│
▼
View
│
▼
UI Components
```

## XIV. UPDATED ENTERPRISE FOLDER STRUCTURE (EXTENDED)

```
src/
├── main.tsx
├── router.tsx
│
├── providers/                 # INFRASTRUCTURE
├── layouts/
├── routes/
│
├── contexts/                  # APP-LEVEL
│
├── features/
│   └── reports/
│       ├── loader.ts
│       ├── action.ts
│       ├── ReportContext.tsx
│       ├── ReportPage.tsx
│       └── ReportView.tsx
│
├── services/                  # CAPABILITIES
│   ├── telemetry/
│   ├── storage/
│   └── session/
│
├── lib/
│   ├── frontend-api/          # DOMAIN FIREWALL
│   ├── validation/
│   └── types/
│
└── components/                # PURE UI
```

## XV. UPDATED REVIEW CHECKLIST (SUPERSET)

- [ ] Does data originate in a loader/action?
- [ ] Is fetch isolated to frontend APIs?
- [ ] Is context domain-scoped?
- [ ] Are services imperative and stateless?
- [ ] Is optimism reversible?
- [ ] Are Suspense boundaries explicit?
- [ ] Is routing declarative?
- [ ] Is server/client responsibility respected?

## XVI. FINAL MENTAL MODEL (CANONICAL)

```
BACKEND API   = TRANSPORT
FRONTEND API = DOMAIN FIREWALL
SERVICE      = CAPABILITY
CONTEXT      = STATE
ROUTER       = STATE MACHINE
VIEW         = PURE FUNCTION
UI           = PRESENTATION
```
