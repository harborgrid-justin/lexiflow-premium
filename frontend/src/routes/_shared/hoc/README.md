# Route Higher-Order Components (HOCs)

Production-ready HOCs that standardize route patterns across the application.

## Overview

This directory contains HOCs that eliminate repetitive boilerplate in route components:

- **withAuth**: Standardizes 43+ inline authentication checks
- **withLayout**: Consolidates 10+ custom layout patterns
- **loaderUtils**: Type-safe utilities for loader composition

## 🔐 Authentication HOC: `withAuth`

### Basic Usage

Wrap any component to require authentication:

```tsx
import { withAuth } from '@/routes/_shared/hoc';

function CaseDetail() {
  return <div>Case details here</div>;
}

export const Component = withAuth(CaseDetail);
```

### Role-Based Access

Require specific roles with boolean flags:

```tsx
// Admin only
export const Component = withAuth(AdminSettings, {
  requireAdmin: true
});

// Attorney only
export const Component = withAuth(CaseManagement, {
  requireAttorney: true
});

// Staff only (paralegal, staff)
export const Component = withAuth(DocumentReview, {
  requireStaff: true
});
```

### Multiple Roles

Use `requireRoles` for flexible role checking:

```tsx
export const Component = withAuth(LegalDashboard, {
  requireRoles: ['attorney', 'paralegal', 'Senior Partner']
});
```

### Permission-Based Access

Check specific permissions:

```tsx
export const Component = withAuth(SensitiveData, {
  requirePermissions: ['cases.read', 'cases.write', 'cases.delete']
});
```

### Custom Configuration

Override default behavior:

```tsx
export const Component = withAuth(SecureComponent, {
  requireAdmin: true,
  redirectTo: '/dashboard', // Custom redirect instead of /auth/login
  returnTo: false, // Don't return to current page after login
  forbiddenTitle: 'Access Restricted',
  forbiddenMessage: 'You need special clearance for this area.'
});
```

### Convenience Wrappers

Shorthand for common patterns:

```tsx
import { withAdminAuth, withAttorneyAuth, withStaffAuth } from '@/routes/_shared/hoc';

// Require admin
export const Component = withAdminAuth(AdminPanel);

// Require attorney
export const Component = withAttorneyAuth(CaseBrief);

// Require staff
export const Component = withStaffAuth(Filing);
```

### Features

- ✅ Redirects to login if not authenticated
- ✅ Shows loading state during auth check
- ✅ Displays `ForbiddenError` for insufficient permissions
- ✅ Preserves return path for post-login redirect
- ✅ Full TypeScript support with generics
- ✅ Compatible with React Router v7

### What It Replaces

**Before** (repeated in 43+ routes):
```tsx
function CaseDetail() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <RouteLoading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <ForbiddenError />;
  }
  
  // Actual component logic...
}
```

**After**:
```tsx
function CaseDetail() {
  // Actual component logic only...
}

export const Component = withAuth(CaseDetail, { requireAdmin: true });
```

## 📐 Layout HOC: `withLayout`

### Basic Usage

Wrap a component in a layout:

```tsx
import { withLayout } from '@/routes/_shared/hoc';
import { DashboardLayout } from './DashboardLayout';

function DashboardPage() {
  return <div>Dashboard content</div>;
}

const result = withLayout(DashboardPage, DashboardLayout);

export const { Component } = result;
```

### With Loader

Attach a loader to the layout:

```tsx
import { withLayout } from '@/routes/_shared/hoc';
import type { LoaderFunctionArgs } from 'react-router';

async function caseDetailLoader({ params }: LoaderFunctionArgs) {
  const caseData = await DataService.cases.get(params.caseId!);
  return { caseData };
}

function CaseDetailPage() {
  return <div>Case details</div>;
}

const result = withLayout(
  CaseDetailPage,
  CaseLayout,
  caseDetailLoader
);

export const { Component, loader } = result;
```

### Simple Wrapper

Use `wrapInLayout` when you don't need loader attachment:

```tsx
import { wrapInLayout } from '@/routes/_shared/hoc';

function SettingsPage() {
  return <div>Settings</div>;
}

export const Component = wrapInLayout(SettingsPage, SettingsLayout);
```

### Creating Provider Layouts

Use `createLayoutWithData` for context provider patterns:

```tsx
import { createLayoutWithData } from '@/routes/_shared/hoc';

const result = createLayoutWithData(
  CaseProvider,
  caseLoader
);

export const { Component, loader } = result;
```

### Custom Display Name

Override the auto-generated display name:

```tsx
const result = withLayout(
  DocumentsPage,
  DocumentsLayout,
  documentsLoader,
  { displayName: 'DocumentsWithLayout' }
);
```

## 🔧 Loader Utilities: `loaderUtils`

Enhanced loader utilities for composition and auth guards.

### Combining Loaders

Run multiple loaders in parallel:

```tsx
import { combineLoaders } from '@/routes/_shared/loaderUtils';

export const loader = combineLoaders(
  async ({ params }) => ({ 
    caseData: await getCaseData(params.caseId!) 
  }),
  async ({ params }) => ({ 
    documents: await getDocuments(params.caseId!) 
  }),
  async ({ params }) => ({ 
    parties: await getParties(params.caseId!) 
  })
);

// Returns: { caseData, documents, parties }
```

### Chaining Loaders

Run loaders sequentially when they depend on each other:

```tsx
import { chainLoaders } from '@/routes/_shared/loaderUtils';

export const loader = chainLoaders(
  async ({ params }) => ({ userId: params.userId }),
  async ({ params }, prev) => ({
    ...prev,
    user: await getUser(prev.userId)
  }),
  async ({ params }, prev) => ({
    ...prev,
    cases: await getUserCases(prev.user.id)
  })
);
```

