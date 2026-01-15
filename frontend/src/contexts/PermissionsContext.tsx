/**
 * ================================================================================
 * PERMISSIONS CONTEXT - APP-LEVEL AUTHORIZATION
 * ================================================================================
 *
 * RESPONSIBILITIES:
 * - Check user permissions/entitlements
 * - Determine feature access
 * - Role-based access control (RBAC)
 * - Plan/tier-based feature gates
 *
 * ARCHITECTURE LAYER: App-Level (not infrastructure, not domain)
 * - Sits between Auth and Feature contexts
 * - Depends on AuthContext
 * - Used by all feature routes
 *
 * PATTERN:
 * AuthContext provides user → PermissionsContext derives permissions → Features check access
 *
 * @module contexts/PermissionsContext
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './auth/AuthProvider';

// ============================================================================
// TYPES
// ============================================================================

export type Permission =
  | 'cases:read'
  | 'cases:write'
  | 'cases:delete'
  | 'docket:read'
  | 'docket:write'
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'reports:read'
  | 'reports:write'
  | 'admin:access'
  | 'admin:users'
  | 'admin:settings'
  | 'billing:read'
  | 'billing:write';

export type UserRole = 'admin' | 'attorney' | 'paralegal' | 'staff' | 'guest';

export type PlanTier = 'free' | 'professional' | 'enterprise';

interface PermissionsContextValue {
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

  // Role checks
  role: UserRole | null;
  isAdmin: boolean;
  isAttorney: boolean;
  isParalegal: boolean;

  // Plan/tier checks
  planTier: PlanTier;
  canAccessFeature: (feature: string) => boolean;

  // User limits
  limits: {
    maxCases: number;
    maxUsers: number;
    maxStorage: number; // in GB
  };
}

// ============================================================================
// CONTEXT
// ============================================================================

const PermissionsContext = createContext<PermissionsContextValue | undefined>(
  undefined
);

// ============================================================================
// PROVIDER
// ============================================================================

interface PermissionsProviderProps {
  children: React.ReactNode;
}

/**
 * Permissions Provider
 * Derives permissions from auth state and user metadata
 */
export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { user } = useAuth();

  const value = useMemo<PermissionsContextValue>(() => {
    // If no user, return guest permissions
    if (!user) {
      return {
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        role: 'guest',
        isAdmin: false,
        isAttorney: false,
        isParalegal: false,
        planTier: 'free',
        canAccessFeature: () => false,
        limits: {
          maxCases: 0,
          maxUsers: 0,
          maxStorage: 0,
        },
      };
    }

    // Extract user metadata
    const role = (user.role || 'staff') as UserRole;
    const planTier = (user.planTier || 'free') as PlanTier;
    const permissions = user.permissions || [];

    // Role-based permission mapping
    const rolePermissions: Record<UserRole, Permission[]> = {
      admin: [
        'cases:read',
        'cases:write',
        'cases:delete',
        'docket:read',
        'docket:write',
        'documents:read',
        'documents:write',
        'documents:delete',
        'reports:read',
        'reports:write',
        'admin:access',
        'admin:users',
        'admin:settings',
        'billing:read',
        'billing:write',
      ],
      attorney: [
        'cases:read',
        'cases:write',
        'docket:read',
        'docket:write',
        'documents:read',
        'documents:write',
        'reports:read',
        'reports:write',
      ],
      paralegal: [
        'cases:read',
        'cases:write',
        'docket:read',
        'documents:read',
        'documents:write',
        'reports:read',
      ],
      staff: [
        'cases:read',
        'docket:read',
        'documents:read',
        'reports:read',
      ],
      guest: [],
    };

    const userPermissions = [
      ...rolePermissions[role],
      ...permissions,
    ] as Permission[];

    // Plan-based feature gates
    const planFeatures: Record<PlanTier, string[]> = {
      free: ['cases', 'docket', 'documents'],
      professional: [
        'cases',
        'docket',
        'documents',
        'reports',
        'analytics',
        'timekeeping',
      ],
      enterprise: [
        'cases',
        'docket',
        'documents',
        'reports',
        'analytics',
        'timekeeping',
        'billing',
        'compliance',
        'admin',
      ],
    };

    // Plan-based limits
    const planLimits: Record<PlanTier, typeof value.limits> = {
      free: {
        maxCases: 10,
        maxUsers: 3,
        maxStorage: 5,
      },
      professional: {
        maxCases: 100,
        maxUsers: 10,
        maxStorage: 50,
      },
      enterprise: {
        maxCases: Infinity,
        maxUsers: Infinity,
        maxStorage: 500,
      },
    };

    return {
      hasPermission: (permission: Permission) =>
        userPermissions.includes(permission),

      hasAnyPermission: (permissions: Permission[]) =>
        permissions.some((p) => userPermissions.includes(p)),

      hasAllPermissions: (permissions: Permission[]) =>
        permissions.every((p) => userPermissions.includes(p)),

      role,
      isAdmin: role === 'admin',
      isAttorney: role === 'attorney',
      isParalegal: role === 'paralegal',

      planTier,
      canAccessFeature: (feature: string) =>
        planFeatures[planTier]?.includes(feature) || false,

      limits: planLimits[planTier],
    };
  }, [user]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access permissions context
 * @throws {Error} if used outside PermissionsProvider
 */
export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Conditional rendering based on permission
 */
interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Conditional rendering based on role
 */
interface RequireRoleProps {
  role: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({
  role,
  children,
  fallback = null,
}: RequireRoleProps) {
  const { role: userRole } = usePermissions();
  const roles = Array.isArray(role) ? role : [role];
  return userRole && roles.includes(userRole) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Conditional rendering based on plan tier
 */
interface RequireFeatureProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireFeature({
  feature,
  children,
  fallback = null,
}: RequireFeatureProps) {
  const { canAccessFeature } = usePermissions();
  return canAccessFeature(feature) ? <>{children}</> : <>{fallback}</>;
}
