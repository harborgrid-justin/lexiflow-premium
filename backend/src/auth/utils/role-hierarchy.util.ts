import { Role } from '../../common/enums/role.enum';

// Define role hierarchy: higher number = higher privilege
const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 900,
  [Role.SENIOR_PARTNER]: 800,
  [Role.PARTNER]: 700,
  [Role.ASSOCIATE]: 600,
  [Role.PARALEGAL]: 500,
  [Role.LEGAL_SECRETARY]: 400,
  [Role.ADMINISTRATOR]: 300,
  [Role.CLIENT_USER]: 200,
  [Role.GUEST]: 100,
};

/**
 * Check if a user's role has sufficient privilege to access a resource
 * @param userRole The role of the user
 * @param requiredRole The minimum required role
 * @returns true if user has sufficient privilege
 */
export function hasRolePrivilege(userRole: Role, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if a user's role has any of the required roles (including higher privileges)
 * @param userRole The role of the user
 * @param requiredRoles Array of acceptable roles
 * @returns true if user has any of the required roles or higher privilege
 */
export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.some((requiredRole) =>
    hasRolePrivilege(userRole, requiredRole),
  );
}

/**
 * Get all roles that are lower or equal to the given role
 * @param role The role to compare against
 * @returns Array of roles with lower or equal privilege
 */
export function getLowerOrEqualRoles(role: Role): Role[] {
  const roleLevel = ROLE_HIERARCHY[role] || 0;
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= roleLevel)
    .map(([roleName]) => roleName as Role);
}

/**
 * Get the role hierarchy level
 * @param role The role to get the level for
 * @returns The hierarchy level number
 */
export function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY[role] || 0;
}
