/**
 * Permission Context
 * Role-Based Access Control (RBAC) permission checking system
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';

export type Permission = string;
export type Role = string;

export interface PermissionRule {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  inherits?: Role[]; // Roles that this role inherits from
}

export interface PermissionContextType {
  // Permission checking
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;

  // Role checking
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasAllRoles: (roles: Role[]) => boolean;

  // Resource-based permissions
  canPerformAction: (resource: string, action: string, context?: Record<string, any>) => boolean;

  // Permission management
  grantPermission: (permission: Permission) => void;
  revokePermission: (permission: Permission) => void;
  grantRole: (role: Role) => void;
  revokeRole: (role: Role) => void;

  // Get current state
  permissions: Permission[];
  roles: Role[];
  roleDefinitions: RolePermissions[];

  // Admin helpers
  isAdmin: boolean;
  isSuperAdmin: boolean;

  // Feature flags integrated with permissions
  canAccessFeature: (feature: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissionContext = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: ReactNode;
  roleDefinitions?: RolePermissions[];
}

// Default role definitions for LexiFlow Legal Suite
const DEFAULT_ROLE_DEFINITIONS: RolePermissions[] = [
  {
    role: 'super_admin',
    permissions: ['*'], // All permissions
  },
  {
    role: 'admin',
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'cases:*',
      'documents:*',
      'clients:*',
      'billing:*',
      'reports:*',
      'settings:*',
      'organizations:manage',
    ],
  },
  {
    role: 'attorney',
    permissions: [
      'cases:read',
      'cases:create',
      'cases:update',
      'documents:read',
      'documents:create',
      'documents:update',
      'clients:read',
      'clients:create',
      'clients:update',
      'billing:read',
      'billing:create',
      'reports:read',
      'tasks:*',
    ],
    inherits: ['user'],
  },
  {
    role: 'paralegal',
    permissions: [
      'cases:read',
      'cases:update',
      'documents:read',
      'documents:create',
      'documents:update',
      'clients:read',
      'billing:read',
      'tasks:*',
    ],
    inherits: ['user'],
  },
  {
    role: 'staff',
    permissions: [
      'cases:read',
      'documents:read',
      'clients:read',
      'tasks:read',
      'tasks:update',
    ],
    inherits: ['user'],
  },
  {
    role: 'user',
    permissions: [
      'profile:read',
      'profile:update',
      'notifications:read',
    ],
  },
  {
    role: 'client',
    permissions: [
      'cases:read:own',
      'documents:read:own',
      'billing:read:own',
      'profile:read',
      'profile:update',
    ],
  },
];

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  roleDefinitions = DEFAULT_ROLE_DEFINITIONS,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Load permissions and roles from user
  useEffect(() => {
    if (isAuthenticated && user) {
      // Set roles from user
      const userRoles = user.role ? [user.role] : [];
      setRoles(userRoles);

      // Calculate permissions from roles
      const calculatedPermissions = calculatePermissionsFromRoles(
        userRoles,
        roleDefinitions
      );

      // Add user-specific permissions if any
      const userPermissions = user.permissions || [];
      const allPermissions = [...new Set([...calculatedPermissions, ...userPermissions])];

      setPermissions(allPermissions);
    } else {
      setRoles([]);
      setPermissions([]);
    }
  }, [user, isAuthenticated, roleDefinitions]);

  // Calculate permissions from roles with inheritance
  const calculatePermissionsFromRoles = useCallback((
    userRoles: Role[],
    definitions: RolePermissions[]
  ): Permission[] => {
    const allPermissions = new Set<Permission>();
    const processedRoles = new Set<Role>();

    const processRole = (role: Role) => {
      if (processedRoles.has(role)) return;
      processedRoles.add(role);

      const roleDef = definitions.find(def => def.role === role);
      if (!roleDef) return;

      // Add role permissions
      roleDef.permissions.forEach(permission => {
        allPermissions.add(permission);
      });

      // Process inherited roles
      if (roleDef.inherits) {
        roleDef.inherits.forEach(inheritedRole => {
          processRole(inheritedRole);
        });
      }
    };

    userRoles.forEach(role => processRole(role));
    return Array.from(allPermissions);
  }, []);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!isAuthenticated) return false;

    // Super admin wildcard
    if (permissions.includes('*')) return true;

    // Exact match
    if (permissions.includes(permission)) return true;

    // Wildcard matching (e.g., "cases:*" matches "cases:read")
    const [resource, action] = permission.split(':');
    return permissions.some(p => {
      if (p.endsWith(':*')) {
        const [pResource] = p.split(':');
        return pResource === resource;
      }
      return false;
    });
  }, [permissions, isAuthenticated]);

  // Check if user has all permissions
  const hasAllPermissions = useCallback((perms: Permission[]): boolean => {
    return perms.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Check if user has any of the permissions
  const hasAnyPermission = useCallback((perms: Permission[]): boolean => {
    return perms.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // Check if user has a specific role
  const hasRole = useCallback((role: Role): boolean => {
    return roles.includes(role);
  }, [roles]);

  // Check if user has any of the roles
  const hasAnyRole = useCallback((checkRoles: Role[]): boolean => {
    return checkRoles.some(role => hasRole(role));
  }, [hasRole]);

  // Check if user has all roles
  const hasAllRoles = useCallback((checkRoles: Role[]): boolean => {
    return checkRoles.every(role => hasRole(role));
  }, [hasRole]);

  // Check if user can perform action on resource
  const canPerformAction = useCallback((
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean => {
    const permission = `${resource}:${action}`;
    const basePermission = hasPermission(permission);

    // If no context, return base permission
    if (!context) return basePermission;

    // Check context-specific permissions (e.g., "cases:read:own")
    if (context.ownership === 'own' && user) {
      const ownPermission = `${resource}:${action}:own`;
      if (hasPermission(ownPermission)) {
        // Verify ownership
        return context.ownerId === user.id;
      }
    }

    return basePermission;
  }, [hasPermission, user]);

  // Grant permission
  const grantPermission = useCallback((permission: Permission) => {
    setPermissions(prev => {
      if (prev.includes(permission)) return prev;
      return [...prev, permission];
    });
  }, []);

  // Revoke permission
  const revokePermission = useCallback((permission: Permission) => {
    setPermissions(prev => prev.filter(p => p !== permission));
  }, []);

  // Grant role
  const grantRole = useCallback((role: Role) => {
    setRoles(prev => {
      if (prev.includes(role)) return prev;
      const newRoles = [...prev, role];

      // Recalculate permissions
      const calculatedPermissions = calculatePermissionsFromRoles(
        newRoles,
        roleDefinitions
      );
      setPermissions(calculatedPermissions);

      return newRoles;
    });
  }, [calculatePermissionsFromRoles, roleDefinitions]);

  // Revoke role
  const revokeRole = useCallback((role: Role) => {
    setRoles(prev => {
      const newRoles = prev.filter(r => r !== role);

      // Recalculate permissions
      const calculatedPermissions = calculatePermissionsFromRoles(
        newRoles,
        roleDefinitions
      );
      setPermissions(calculatedPermissions);

      return newRoles;
    });
  }, [calculatePermissionsFromRoles, roleDefinitions]);

  // Admin helpers
  const isAdmin = useMemo(() => {
    return hasRole('admin') || hasRole('super_admin');
  }, [hasRole]);

  const isSuperAdmin = useMemo(() => {
    return hasRole('super_admin');
  }, [hasRole]);

  // Feature access (can be extended with feature flags)
  const canAccessFeature = useCallback((feature: string): boolean => {
    // Map features to required permissions
    const featurePermissions: Record<string, Permission[]> = {
      'advanced_search': ['search:advanced'],
      'ai_document_analysis': ['documents:ai_analysis'],
      'custom_reports': ['reports:custom'],
      'api_access': ['api:access'],
      'bulk_operations': ['bulk:operations'],
      'audit_logs': ['audit:read'],
      'integrations': ['integrations:manage'],
    };

    const requiredPermissions = featurePermissions[feature];
    if (!requiredPermissions) return true; // No restrictions for unknown features

    return hasAnyPermission(requiredPermissions);
  }, [hasAnyPermission]);

  const value = useMemo<PermissionContextType>(() => ({
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canPerformAction,
    grantPermission,
    revokePermission,
    grantRole,
    revokeRole,
    permissions,
    roles,
    roleDefinitions,
    isAdmin,
    isSuperAdmin,
    canAccessFeature,
  }), [
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canPerformAction,
    grantPermission,
    revokePermission,
    grantRole,
    revokeRole,
    permissions,
    roles,
    roleDefinitions,
    isAdmin,
    isSuperAdmin,
    canAccessFeature,
  ]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
