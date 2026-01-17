/**
 * ================================================================================
 * ROLE PROVIDER - APPLICATION LAYER
 * ================================================================================
 *
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * React v18 + Role-Based Access Control + Service Layer
 *
 * RESPONSIBILITIES:
 * • Role assignment and management
 * • Role hierarchy enforcement
 * • Role-based permission aggregation
 * • Dynamic role updates
 * • Role inheritance logic
 *
 * REACT 18 PATTERNS:
 * ✓ BP3: Split state/actions contexts for optimal re-renders
 * ✓ BP7: useMemo for stable context values
 * ✓ BP8: useCallback for stable action functions
 * ✓ BP10: Transitions for non-urgent updates
 * ✓ BP14: StrictMode compatible (proper cleanup)
 *
 * ARCHITECTURE:
 * • Uses apiClient service layer (not direct API calls)
 * • Reads from /config for constants
 * • Types from /lib/role
 * • Server is source of truth for role data
 *
 * DATA FLOW:
 * SERVER → SERVICE LAYER → ROLE PROVIDER → COMPONENTS
 *
 * USAGE:
 * ```tsx
 * // State access (read-only)
 * const { currentRoles, isLoading } = useRoleState();
 *
 * // Action access (stable callbacks)
 * const { hasRole, hasRoleOrHigher } = useRoleActions();
 *
 * if (!hasRole('admin')) {
 *   return <AccessDenied />;
 * }
 * ```
 *
 * PERFORMANCE:
 * • Role checks are O(1) using Set lookups
 * • Hierarchy stored in Map for fast traversal
 * • Memoized permission aggregation
 * • Split contexts prevent unnecessary re-renders
 *
 * @module providers/application/roleprovider
 */

