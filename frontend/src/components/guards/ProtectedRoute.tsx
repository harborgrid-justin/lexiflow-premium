/**
 * ProtectedRoute Component
 *
 * Wrapper component that enforces authentication and optionally role-based access
 * Use this component when you need client-side route protection
 *
 * Note: For React Router v7, it's recommended to use loaders with route guards
 * instead of wrapper components. This component is provided for backwards
 * compatibility and specific use cases.
 *
 * @module components/guards/ProtectedRoute
 */

import { useAuthState } from '@/providers/AuthProvider';
import type { UserRole } from '@/utils/route-guards';
import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

// ============================================================================
// Types
// ============================================================================

interface ProtectedRouteProps {
  /** Child components to render if access is granted */
  children: ReactNode;
  /** Required roles for access (if undefined, only authentication is required) */
  requiredRoles?: UserRole[];
  /** Required permissions for access */
  requiredPermissions?: string[];
  /** Whether user needs ALL permissions (true) or ANY permission (false) */
  requireAllPermissions?: boolean;
  /** Custom fallback component to show while checking auth */
  fallback?: ReactNode;
  /** Custom redirect path (defaults to /login) */
  redirectTo?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProtectedRoute - Client-side route protection component
 *
 * @example
 * ```tsx
 * // Require authentication only
 * <ProtectedRoute>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * // Require specific role
 * <ProtectedRoute requiredRoles={['admin']}>
 *   <AdminSettings />
 * </ProtectedRoute>
 *
 * // Require specific permissions
 * <ProtectedRoute requiredPermissions={['cases:write']}>
 *   <CaseEditor />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermissions,
  requireAllPermissions = false,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuthState();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      const currentPath = window.location.pathname;
      const redirect = encodeURIComponent(currentPath);
      navigate(`${redirectTo}?redirect=${redirect}`, { replace: true });
      return;
    }

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user.role as UserRole);
      if (!hasRequiredRole) {
        console.warn('[ProtectedRoute] User does not have required role');
        navigate('/dashboard', { replace: true });
        return;
      }
    }

    // Check permission requirements
    if (requiredPermissions && requiredPermissions.length > 0) {
      const checkPermissions = requireAllPermissions
        ? requiredPermissions.every((perm) => user.permissions.includes(perm))
        : requiredPermissions.some((perm) => user.permissions.includes(perm));

      if (!checkPermissions) {
        console.warn('[ProtectedRoute] User does not have required permissions');
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    requiredRoles,
    requiredPermissions,
    requireAllPermissions,
    navigate,
    redirectTo,
  ]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or doesn't meet requirements
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role as UserRole);
    if (!hasRequiredRole) {
      return null;
    }
  }

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const checkPermissions = requireAllPermissions
      ? requiredPermissions.every((perm) => user.permissions.includes(perm))
      : requiredPermissions.some((perm) => user.permissions.includes(perm));

    if (!checkPermissions) {
      return null;
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

// ============================================================================
// Convenience Components
// ============================================================================

/**
 * AdminRoute - Requires admin role
 */
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * AttorneyRoute - Requires attorney or admin role
 */
export function AttorneyRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'attorney']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * StaffRoute - Requires attorney, paralegal, or admin role
 */
export function StaffRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'attorney', 'paralegal']} {...props}>
      {children}
    </ProtectedRoute>
  );
}
