/**
 * withAuth Higher-Order Component
 *
 * Standardizes authentication and authorization checks across routes.
 * Eliminates 43+ inline auth checks with a reusable, type-safe HOC.
 *
 * @module routes/_shared/hoc/withAuth
 *
 * @example Basic authentication
 * ```tsx
 * const ProtectedComponent = withAuth(MyComponent);
 * export { ProtectedComponent as Component };
 * ```
 *
 * @example Role-based access
 * ```tsx
 * const AdminComponent = withAuth(MyComponent, {
 *   requireAdmin: true
 * });
 * ```
 *
 * @example Multiple role support
 * ```tsx
 * const LegalComponent = withAuth(MyComponent, {
 *   requireRoles: ['attorney', 'paralegal']
 * });
 * ```
 *
 * @example Custom redirect
 * ```tsx
 * const SecureComponent = withAuth(MyComponent, {
 *   requireAdmin: true,
 *   redirectTo: '/dashboard',
 *   forbiddenMessage: 'Administrator access required'
 * });
 * ```
 */

import { type ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/hooks/useAuth';
import type { AuthRole } from '@/lib/auth/types';

import { ForbiddenError } from '../RouteErrorBoundary';
import { RouteLoading } from '../RouteLoading';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration options for withAuth HOC
 */
export interface WithAuthOptions {
  /** Require admin role */
  requireAdmin?: boolean;
  /** Require attorney role */
  requireAttorney?: boolean;
  /** Require staff role */
  requireStaff?: boolean;
  /** Require specific roles (more flexible than boolean flags) */
  requireRoles?: AuthRole[];
  /** Require specific permissions */
  requirePermissions?: string[];
  /** Custom redirect path for unauthenticated users */
  redirectTo?: string;
  /** Custom forbidden message */
  forbiddenMessage?: string;
  /** Custom forbidden title */
  forbiddenTitle?: string;
  /** Return path after login (defaults to current location) */
  returnTo?: boolean;
}

// ============================================================================
// Role Checking Utilities
// ============================================================================

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: AuthRole, options: WithAuthOptions): boolean {
  // Check specific role flags
  if (options.requireAdmin && userRole !== 'admin' && userRole !== 'Administrator') {
    return false;
  }

  if (options.requireAttorney && !['attorney', 'Senior Partner', 'Partner', 'Associate'].includes(userRole)) {
    return false;
  }

  if (options.requireStaff && !['staff', 'paralegal', 'Paralegal'].includes(userRole)) {
    return false;
  }

  // Check flexible role list
  if (options.requireRoles && options.requireRoles.length > 0) {
    return options.requireRoles.includes(userRole);
  }

  return true;
}

/**
 * Check if user has required permissions
 */
function hasRequiredPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

// ============================================================================
// withAuth HOC
// ============================================================================

/**
 * Higher-Order Component that wraps a component with authentication checks
 *
 * Features:
 * - Redirects to login if not authenticated
 * - Shows loading state during authentication check
 * - Validates role-based access
 * - Validates permission-based access
 * - Shows ForbiddenError if insufficient permissions
 * - Preserves component props with TypeScript generics
 * - Compatible with React Router v7
 *
 * @param WrappedComponent - Component to protect with authentication
 * @param options - Authentication configuration options
 * @returns Protected component with auth checks
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
): ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithAuthComponent(props: P) {
    const location = useLocation();
    const { isAuthenticated, isLoading, user } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
      return <RouteLoading message="Checking authentication..." fullPage />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      const redirectPath = options.redirectTo || '/auth/login';
      const returnPath = options.returnTo !== false ? location.pathname + location.search : undefined;
      const state = returnPath ? { returnTo: returnPath } : undefined;

      return <Navigate to={redirectPath} state={state} replace />;
    }

    // Check role-based access
    if (!hasRequiredRole(user.role, options)) {
      return (
        <ForbiddenError
          title={options.forbiddenTitle || 'Access Denied'}
          message={
            options.forbiddenMessage ||
            'You do not have the required role to access this page.'
          }
          backTo="/"
          backLabel="Go Home"
        />
      );
    }

    // Check permission-based access
    if (options.requirePermissions && options.requirePermissions.length > 0) {
      if (!hasRequiredPermissions(user.permissions || [], options.requirePermissions)) {
        return (
          <ForbiddenError
            title={options.forbiddenTitle || 'Access Denied'}
            message={
              options.forbiddenMessage ||
              'You do not have the required permissions to access this page.'
            }
            backTo="/"
            backLabel="Go Home"
          />
        );
      }
    }

    // All checks passed - render the wrapped component
    return <WrappedComponent {...props} />;
  }

  WithAuthComponent.displayName = `withAuth(${displayName})`;

  return WithAuthComponent;
}

// ============================================================================
// Convenience Wrappers
// ============================================================================

/**
 * HOC that requires admin role
 *
 * @example
 * ```tsx
 * const AdminSettings = withAdminAuth(SettingsComponent);
 * ```
 */
export function withAdminAuth<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> {
  return withAuth(WrappedComponent, {
    requireAdmin: true,
    forbiddenMessage: 'Administrator access is required to view this page.',
  });
}

/**
 * HOC that requires attorney role
 *
 * @example
 * ```tsx
 * const CaseManagement = withAttorneyAuth(CaseComponent);
 * ```
 */
export function withAttorneyAuth<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> {
  return withAuth(WrappedComponent, {
    requireAttorney: true,
    forbiddenMessage: 'Attorney access is required to view this page.',
  });
}

/**
 * HOC that requires staff role
 *
 * @example
 * ```tsx
 * const StaffDashboard = withStaffAuth(DashboardComponent);
 * ```
 */
export function withStaffAuth<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> {
  return withAuth(WrappedComponent, {
    requireStaff: true,
    forbiddenMessage: 'Staff access is required to view this page.',
  });
}
