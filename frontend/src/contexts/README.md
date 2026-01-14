# Global Contexts Directory

## Architecture Principle

**This directory contains GLOBAL APPLICATION-LEVEL contexts only.**

Domain-specific contexts have been migrated to `/routes/[domain]/` following the Enterprise React Architecture Standard.

---

## What Belongs Here

### ✅ Global Infrastructure Contexts

- **Theme** - App-wide theming and dark mode
- **Toast** - Global notification system
- **QueryClient** - React Query infrastructure

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

## Context Hierarchy

```
<RootProviders>                    ← Infrastructure wrapper
  <EnvProvider>                    ← Environment config (implicit)
    <ThemeProvider>                ← Visual theme (global)
      <QueryClientProvider>        ← Data layer (global)
        <ToastProvider>            ← Notifications (global)
          <AuthProvider>           ← Identity (global)
            <EntitlementsProvider> ← Permissions (global)
              <FlagsProvider>      ← Feature flags (global)
                <Outlet>           ← React Router outlet
                  {/* Domain contexts live in route components */}
                </Outlet>
              </FlagsProvider>
            </EntitlementsProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
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
