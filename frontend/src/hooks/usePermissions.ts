/**
 * usePermissions Hook
 *
 * React hook for checking user permissions
 * Provides easy access to permission checking functions
 */

import { useAuthState } from '@/contexts/auth/AuthProvider';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  hasRoleLevel,
  canAccessResource,
  isAdmin,
  canManageUsers,
  canManageBilling,
  canViewAnalytics,
  canManageOrganization,
  type Permission,
  type UserRole,
} from '@/utils/permissions';
import { useMemo } from 'react';

/**
 * Hook for permission checking
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { can, canAny, canAll, isRole } = usePermissions();
 *
 *   if (can('cases:create')) {
 *     return <CreateCaseButton />;
 *   }
 *
 *   if (isRole('Administrator')) {
 *     return <AdminPanel />;
 *   }
 *
 *   return null;
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuthState();

  return useMemo(
    () => ({
      /**
       * Check if user has a specific permission
       */
      can: (permission: Permission) => hasPermission(user, permission),

      /**
       * Check if user has any of the specified permissions
       */
      canAny: (permissions: Permission[]) => hasAnyPermission(user, permissions),

      /**
       * Check if user has all of the specified permissions
       */
      canAll: (permissions: Permission[]) => hasAllPermissions(user, permissions),

      /**
       * Check if user has a specific role
       */
      isRole: (role: UserRole) => hasRole(user, role),

      /**
       * Check if user has any of the specified roles
       */
      isAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),

      /**
       * Check if user has a role at or above a certain level
       */
      hasRoleLevel: (minimumRole: UserRole) => hasRoleLevel(user, minimumRole),

      /**
       * Check if user can access a resource (permission + organization check)
       */
      canAccess: (permission: Permission, resourceOrgId?: string) =>
        canAccessResource(user, permission, resourceOrgId),

      /**
       * Check if user is an admin
       */
      isAdmin: () => isAdmin(user),

      /**
       * Check if user can manage other users
       */
      canManageUsers: () => canManageUsers(user),

      /**
       * Check if user can manage billing
       */
      canManageBilling: () => canManageBilling(user),

      /**
       * Check if user can view analytics
       */
      canViewAnalytics: () => canViewAnalytics(user),

      /**
       * Check if user can manage organization settings
       */
      canManageOrganization: () => canManageOrganization(user),
    }),
    [user]
  );
}

/**
 * Hook to require a specific permission
 * Throws an error if user doesn't have the permission
 *
 * @example
 * ```tsx
 * function AdminComponent() {
 *   useRequirePermission('users:*');
 *   return <AdminPanel />;
 * }
 * ```
 */
export function useRequirePermission(permission: Permission) {
  const { can } = usePermissions();

  if (!can(permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Hook to require a specific role
 * Throws an error if user doesn't have the role
 *
 * @example
 * ```tsx
 * function AdminComponent() {
 *   useRequireRole('Administrator');
 *   return <AdminPanel />;
 * }
 * ```
 */
export function useRequireRole(role: UserRole) {
  const { isRole } = usePermissions();

  if (!isRole(role)) {
    throw new Error(`Role required: ${role}`);
  }
}
