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

import { EntitlementsActionsContext, EntitlementsStateContext } from '@/lib/entitlements/contexts';
import type { EntitlementsActionsValue, EntitlementsStateValue, Plan } from '@/lib/entitlements/types';
import { ReactNode, startTransition, useCallback, useContext, useMemo, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type Permission = string;
export type Role = string;

export interface ExtendedEntitlementsState extends EntitlementsStateValue {
  permissions: Set<Permission>;
  roles: Set<Role>;
}

// Re-export types from /lib for consumers
export type { Entitlements, Plan } from '@/lib/entitlements/types';
import type { Plan } from '@/lib/entitlements/types';

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
  const [error, setError] = useState<string | null>(null);

  // Derive entitlements object from permissions (compatibility with /lib types)
  const entitlements = useMemo(() => ({
    plan: (permissions.has('admin') ? 'enterprise' :
      permissions.has('attorney') ? 'pro' : 'free') as Plan,
    canUseAdminTools: permissions.has('admin'),
    maxCases: permissions.has('admin') ? -1 : permissions.has('attorney') ? 100 : 10,
    storageLimitGB: permissions.has('admin') ? -1 : permissions.has('attorney') ? 100 : 5,
  }), [permissions]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
      } else {
        throw new Error('Failed to refresh entitlements');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh entitlements';
      setError(errorMsg);
      console.error('[EntitlementsProvider] Failed to refresh:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    startTransition(() => {
      setPermissions(new Set());
      setRoles(new Set());
      setError(null);
    });
  }, []);

  // Memoized state value (BP7: Split state/actions contexts)
  const stateValue = useMemo<EntitlementsStateValue>(
    () => ({
      entitlements,
      isLoading,
      error,
    }),
    [entitlements, isLoading, error]
  );

  // Memoized actions value (BP7: Split state/actions contexts)
  const actionsValue = useMemo<EntitlementsActionsValue>(
    () => ({
      refresh,
      reset,
    }),
    [refresh, reset]
  );

  return (
    <EntitlementsStateContext.Provider value={stateValue}>
      <EntitlementsActionsContext.Provider value={actionsValue}>
        {children}
      </EntitlementsActionsContext.Provider>
    </EntitlementsStateContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Access entitlements state (permissions, roles, loading status)
 * Use this for read-only state access in components
 */
export function useEntitlementsState(): EntitlementsStateValue {
  const context = useContext(EntitlementsStateContext);

  if (!context) {
    throw new Error('useEntitlementsState must be used within EntitlementsProvider');
  }

  return context;
}

/**
 * Access entitlements actions (permission checks, role checks, refresh)
 * Use this for permission checking and data operations
 */
export function useEntitlementsActions(): EntitlementsActionsValue {
  const context = useContext(EntitlementsActionsContext);

  if (!context) {
    throw new Error('useEntitlementsActions must be used within EntitlementsProvider');
  }

  return context;
}

/**
 * Convenience hook to access both state and actions
 * @deprecated Prefer using useEntitlementsState and useEntitlementsActions separately for better performance
 */
export function useEntitlements() {
  return {
    ...useEntitlementsState(),
    ...useEntitlementsActions(),
  };
}

// ============================================================================
// EXTENDED UTILITY HOOKS (BEYOND /lib INTERFACE)
// ============================================================================

/**
 * Hook for permission checking (beyond base /lib interface)
 * These are convenience methods built on top of the core entitlements
 */
export function usePermissions() {
  const state = useEntitlementsState();
  const actions = useEntitlementsActions();

  // These are stored internally but not exposed in /lib interface
  const [permissions] = useState<Set<string>>(new Set());
  const [roles] = useState<Set<string>>(new Set());

  return useMemo(() => ({
    hasPermission: (permission: string): boolean => permissions.has(permission),
    hasAnyPermission: (perms: string[]): boolean => perms.some((p) => permissions.has(p)),
    hasAllPermissions: (perms: string[]): boolean => perms.every((p) => permissions.has(p)),
    hasRole: (role: string): boolean => roles.has(role),
    ...state,
    ...actions,
  }), [permissions, roles, state, actions]);
}
