# Route Guards Quick Start Guide

Quick reference for implementing route protection in LexiFlow.

## Import Route Guards

```typescript
import {
  requireAuthentication,
  requireAdmin,
  requireAttorney,
  requireStaff,
  requireRole,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireGuest,
} from '@/utils/route-guards';
```

## Common Patterns

### 1. Require Authentication Only

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAuthentication(request);
  return { user };
}
```

### 2. Admin-Only Route

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAdmin(request);
  // Only admins can access this
  return { user };
}
```

### 3. Attorney or Admin

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAttorney(request);
  // Attorneys and admins can access this
  return { user };
}
```

### 4. Staff Members Only

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireStaff(request);
  // Attorneys, paralegals, and admins can access this
  return { user };
}
```

### 5. Custom Roles

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireRole(request, 'attorney', 'paralegal');
  // Only attorneys and paralegals
  return { user };
}
```

### 6. Permission-Based

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requirePermission(request, 'cases:write');
  // User must have cases:write permission
  return { user };
}
```

### 7. Multiple Permissions (ALL)

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAllPermissions(request, [
    'cases:write',
    'cases:delete',
  ]);
  // User must have ALL listed permissions
  return { user };
}
```

### 8. Multiple Permissions (ANY)

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAnyPermission(request, [
    'cases:read',
    'cases:write',
  ]);
  // User must have AT LEAST ONE permission
  return { user };
}
```

### 9. Guest Routes (Login/Register)

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  requireGuest(request);
  // Redirects to dashboard if already authenticated
  return {};
}
```

## Component-Level Protection

### Using ProtectedRoute

```typescript
import { ProtectedRoute, AdminRoute, AttorneyRoute } from '@/components/guards';

// Admin only
<AdminRoute>
  <AdminPanel />
</AdminRoute>

// Attorney or admin
<AttorneyRoute>
  <CaseManagement />
</AttorneyRoute>

// Custom roles
<ProtectedRoute requiredRoles={['attorney', 'paralegal']}>
  <CaseEditor />
</ProtectedRoute>

// Permission-based
<ProtectedRoute requiredPermissions={['billing:write']}>
  <BillingControls />
</ProtectedRoute>
```

### Conditional Rendering

```typescript
import { hasRole, hasPermission, hasAnyRole } from '@/utils/route-guards';

// Check role
{hasRole('admin') && <AdminButton />}

// Check any role
{hasAnyRole('admin', 'attorney') && <CasesLink />}

// Check permission
{hasPermission('billing:write') && <EditInvoiceButton />}
```

## Error Handling

Route guards automatically throw appropriate responses:

- **401 Unauthorized** - Not authenticated
- **403 Forbidden** - Missing required role/permission
- **302 Redirect** - Redirects to login

Handle in ErrorBoundary:

```typescript
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        return <div>Please log in to continue</div>;
      case 403:
        return <div>You don't have permission to access this page</div>;
      default:
        return <div>Error {error.status}</div>;
    }
  }
  return <div>An unexpected error occurred</div>;
}
```

## User Roles

```typescript
type UserRole = 'admin' | 'attorney' | 'paralegal' | 'client';
```

**Access Levels**:
- `admin` - Full system access
- `attorney` - Case management & legal work
- `paralegal` - Support functions
- `client` - View-only access

## Common Permissions

Format: `resource:action`

**Cases**:
- `cases:read` - View cases
- `cases:write` - Edit cases
- `cases:delete` - Delete cases
- `cases:create` - Create cases

**Documents**:
- `documents:read` - View documents
- `documents:write` - Edit documents
- `documents:delete` - Delete documents

**Billing**:
- `billing:read` - View billing
- `billing:write` - Manage billing
- `billing:approve` - Approve invoices

**Admin**:
- `admin:users` - Manage users
- `admin:roles` - Manage roles
- `admin:settings` - System settings

## Quick Tips

✅ **DO**: Use guards in route loaders for server-side protection
✅ **DO**: Use ProtectedRoute for client-side UI protection
✅ **DO**: Keep route guards and UI visibility checks in sync
✅ **DO**: Document required roles/permissions in route comments

❌ **DON'T**: Rely only on client-side checks
❌ **DON'T**: Hardcode role checks - use guard utilities
❌ **DON'T**: Skip error boundaries
❌ **DON'T**: Bypass guards in development (use test users)

## Full Example

```typescript
// routes/cases/[caseId]/edit.tsx
import { requireAttorney, hasPermission } from '@/utils/route-guards';
import type { Route } from "./+types/edit";

/**
 * Edit Case Route
 *
 * Access: Attorneys and admins only
 * Permissions: cases:write required
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  // 1. Check role (attorney or admin)
  const { user } = requireAttorney(request);

  // 2. Additional permission check
  if (!user.permissions.includes('cases:write')) {
    throw new Response('You need cases:write permission', { status: 403 });
  }

  // 3. Fetch data
  const caseData = await fetchCase(params.caseId);

  return { user, caseData };
}

export default function EditCase({ loaderData }: Route.ComponentProps) {
  const { user, caseData } = loaderData;

  return (
    <div>
      <h1>Edit Case: {caseData.name}</h1>

      {/* Show delete button only if user has permission */}
      {hasPermission('cases:delete') && (
        <button>Delete Case</button>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      return <div>Access denied. You need attorney role to edit cases.</div>;
    }
  }
  return <div>Failed to load case editor</div>;
}
```

## Need More Info?

See the complete guide: `/frontend/src/docs/ROUTE_PROTECTION_GUIDE.md`
