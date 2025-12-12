/**
 * Permission Service
 * Handles role-based and permission-based access control
 */

import { UserSession, sessionService } from './sessionService';

/**
 * Role hierarchy (higher level includes all lower level permissions)
 */
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  SYSTEM_ADMIN: 90,
  FIRM_ADMIN: 80,
  SENIOR_PARTNER: 70,
  PARTNER: 60,
  SENIOR_ASSOCIATE: 50,
  ASSOCIATE: 40,
  PARALEGAL: 30,
  CLIENT_ADMIN: 20,
  CLIENT_USER: 10,
};

/**
 * Role-based permissions mapping
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'], // All permissions
  SYSTEM_ADMIN: [
    'users:*',
    'settings:*',
    'audit:*',
    'billing:*',
    'cases:*',
    'documents:*',
  ],
  FIRM_ADMIN: [
    'users:read',
    'users:create',
    'users:update',
    'settings:read',
    'settings:update',
    'cases:*',
    'documents:*',
    'billing:*',
  ],
  SENIOR_PARTNER: [
    'cases:*',
    'documents:*',
    'clients:*',
    'billing:read',
    'billing:create',
    'users:read',
  ],
  PARTNER: [
    'cases:read',
    'cases:create',
    'cases:update',
    'documents:*',
    'clients:read',
    'clients:create',
    'billing:read',
  ],
  SENIOR_ASSOCIATE: [
    'cases:read',
    'cases:update',
    'documents:read',
    'documents:create',
    'documents:update',
    'clients:read',
  ],
  ASSOCIATE: [
    'cases:read',
    'documents:read',
    'documents:create',
    'clients:read',
  ],
  PARALEGAL: [
    'cases:read',
    'documents:read',
    'documents:create',
    'clients:read',
  ],
  CLIENT_ADMIN: [
    'cases:read',
    'documents:read',
    'billing:read',
    'users:read',
  ],
  CLIENT_USER: ['cases:read', 'documents:read', 'billing:read'],
};

class PermissionService {
  /**
   * Check if user has a specific role
   */
  hasRole(user: UserSession | null, role: string): boolean {
    if (!user) return false;
    return user.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(user: UserSession | null, roles: string[]): boolean {
    if (!user || !roles.length) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(user: UserSession | null, roles: string[]): boolean {
    if (!user || !roles.length) return false;
    return roles.every((role) => user.role === role);
  }

  /**
   * Check if user's role is at least the specified level
   */
  hasRoleLevel(user: UserSession | null, minimumRole: string): boolean {
    if (!user) return false;

    const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
    const minimumRoleLevel = ROLE_HIERARCHY[minimumRole] || 0;

    return userRoleLevel >= minimumRoleLevel;
  }

  /**
   * Get role level for a specific role
   */
  getRoleLevel(role: string): number {
    return ROLE_HIERARCHY[role] || 0;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(user: UserSession | null, permission: string): boolean {
    if (!user) return false;

    // Super admin has all permissions
    if (user.role === 'SUPER_ADMIN') return true;

    // Check explicit user permissions
    if (user.permissions?.includes(permission)) return true;
    if (user.permissions?.includes('*')) return true;

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];

    // Check for wildcard permission
    if (rolePermissions.includes('*')) return true;

    // Check for exact permission match
    if (rolePermissions.includes(permission)) return true;

    // Check for wildcard resource permissions (e.g., "cases:*" matches "cases:read")
    const [resource] = permission.split(':');
    if (rolePermissions.includes(`${resource}:*`)) return true;

    return false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(user: UserSession | null, permissions: string[]): boolean {
    if (!user || !permissions.length) return false;
    return permissions.some((permission) => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(user: UserSession | null, permissions: string[]): boolean {
    if (!user || !permissions.length) return false;
    return permissions.every((permission) => this.hasPermission(user, permission));
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(user: UserSession | null): string[] {
    if (!user) return [];

    // Get role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];

    // Combine with explicit user permissions
    const userPermissions = user.permissions || [];

    // Remove duplicates
    return Array.from(new Set([...rolePermissions, ...userPermissions]));
  }

  /**
   * Check if user can access a resource
   */
  canAccess(
    user: UserSession | null,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ): boolean {
    const permission = `${resource}:${action}`;
    return this.hasPermission(user, permission);
  }

  /**
   * Check if user can manage (full CRUD) a resource
   */
  canManage(user: UserSession | null, resource: string): boolean {
    return this.hasPermission(user, `${resource}:*`);
  }

  /**
   * Get accessible resources for a user
   */
  getAccessibleResources(user: UserSession | null): string[] {
    if (!user) return [];

    const permissions = this.getUserPermissions(user);
    const resources = new Set<string>();

    permissions.forEach((permission) => {
      const [resource] = permission.split(':');
      resources.add(resource);
    });

    return Array.from(resources);
  }

  /**
   * Check if user is admin (any admin role)
   */
  isAdmin(user: UserSession | null): boolean {
    if (!user) return false;
    return user.role.includes('ADMIN');
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(user: UserSession | null): boolean {
    return this.hasRole(user, 'SUPER_ADMIN');
  }

  /**
   * Check if user is a lawyer (partner, associate, etc.)
   */
  isLawyer(user: UserSession | null): boolean {
    if (!user) return false;
    return [
      'SENIOR_PARTNER',
      'PARTNER',
      'SENIOR_ASSOCIATE',
      'ASSOCIATE',
    ].includes(user.role);
  }

  /**
   * Check if user is a client
   */
  isClient(user: UserSession | null): boolean {
    if (!user) return false;
    return user.role.includes('CLIENT');
  }

  /**
   * Validate permission format
   */
  isValidPermission(permission: string): boolean {
    return /^[a-z]+:[a-z*]+$/i.test(permission);
  }

  /**
   * Get permission info
   */
  getPermissionInfo(permission: string): {
    resource: string;
    action: string;
    isWildcard: boolean;
  } | null {
    if (!this.isValidPermission(permission)) return null;

    const [resource, action] = permission.split(':');
    return {
      resource,
      action,
      isWildcard: action === '*',
    };
  }

  /**
   * Convenience methods that get current user from session
   */

  /**
   * Get current user from session
   */
  private getCurrentUser(): UserSession | null {
    return sessionService.getSession();
  }

  /**
   * Check if current user has permission (convenience method)
   */
  checkPermission(permission: string): boolean {
    return this.hasPermission(this.getCurrentUser(), permission);
  }

  /**
   * Check if current user has any of the permissions (convenience method)
   */
  checkAnyPermission(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    return this.hasAnyPermission(user, permissions);
  }

  /**
   * Check if current user has all permissions (convenience method)
   */
  checkAllPermissions(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    return this.hasAllPermissions(user, permissions);
  }

  /**
   * Check if current user has role (convenience method)
   */
  checkRole(role: string): boolean {
    return this.hasRole(this.getCurrentUser(), role);
  }

  /**
   * Check if current user can access resource (convenience method)
   */
  checkAccess(resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean {
    return this.canAccess(this.getCurrentUser(), resource, action);
  }
}

export const permissionService = new PermissionService();