import { RoleActionsContext, RoleStateContext } from '@/lib/role/contexts';
import type {
  Role,
  RoleActionsValue,
  RoleEvent,
  RoleHierarchy,
  RoleStateValue,
  SystemRole,
} from '@/lib/role/types';
import { apiClient } from '@/services/infrastructure/api-client.service';
import {
  ReactNode,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ============================================================================
// Constants
// ============================================================================

const ROLE_AUDIT_LOG_KEY = 'lexiflow-role-audit-log';

// Default role hierarchy (lower number = higher privilege)
const DEFAULT_HIERARCHY: Record<SystemRole, number> = {
  Administrator: 0,
  'Senior Partner': 1,
  Partner: 2,
  admin: 3,
  Associate: 4,
  attorney: 5,
  Paralegal: 6,
  paralegal: 7,
  staff: 8,
  'Client User': 9,
  Guest: 10,
};

const ROLE_API_ENABLED = import.meta.env?.VITE_ROLES_API_ENABLED === 'true';

const DEFAULT_AVAILABLE_ROLES: Role[] = Object.entries(DEFAULT_HIERARCHY).map(
  ([name, hierarchy]) => ({
    id: `role-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name: name as SystemRole,
    displayName: name,
    description: `${name} role`,
    permissions: [],
    hierarchy,
    isSystem: true,
  })
);

// ============================================================================
// Helper Functions
// ============================================================================

function logRoleEvent(event: RoleEvent): void {
  try {
    const logs = JSON.parse(
      localStorage.getItem(ROLE_AUDIT_LOG_KEY) || '[]'
    ) as RoleEvent[];

    logs.push({
      ...event,
      timestamp: new Date(event.timestamp),
    });

    // Keep last 100 events
    localStorage.setItem(ROLE_AUDIT_LOG_KEY, JSON.stringify(logs.slice(-100)));
  } catch (error) {
    console.error('[RoleProvider] Failed to log event:', error);
  }
}

function buildHierarchyMap(roles: Role[]): Map<SystemRole, RoleHierarchy> {
  const hierarchyMap = new Map<SystemRole, RoleHierarchy>();

  roles.forEach((role) => {
    const hierarchy: RoleHierarchy = {
      role: role.name,
      inheritsFrom: [],
      level: role.hierarchy,
    };

    // Build inheritance chain (inherit from roles with lower hierarchy number)
    roles.forEach((otherRole) => {
      if (otherRole.hierarchy < role.hierarchy) {
        hierarchy.inheritsFrom.push(otherRole.name);
      }
    });

    hierarchyMap.set(role.name, hierarchy);
  });

  return hierarchyMap;
}

// ============================================================================
// Provider Props
// ============================================================================

export interface RoleProviderProps {
  children: ReactNode;
  /** Initial roles from loader */
  initialRoles?: Role[];
  /** User ID to load roles for */
  userId?: string;
}

// ============================================================================
// PROVIDER IMPLEMENTATION
// ============================================================================

export function RoleProvider({
  children,
  initialRoles = [],
  userId,
}: RoleProviderProps) {
  // State
  const [currentRoles, setCurrentRoles] = useState<Role[]>(initialRoles);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable access
  const currentRolesRef = useRef<Role[]>(currentRoles);
  const userIdRef = useRef<string | undefined>(userId);

  // Update refs when values change
  useEffect(() => {
    currentRolesRef.current = currentRoles;
  }, [currentRoles]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Memoized hierarchy map
  const hierarchy = useMemo<Map<SystemRole, RoleHierarchy>>(() => {
    const allRoles = availableRoles.length > 0 ? availableRoles : currentRoles;
    return buildHierarchyMap(allRoles);
  }, [availableRoles, currentRoles]);

  // Memoized role name set for O(1) lookups
  const currentRoleNames = useMemo<Set<SystemRole>>(() => {
    return new Set(currentRoles.map((r) => r.name));
  }, [currentRoles]);

  // ============================================================================
  // Actions
  // ============================================================================

  const hasRole = useCallback(
    (role: SystemRole): boolean => {
      return currentRoleNames.has(role);
    },
    [currentRoleNames]
  );

  const hasAnyRole = useCallback(
    (roles: SystemRole[]): boolean => {
      return roles.some((role) => currentRoleNames.has(role));
    },
    [currentRoleNames]
  );

  const hasAllRoles = useCallback(
    (roles: SystemRole[]): boolean => {
      return roles.every((role) => currentRoleNames.has(role));
    },
    [currentRoleNames]
  );

  const hasRoleOrHigher = useCallback(
    (role: SystemRole): boolean => {
      const targetHierarchy = DEFAULT_HIERARCHY[role];
      if (targetHierarchy === undefined) return false;

      // Check if user has any role with equal or lower hierarchy number (higher privilege)
      return currentRolesRef.current.some(
        (userRole) =>
          DEFAULT_HIERARCHY[userRole.name] !== undefined &&
          DEFAULT_HIERARCHY[userRole.name] <= targetHierarchy
      );
    },
    []
  );

  const getAllPermissions = useCallback((): string[] => {
    const allPerms = new Set<string>();

    currentRolesRef.current.forEach((role) => {
      role.permissions.forEach((perm) => allPerms.add(perm));

      // Include permissions from inherited roles
      const roleHierarchy = hierarchy.get(role.name);
      if (roleHierarchy) {
        roleHierarchy.inheritsFrom.forEach((inheritedRoleName) => {
          const inheritedRole = availableRoles.find(
            (r) => r.name === inheritedRoleName
          );
          if (inheritedRole) {
            inheritedRole.permissions.forEach((perm) => allPerms.add(perm));
          }
        });
      }
    });

    return Array.from(allPerms);
  }, [hierarchy, availableRoles]);

  const assignRole = useCallback(
    async (targetUserId: string, role: SystemRole): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.post(`/users/${targetUserId}/roles`, {
          role,
        });

        // Refresh roles if this is for the current user
        if (targetUserId === userIdRef.current) {
          const response = await apiClient.get<{ roles: Role[] }>(
            `/users/${targetUserId}/roles`
          );

          startTransition(() => {
            setCurrentRoles(response.roles);
          });
        }

        logRoleEvent({
          type: 'role_assigned',
          timestamp: new Date(),
          userId: targetUserId,
          roleName: role,
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to assign role';
        setError(errorMsg);
        console.error('[RoleProvider] Failed to assign role:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeRole = useCallback(
    async (targetUserId: string, role: SystemRole): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.delete(`/users/${targetUserId}/roles/${role}`);

        // Refresh roles if this is for the current user
        if (targetUserId === userIdRef.current) {
          const response = await apiClient.get<{ roles: Role[] }>(
            `/users/${targetUserId}/roles`
          );

          startTransition(() => {
            setCurrentRoles(response.roles);
          });
        }

        logRoleEvent({
          type: 'role_removed',
          timestamp: new Date(),
          userId: targetUserId,
          roleName: role,
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to remove role';
        setError(errorMsg);
        console.error('[RoleProvider] Failed to remove role:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async (): Promise<void> => {
    if (!userIdRef.current) {
      console.warn('[RoleProvider] Cannot refresh roles without userId');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch current user's roles
      const rolesResponse = await apiClient.get<{ roles: Role[] }>(
        `/users/${userIdRef.current}/roles`
      );

      // Fetch all available roles (optional if API not enabled)
      const availableResponse = ROLE_API_ENABLED
        ? await apiClient.get<{ roles: Role[] }>('/roles')
        : { roles: DEFAULT_AVAILABLE_ROLES };

      startTransition(() => {
        setCurrentRoles(rolesResponse.roles);
        setAvailableRoles(availableResponse.roles);
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to refresh roles';
      setError(errorMsg);
      console.error('[RoleProvider] Failed to refresh roles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load available roles on mount
  useEffect(() => {
    let mounted = true;

    const loadAvailableRoles = async () => {
      try {
        const response = ROLE_API_ENABLED
          ? await apiClient.get<{ roles: Role[] }>('/roles')
          : { roles: DEFAULT_AVAILABLE_ROLES };

        if (mounted) {
          startTransition(() => {
            setAvailableRoles(response.roles);
          });
        }
      } catch (error) {
        console.error('[RoleProvider] Failed to load available roles', error);
        if (mounted) {
          setAvailableRoles(DEFAULT_AVAILABLE_ROLES);
        }
      }
    };

    loadAvailableRoles();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================================
  // Context Values
  // ============================================================================

  // Memoized state value (BP7: Stable references)
  const stateValue = useMemo<RoleStateValue>(
    () => ({
      currentRoles,
      availableRoles,
      isLoading,
      error,
      hierarchy,
    }),
    [currentRoles, availableRoles, isLoading, error, hierarchy]
  );

  // Memoized actions value (BP7: Stable references)
  const actionsValue = useMemo<RoleActionsValue>(
    () => ({
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasRoleOrHigher,
      getAllPermissions,
      assignRole,
      removeRole,
      refresh,
      clearError,
    }),
    [
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasRoleOrHigher,
      getAllPermissions,
      assignRole,
      removeRole,
      refresh,
      clearError,
    ]
  );

  return (
    <RoleStateContext.Provider value={stateValue}>
      <RoleActionsContext.Provider value={actionsValue}>
        {children}
      </RoleActionsContext.Provider>
    </RoleStateContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Access role state (current roles, available roles, loading status)
 * Use this for read-only state access in components
 */
export function useRoleState(): RoleStateValue {
  const context = useContext(RoleStateContext);

  if (!context) {
    throw new Error('useRoleState must be used within RoleProvider');
  }

  return context;
}

/**
 * Access role actions (role checks, assignment, hierarchy checks)
 * Use this for role operations and permission aggregation
 */
export function useRoleActions(): RoleActionsValue {
  const context = useContext(RoleActionsContext);

  if (!context) {
    throw new Error('useRoleActions must be used within RoleProvider');
  }

  return context;
}

/**
 * Convenience hook to access both state and actions
 * @deprecated Prefer using useRoleState and useRoleActions separately for better performance
 */
export function useRole() {
  return {
    ...useRoleState(),
    ...useRoleActions(),
  };
}

// Re-export types for consumers
export type { Role, RoleHierarchy, SystemRole } from '@/lib/role/types';
