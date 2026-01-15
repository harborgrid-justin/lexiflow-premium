/**
 * Permission Utilities
 *
 * Utilities for checking user permissions and roles
 * Provides enterprise-grade access control functions
 */

import type { AuthUser } from "@/lib/auth/types";

/**
 * Permission resource types
 */
export type PermissionResource =
  | "cases"
  | "documents"
  | "billing"
  | "users"
  | "organizations"
  | "settings"
  | "reports"
  | "analytics"
  | "discovery"
  | "pleadings"
  | "calendar"
  | "trust_accounts"
  | "compliance"
  | "audit_logs"
  | "*"; // Wildcard for all resources

/**
 * Permission actions
 */
export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "execute"
  | "*";

/**
 * Permission string format: resource:action
 * Examples:
 * - "cases:read"
 * - "documents:create"
 * - "billing:*"
 * - "*:*" (superadmin)
 */
export type Permission = `${PermissionResource}:${PermissionAction}`;

/**
 * User roles in the system
 */
export const USER_ROLES = {
  ADMIN: "Administrator",
  SENIOR_PARTNER: "Senior Partner",
  PARTNER: "Partner",
  ASSOCIATE: "Associate",
  PARALEGAL: "Paralegal",
  CLIENT: "Client User",
  GUEST: "Guest",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Role hierarchy (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<string, number> = {
  [USER_ROLES.ADMIN]: 100,
  [USER_ROLES.SENIOR_PARTNER]: 80,
  [USER_ROLES.PARTNER]: 70,
  [USER_ROLES.ASSOCIATE]: 50,
  [USER_ROLES.PARALEGAL]: 30,
  [USER_ROLES.CLIENT]: 20,
  [USER_ROLES.GUEST]: 10,
};

/**
 * Default permissions by role
 */
const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [USER_ROLES.ADMIN]: ["*:*"],
  [USER_ROLES.SENIOR_PARTNER]: [
    "cases:*",
    "documents:*",
    "billing:*",
    "users:read",
    "reports:*",
    "analytics:*",
    "discovery:*",
    "pleadings:*",
    "calendar:*",
    "trust_accounts:*",
    "compliance:*",
  ],
  [USER_ROLES.PARTNER]: [
    "cases:*",
    "documents:*",
    "billing:read",
    "reports:read",
    "analytics:read",
    "discovery:*",
    "pleadings:*",
    "calendar:*",
  ],
  [USER_ROLES.ASSOCIATE]: [
    "cases:read",
    "cases:update",
    "documents:*",
    "billing:read",
    "discovery:read",
    "pleadings:read",
    "calendar:*",
  ],
  [USER_ROLES.PARALEGAL]: [
    "cases:read",
    "documents:read",
    "documents:create",
    "discovery:read",
    "pleadings:read",
    "calendar:read",
  ],
  [USER_ROLES.CLIENT]: ["cases:read", "documents:read", "billing:read"],
  [USER_ROLES.GUEST]: ["cases:read", "documents:read"],
};

/**
 * Parse permission string
 */
function parsePermission(permission: string): {
  resource: string;
  action: string;
} {
  const [resource, action] = permission.split(":");
  return { resource: resource || "*", action: action || "*" };
}

/**
 * Check if a permission matches a required permission
 */
function matchesPermission(
  userPermission: string,
  requiredPermission: string
): boolean {
  const userPerm = parsePermission(userPermission);
  const reqPerm = parsePermission(requiredPermission);

  // Wildcard resource matches everything
  if (userPerm.resource === "*") return true;

  // Exact resource match or wildcard
  if (userPerm.resource !== reqPerm.resource && reqPerm.resource !== "*") {
    return false;
  }

  // Wildcard action matches everything
  if (userPerm.action === "*") return true;

  // Exact action match
  return userPerm.action === reqPerm.action || reqPerm.action === "*";
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: AuthUser | null,
  permission: Permission
): boolean {
  if (!user) return false;

  // Admin wildcard
  if (user.permissions?.includes("*:*")) return true;

  // Check explicit permissions
  const hasExplicit = user.permissions?.some((p) =>
    matchesPermission(p, permission)
  );
  if (hasExplicit) return true;

  // Check role-based permissions
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.some((p) => matchesPermission(p, permission));
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: AuthUser | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.some((p) => hasPermission(user, p));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: AuthUser | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

/**
 * Check if user has a role at or above a certain level
 */
export function hasRoleLevel(
  user: AuthUser | null,
  minimumRole: UserRole
): boolean {
  if (!user) return false;

  const userLevel = ROLE_HIERARCHY[user.role] || 0;
  const minimumLevel = ROLE_HIERARCHY[minimumRole] || 0;

  return userLevel >= minimumLevel;
}

/**
 * Check if user belongs to a specific organization
 */
export function belongsToOrganization(
  user: AuthUser | null,
  organizationId: string
): boolean {
  if (!user) return false;
  return user.organizationId === organizationId;
}

/**
 * Check if user can access a resource
 * Combines permission and organization checks
 */
export function canAccessResource(
  user: AuthUser | null,
  permission: Permission,
  resourceOrgId?: string
): boolean {
  if (!user) return false;

  // Check permission
  if (!hasPermission(user, permission)) return false;

  // If resource has organization ID, check if user belongs to it
  if (resourceOrgId && !belongsToOrganization(user, resourceOrgId)) {
    return false;
  }

  return true;
}

/**
 * Get all permissions for a user (explicit + role-based)
 */
export function getUserPermissions(user: AuthUser | null): Permission[] {
  if (!user) return [];

  const explicitPermissions = user.permissions || [];
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];

  // Combine and deduplicate
  return Array.from(
    new Set([...explicitPermissions, ...rolePermissions])
  ) as Permission[];
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, USER_ROLES.ADMIN) || hasPermission(user, "*:*");
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(user: AuthUser | null): boolean {
  return (
    isAdmin(user) ||
    hasPermission(user, "users:*") ||
    hasAllPermissions(user, ["users:create", "users:update", "users:delete"])
  );
}

/**
 * Check if user can manage billing
 */
export function canManageBilling(user: AuthUser | null): boolean {
  return (
    isAdmin(user) ||
    hasPermission(user, "billing:*") ||
    hasRoleLevel(user, USER_ROLES.SENIOR_PARTNER)
  );
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(user: AuthUser | null): boolean {
  return (
    isAdmin(user) ||
    hasPermission(user, "analytics:read") ||
    hasRoleLevel(user, USER_ROLES.PARTNER)
  );
}

/**
 * Check if user can manage organization settings
 */
export function canManageOrganization(user: AuthUser | null): boolean {
  return (
    isAdmin(user) ||
    hasPermission(user, "organizations:*") ||
    hasPermission(user, "settings:*")
  );
}