### Auth Guards for Loaders

Add authentication checks to loaders:

```tsx
import { withAuthLoader } from '@/routes/_shared/loaderUtils';

// Basic auth
export const loader = withAuthLoader(
  async ({ params }) => {
    return { data: await getData(params.id!) };
  }
);

// Role-based auth
export const loader = withAuthLoader(
  async () => {
    return { adminData: await getAdminData() };
  },
  { requireAdmin: true }
);

// Permission-based auth
export const loader = withAuthLoader(
  async ({ params }) => {
    return { data: await getData(params.id!) };
  },
  { requirePermissions: ['cases.read', 'cases.write'] }
);
```

### Convenience Auth Wrappers

Shorthand for common auth patterns:

```tsx
import { requireAuth, requireAdmin, requireAttorney } from '@/routes/_shared/loaderUtils';

// Require authentication
export const loader = requireAuth(async ({ params }) => {
  return { data: await getData(params.id!) };
});

// Require admin role
export const loader = requireAdmin(async () => {
  return { adminData: await getAdminData() };
});

// Require attorney role
export const loader = requireAttorney(async () => {
  return { cases: await getCases() };
});
```

### Parameter Validation

Validate required route parameters:

```tsx
import { validateParams, requireParam, getOptionalParam } from '@/routes/_shared/loaderUtils';

export async function loader({ params }: LoaderFunctionArgs) {
  // Validate multiple params at once
  const { caseId, documentId } = validateParams(params, ['caseId', 'documentId']);
  
  // Require single param or throw 404
  const userId = requireParam(params, 'userId');
  
  // Optional param with default
  const page = getOptionalParam(params, 'page', '1');
  
  return {
    data: await getData(caseId, documentId)
  };
}
```

## 🎯 Common Patterns

### Protected Admin Route

```tsx
import { withAuth } from '@/routes/_shared/hoc';
import { requireAdmin } from '@/routes/_shared/loaderUtils';

function AdminDashboard() {
  return <div>Admin dashboard</div>;
}

export const Component = withAuth(AdminDashboard, { requireAdmin: true });

export const loader = requireAdmin(async () => {
  return { stats: await getAdminStats() };
});
```

### Layout with Protected Content

```tsx
import { withAuth, withLayout } from '@/routes/_shared/hoc';
import { requireAuth } from '@/routes/_shared/loaderUtils';

function CasePage() {
  return <div>Case content</div>;
}

const ProtectedCasePage = withAuth(CasePage);

const result = withLayout(
  ProtectedCasePage,
  CaseLayout,
  requireAuth(async ({ params }) => {
    return { caseData: await getCaseData(params.caseId!) };
  })
);

export const { Component, loader } = result;
```

### Complex Multi-Role Access

```tsx
import { withAuth } from '@/routes/_shared/hoc';
import { withAuthLoader, combineLoaders } from '@/routes/_shared/loaderUtils';

function DocumentReview() {
  return <div>Document review</div>;
}

export const Component = withAuth(DocumentReview, {
  requireRoles: ['attorney', 'paralegal', 'Senior Partner'],
  requirePermissions: ['documents.read', 'documents.review']
});

export const loader = withAuthLoader(
  combineLoaders(
    async ({ params }) => ({ doc: await getDocument(params.docId!) }),
    async ({ params }) => ({ history: await getDocHistory(params.docId!) })
  ),
  {
    requireRoles: ['attorney', 'paralegal', 'Senior Partner'],
    requirePermissions: ['documents.read']
  }
);
```

## 📚 TypeScript Support

All HOCs and utilities are fully typed with generics:

```tsx
import { withAuth, type WithAuthOptions } from '@/routes/_shared/hoc';

interface MyComponentProps {
  title: string;
  onSave: () => void;
}

function MyComponent({ title, onSave }: MyComponentProps) {
  return <div>{title}</div>;
}

// Props are preserved and type-checked
export const Component = withAuth<MyComponentProps>(MyComponent, {
  requireAdmin: true
});
```

## 🔄 Migration Guide

### Step 1: Identify Auth Boilerplate

Find routes with this pattern:
```tsx
const { user, isAuthenticated, isLoading } = useAuth();
if (!isAuthenticated) return <Navigate ... />;
if (user?.role !== 'admin') return <ForbiddenError />;
```

### Step 2: Replace with HOC

```tsx
// Before
function MyRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  if (user?.role !== 'admin') return <ForbiddenError />;
  
  return <div>Content</div>;
}

// After
function MyRoute() {
  return <div>Content</div>;
}

export const Component = withAuth(MyRoute, { requireAdmin: true });
```

### Step 3: Update Exports

Ensure you export the wrapped component:
```tsx
export const Component = withAuth(MyRoute, options);
export const loader = requireAuth(myLoader);
```

## 🎨 Best Practices

1. **Use HOCs for authentication** - Don't inline auth checks
2. **Combine with loaders** - Protect data loading too
3. **Leverage convenience wrappers** - Use `withAdminAuth`, `requireAdmin`, etc.
4. **Type your props** - Always specify generic types for full type safety
5. **Keep logic separate** - Component should only contain business logic

## 📖 API Reference

See individual files for complete API documentation:

- `withAuth.tsx` - Authentication HOC
- `withLayout.tsx` - Layout HOC
- `loaderUtils.ts` - Loader composition utilities

## ✅ Success Criteria

- Zero inline authentication checks in route components
- Consistent layout patterns across all routes
- Type-safe loader composition
- Reduced boilerplate by 70%+

---

**Last Updated**: 2025-01-18
**Status**: ✅ Production Ready
