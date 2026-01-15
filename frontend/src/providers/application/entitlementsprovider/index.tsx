/**
 * ================================================================================
 * ENTITLEMENTS PROVIDER - APPLICATION LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + RBAC + Loader Integration
 *
 * RESPONSIBILITIES:
 * • Role-Based Access Control (RBAC)
 * • Permission checks (has, hasAny, hasAll)
 * • Resource-level authorization
 * • Capability validation
 * • Dynamic permission updates
 *
 * REACT 18 PATTERNS:
 * ✓ Memoized permission checks (stable functions)
 * ✓ Set-based storage (O(1) lookups)
 * ✓ Immutable state updates
 * ✓ Loader-based initialization
 * ✓ StrictMode compatible
 *
 * LOADER INTEGRATION:
 * • Receives initialPermissions from root loader
 * • Server is source of truth for permissions
 * • Can refresh permissions on demand
 *
 * DATA FLOW:
 * SERVER → LOADER → ENTITLEMENTS PROVIDER → PROTECTED COMPONENTS
 *
 * USAGE PATTERN:
 * ```tsx
 * const { hasPermission } = useEntitlements();
 *
 * if (!hasPermission('cases:delete')) {
 *   return <AccessDenied />;
 * }
 * ```
 *
 * ENTERPRISE INVARIANTS:
 * • Server authoritative (permissions from backend)
 * • No local permission granting
 * • Observable permission changes
 * • Guard clauses in components
 *
 * @module providers/application/entitlementsprovider
 */

import { createContext, ReactNode, startTransition, useCallback, useContext, useMemo, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type Permission = string;
export type Role = string;

export interface EntitlementsState {
  permissions: Set<Permission>;
  roles: Set<Role>;
  isLoading: boolean;
}

export interface EntitlementsContextValue extends EntitlementsState {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
  refresh: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export interface EntitlementsProviderProps {
  children: ReactNode;
  initialPermissions?: Permission[];
  initialRoles?: Role[];
}

export function EntitlementsProvider({
  children,
  initialPermissions = [],
  initialRoles = [],
}: EntitlementsProviderProps) {
  const [permissions, setPermissions] = useState<Set<Permission>>(
    new Set(initialPermissions)
  );
  const [roles, setRoles] = useState<Set<Role>>(new Set(initialRoles));
  const [isLoading, setIsLoading] = useState(false);

  // Stable permission checks
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.has(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: Permission[]): boolean => {
      return perms.some((p) => permissions.has(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (perms: Permission[]): boolean => {
      return perms.every((p) => permissions.has(p));
    },
    [permissions]
  );

  const hasRole = useCallback(
    (role: Role): boolean => {
      return roles.has(role);
    },
    [roles]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // SERVER TRUTH: Fetch latest permissions from backend
      const response = await fetch('/api/auth/permissions');
      if (response.ok) {
        const data = await response.json();
        // Use immutable updates
        startTransition(() => {
          setPermissions(new Set(data.permissions || []));
          setRoles(new Set(data.roles || []));
        });
      }
    } catch (err) {
      console.error('[EntitlementsProvider] Failed to refresh:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized context value (stability requirement)
  const value = useMemo(
    () => ({
      permissions,
      roles,
      isLoading,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      refresh,
    }),
    [permissions, roles, isLoading, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, refresh]
  );

  return (
    <EntitlementsContext.Provider value={value}>
      {children}
    </EntitlementsContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useEntitlements(): EntitlementsContextValue {
  const context = useContext(EntitlementsContext);

  if (!context) {
    throw new Error('useEntitlements must be used within EntitlementsProvider');
  }

  return context;
}
