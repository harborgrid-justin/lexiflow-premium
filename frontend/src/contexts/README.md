# Global Contexts Directory

## Enterprise React Context File Standard Applied

**All context files in this directory follow the ENTERPRISE REACT CONTEXT FILE STANDARD**

---

## Architecture Principle

**This directory contains GLOBAL APPLICATION-LEVEL contexts only.**

Domain-specific contexts have been migrated to `/routes/[domain]/` following the Enterprise React Architecture Standard.

---

## What is a Context File?

A CONTEXT FILE IS:

- A DOMAIN-LEVEL STATE MODULE that
  - OWNS CLIENT-SIDE DERIVATION
  - COORDINATES UI STATE
  - MEDIATES BETWEEN ROUTER DATA AND VIEWS

IT IS NOT:

- ✗ a global store
- ✗ a service
- ✗ a frontend API
- ✗ a component dumping ground
- ✗ a data-fetching layer

---

## Context Position in Architecture

```
SERVER
│
▼
FRONTEND API        (truth)
│
▼
LOADERS / ACTIONS   (orchestration)
│
▼
CONTEXT FILE        ←──────────── DOMAIN STATE LAYER
│
├── local derivation
├── optimistic state
├── selectors
├── domain actions
│
▼
VIEWS / UI
```

---

## Canonical Context Structure

All context files follow this structure:

```typescript
// FeatureContext.tsx
================================================================================

Types
│
State Shape
│
Reducer
│
Selectors
│
Actions
│
Context
│
Provider
│
Public Hook

================================================================================
```

---

## What Belongs Here

### ✅ Global Infrastructure Contexts

- **Theme** - App-wide theming and dark mode
- **Toast** - Global notification system (with UI rendering - acceptable for cross-cutting concern)

### ✅ Global Application Contexts

- **Auth** - Authentication state and identity
- **Entitlements** - Role-based access control (RBAC)
- **Flags** - Feature flags and configuration

---

## What DOES NOT Belong Here

### ❌ Domain-Specific Contexts

These have been migrated to their respective route domains:

| Old Location       | New Location                        | Purpose                    |
| ------------------ | ----------------------------------- | -------------------------- |
| `contexts/case/`   | `routes/cases/CaseProvider.tsx`     | Case management domain     |
| `contexts/data/`   | `routes/dashboard/DataProvider.tsx` | Dashboard data layer       |
| `contexts/window/` | `routes/_shared/WindowProvider.tsx` | Holographic window state   |
| `contexts/sync/`   | `routes/_shared/SyncProvider.tsx`   | Background sync operations |

---

## Non-Negotiable Rules

### CONTEXT FILES OWN STATE - EVERYONE ELSE CONSUMES IT

### Allowed in Contexts

- ✔ useReducer / useState
- ✔ memoized selectors
- ✔ optimistic overlays
- ✔ domain-level actions
- ✔ calls to Services
- ✔ initial data hydration

### Forbidden in Contexts

- ✗ fetch / HTTP
- ✗ React Router navigation
- ✗ JSX layout (except ToastContext - cross-cutting concern)
- ✗ browser APIs (direct)
- ✗ business truth
- ✗ cross-domain state

---

## Context Initialization

CONTEXT MUST BE INITIALIZED FROM:

- ✔ loader data
- ✗ async effects
- ✗ implicit globals

Example:

```tsx
<ReportProvider initialData={loaderData}>
```

---

## Context + Services

```
CONTEXT MAY CALL SERVICES
SERVICES MAY NEVER CALL CONTEXT

Context Action
│
└── Service
    └── Side Effect
```

---

## Context + Frontend API

```
CONTEXT MAY NOT CALL FRONTEND APIS DIRECTLY

Frontend API → Loader / Action → Context
```

Instead:

```
Context → Service → Frontend API
```

---

## Context Hierarchy

```
<RootProviders>                    ← Infrastructure wrapper
  <EnvProvider>                    ← Environment config (implicit)
    <ThemeProvider>                ← Visual theme (global)
      <ToastProvider>              ← Notifications (global)
        <AuthProvider>             ← Identity (global)
          <EntitlementsProvider>   ← Permissions (global)
            <FlagsProvider>        ← Feature flags (global)
              <Outlet>             ← React Router outlet
                {/* Domain contexts live in route components */}
              </Outlet>
            </FlagsProvider>
          </EntitlementsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </EnvProvider>
</RootProviders>
```

---

## Usage Rules

### 1. **Global Context Creation**

Only create new contexts here if they are:

- Required by ALL routes
- Infrastructure concerns (theme, i18n, auth)
- Application-wide state (user session, permissions)

### 2. **Domain Context Creation**

Create domain contexts in `/routes/[domain]/`:

```
routes/
├── cases/
│   ├── CaseProvider.tsx       ← Case domain state
│   ├── CasePage.tsx
│   └── loader.ts
│
└── reports/
    ├── ReportProvider.tsx     ← Report domain state
    ├── ReportPage.tsx
    └── loader.ts
```

### 3. **Context Dependencies**

A context may only depend on contexts ABOVE it in the hierarchy:

- ✅ `CaseProvider` can use `useAuth()` (global)
- ❌ `AuthContext` CANNOT use `useCaseContext()` (domain)

---

## Performance Rules

- Memoize context values
- Split contexts by churn (state vs actions)
- Never store transient UI noise
- Avoid deep object identities

---

## Review Checklist

Before committing a context file:

- [ ] Is this domain-scoped?
- [ ] Is state derived, not fetched?
- [ ] Are actions explicit?
- [ ] Is optimism reversible?
- [ ] Is context stable?
- [ ] Does it avoid router imports?
- [ ] Does it use service layer (not direct HTTP)?
- [ ] Does it follow canonical structure?

---

## Mental Model

```
FRONTEND API = TRUTH
SERVICE      = EFFECT
CONTEXT      = STATE
VIEW         = FUNCTION
UI           = DISPLAY
```

---

## Import Guidelines

### Global Context Import

```tsx
// Import from barrel export
import { useAuth, useTheme, useToast } from "@/contexts";
```

### Domain Context Import

```tsx
// Import from route-specific location
import { CaseProvider, useCaseContext } from "@/routes/cases";
import { DashboardProvider } from "@/routes/dashboard";
import { WindowProvider } from "@/routes/_shared";
```

---

## Migration Complete ✅

**Date:** January 14, 2026
**Standard:** Enterprise React Architecture v18 + React Router v7

**Key Achievements:**

- ✅ Separated global vs domain contexts
- ✅ Colocated domain state with routes
- ✅ Established clear context hierarchy
- ✅ Enforced unidirectional data flow
- ✅ Improved tree-shaking and code splitting

---

## Reference

See [`/docs/ENTERPRISE_ARCHITECTURE_STANDARD.md`] for complete architectural guidelines.

### Key Principles:

1. **Data flows down** - From loaders → context → views
2. **Events flow up** - From UI → actions → server
3. **Navigation flows sideways** - Via React Router
4. **Contexts are finite** - No unbounded nesting
5. **Routes define capabilities** - Each route is a capability boundary
