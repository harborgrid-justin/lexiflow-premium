# Route Protection Guide

This guide explains how to implement route protection in LexiFlow using React Router v7.

## Overview

LexiFlow uses a multi-layered approach to route protection:

1. **Layout-Level Protection** - All routes under `layout.tsx` require authentication
2. **Route-Level Protection** - Individual routes can require specific roles or permissions
3. **Component-Level Protection** - UI elements can be conditionally rendered based on user roles

## Table of Contents

- [Authentication Guards](#authentication-guards)
- [Role-Based Access Control](#role-based-access-control)
- [Permission-Based Access Control](#permission-based-access-control)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Authentication Guards

### Basic Authentication

All routes nested under `layout.tsx` automatically require authentication. The layout loader checks for a valid auth token and redirects to login if not found.

```typescript
// routes/layout.tsx
export async function loader({ request }: Route.LoaderArgs) {
  // Automatically checks authentication
  // Redirects to /login if not authenticated
}
```

### Public Routes

Routes outside the layout (login, register, etc.) are public and don't require authentication:

```typescript
// routes.ts
export default [
  // Public routes
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),

  // Protected routes
  layout("routes/layout.tsx", [
    // All child routes require authentication
    route("dashboard", "routes/dashboard.tsx"),
    // ...
  ]),
];
```

## Role-Based Access Control

### Available Roles

```typescript
type UserRole = 'admin' | 'attorney' | 'paralegal' | 'client';
```

### Route Guards

Import and use route guards in your route loaders:

```typescript
import { requireAdmin, requireAttorney, requireStaff } from '@/utils/route-guards';

// Admin-only route
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAdmin(request);
  // Only admins can access this route
  return { user };
}

// Attorney or admin route
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAttorney(request);
  // Only attorneys and admins can access this route
  return { user };
}

// Staff route (attorney, paralegal, or admin)
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireStaff(request);
  // Only staff members can access this route
  return { user };
}
```

### Custom Role Requirements

```typescript
import { requireRole } from '@/utils/route-guards';

export async function loader({ request }: Route.LoaderArgs) {
  // Require specific role(s)
  const { user } = requireRole(request, 'attorney', 'paralegal');
  return { user };
}
```

## Permission-Based Access Control

### Permission Guards

```typescript
import { requirePermission, requireAllPermissions, requireAnyPermission } from '@/utils/route-guards';

// Single permission
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requirePermission(request, 'cases:write');
  return { user };
}

// All permissions required
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAllPermissions(request, ['cases:write', 'cases:delete']);
  return { user };
}

// Any permission required
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAnyPermission(request, ['cases:read', 'cases:write']);
  return { user };
}
```

## Usage Examples

### Example 1: Admin Dashboard

```typescript
// routes/admin/index.tsx
import { requireAdmin } from '@/utils/route-guards';
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  // Only admins can access
  const { user } = requireAdmin(request);

  // Fetch admin-specific data
  const stats = await fetchAdminStats();

  return { user, stats };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { stats } = loaderData;
  return <div>Admin Dashboard</div>;
}
```

### Example 2: Case Editor (Attorney Only)

```typescript
// routes/cases/[caseId]/edit.tsx
import { requireAttorney } from '@/utils/route-guards';
import type { Route } from "./+types/edit";

export async function loader({ request, params }: Route.LoaderArgs) {
  // Only attorneys and admins can edit cases
  const { user } = requireAttorney(request);

  const caseData = await fetchCase(params.caseId);

  return { user, caseData };
}
```

### Example 3: Billing (Permission-Based)

```typescript
// routes/billing/index.tsx
import { requirePermission } from '@/utils/route-guards';
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  // Require billing permission
  const { user } = requirePermission(request, 'billing:read');

  const invoices = await fetchInvoices();

  return { user, invoices };
}
```

### Example 4: Guest Routes (Login/Register)

```typescript
// routes/auth/login.tsx
import { requireGuest } from '@/utils/route-guards';
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
  // Redirect to dashboard if already authenticated
  requireGuest(request);

  return {};
}
```

## Component-Level Protection

### Using ProtectedRoute Component

For client-side protection of UI elements:

```typescript
import { ProtectedRoute, AdminRoute, AttorneyRoute } from '@/components/guards';

function Dashboard() {
  return (
    <div>
      {/* Only admins can see this */}
      <AdminRoute>
        <AdminSettings />
      </AdminRoute>

      {/* Only attorneys and admins can see this */}
      <AttorneyRoute>
        <CaseManagement />
      </AttorneyRoute>

      {/* Custom protection */}
      <ProtectedRoute requiredPermissions={['billing:write']}>
        <BillingControls />
      </ProtectedRoute>
    </div>
  );
}
```

### Using Utility Functions

For conditional rendering:

```typescript
import { hasRole, hasPermission, hasAnyRole } from '@/utils/route-guards';

function Sidebar() {
  return (
    <nav>
      <NavItem to="/dashboard">Dashboard</NavItem>

      {hasRole('admin') && (
        <NavItem to="/admin">Admin Panel</NavItem>
      )}

      {hasAnyRole('admin', 'attorney') && (
        <NavItem to="/cases">Cases</NavItem>
      )}

      {hasPermission('billing:read') && (
        <NavItem to="/billing">Billing</NavItem>
      )}
    </nav>
  );
}
```

## Best Practices

### 1. Always Use Loaders for Route Protection

✅ **Good**: Use loaders with route guards
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAdmin(request);
  return { user };
}
```

❌ **Bad**: Relying only on client-side checks
```typescript
// Client-side only - can be bypassed!
export default function AdminPage() {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Redirect to="/" />;
  // ...
}
```

### 2. Fail Securely

Always throw responses for unauthorized access:

```typescript
// The route guards automatically throw responses
requireAdmin(request); // Throws 403 if not admin
```

### 3. Combine with Permission Checks

For fine-grained control, combine role and permission checks:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  // Require attorney role
  const { user } = requireAttorney(request);

  // Additional permission check
  if (!user.permissions.includes('cases:delete')) {
    throw new Response('Forbidden', { status: 403 });
  }

  return { user };
}
```

### 4. Keep UI in Sync

Use the same role/permission checks in your UI:

```typescript
// In loader
const { user } = requirePermission(request, 'cases:write');

// In component
{hasPermission('cases:write') && (
  <EditCaseButton />
)}
```

### 5. Document Route Requirements

Add comments to document access requirements:

```typescript
/**
 * Admin Dashboard
 *
 * Access: Admin only
 * Permissions: None required (role-based)
 */
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAdmin(request);
  return { user };
}
```

## Error Handling

Route guards automatically throw appropriate HTTP responses:

- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Authenticated but lacking required role/permission
- **302 Redirect**: Redirects to login with return URL

These are handled by React Router's error boundary system:

```typescript
// routes/layout.tsx or individual routes
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        return <div>Please log in</div>;
      case 403:
        return <div>Access denied</div>;
      default:
        return <div>Error {error.status}</div>;
    }
  }
  return <div>An error occurred</div>;
}
```

## Migration from Legacy Approaches

If migrating from older route protection patterns:

### Before (Legacy)
```typescript
function ProtectedComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;
  return <div>Protected Content</div>;
}
```

### After (React Router v7)
```typescript
// Route loader
export async function loader({ request }: Route.LoaderArgs) {
  const { user } = requireAuthentication(request);
  return { user };
}

// Component
export default function ProtectedRoute({ loaderData }: Route.ComponentProps) {
  return <div>Protected Content</div>;
}
```

## Summary

- ✅ Use route loaders with guard functions for server-side protection
- ✅ Use ProtectedRoute components for client-side UI protection
- ✅ Use utility functions (hasRole, hasPermission) for conditional rendering
- ✅ Always fail securely with appropriate HTTP responses
- ✅ Keep route protection and UI visibility in sync
- ❌ Don't rely solely on client-side checks
- ❌ Don't bypass authentication in development (use test users instead)
