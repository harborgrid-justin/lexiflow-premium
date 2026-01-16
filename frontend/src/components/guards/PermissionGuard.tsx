/**
 * Permission Guard Component
 *
 * Conditionally renders children based on user permissions.
 * More granular than role-based guards.
 *
 * @module components/guards/PermissionGuard
 */

import { useAuthActions, useAuthState } from '@/providers/application/authprovider';
import React, { type ReactNode } from 'react';

interface PermissionGuardProps {
  /** Child components to render if permission check passes */
  children: ReactNode;
  /** Required permission(s) */
  permissions: string | string[];
  /** Require all permissions (true) or any permission (false) */
  requireAll?: boolean;
  /** Fallback component to show when permission is denied */
  fallback?: ReactNode;
  /** Callback when access is denied */
  onAccessDenied?: () => void;
}

/**
 * PermissionGuard - Conditionally render based on permissions
 *
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGuard permissions="cases:write">
 *   <EditCaseButton />
 * </PermissionGuard>
 *
 * // Multiple permissions (any)
 * <PermissionGuard permissions={['cases:write', 'cases:admin']}>
 *   <EditCaseButton />
 * </PermissionGuard>
 *
 * // Multiple permissions (all required)
 * <PermissionGuard permissions={['cases:write', 'billing:read']} requireAll>
 *   <BillableActivityEditor />
 * </PermissionGuard>
 *
 * // With fallback
 * <PermissionGuard permissions="admin:settings" fallback={<p>Access Denied</p>}>
 *   <AdminPanel />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null,
  onAccessDenied,
}: PermissionGuardProps) {
  const { user, isLoading } = useAuthState();
  const { hasPermission, logAuthEvent } = useAuthActions();

  // Still loading
  if (isLoading) {
    return null;
  }

  // Not authenticated
  if (!user) {
    return <>{fallback}</>;
  }

  // Normalize permissions to array
  const permissionList = Array.isArray(permissions) ? permissions : [permissions];

  // Check permissions
  const hasAccess = requireAll
    ? permissionList.every(permission => hasPermission(permission))
    : permissionList.some(permission => hasPermission(permission));

  // Access denied
  if (!hasAccess) {
    onAccessDenied?.();
    logAuthEvent({
      type: 'access_denied',
      timestamp: new Date(),
      userId: user.id,
      metadata: {
        requiredPermissions: permissionList,
        requireAll,
      },
    });
    return <>{fallback}</>;
  }

  // Access granted
  return <>{children}</>;
}

/**
 * Invert permission check - show content when permission is NOT present
 */
export function InversePermissionGuard({
  children,
  permissions,
  fallback = null,
}: Omit<PermissionGuardProps, 'requireAll' | 'onAccessDenied'>) {
  const { user, isLoading } = useAuthState();
  const { hasPermission } = useAuthActions();

  if (isLoading || !user) {
    return null;
  }

  const permissionList = Array.isArray(permissions) ? permissions : [permissions];
  const hasAnyPermission = permissionList.some(permission => hasPermission(permission));

  return hasAnyPermission ? <>{fallback}</> : <>{children}</>;
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions: string | string[],
  requireAll = false
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard permissions={permissions} requireAll={requireAll}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}
