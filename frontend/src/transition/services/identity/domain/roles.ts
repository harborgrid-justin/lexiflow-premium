/**
 * Role definitions
 */

export type Role =
  | "admin"
  | "user"
  | "manager"
  | "billing_admin"
  | "analyst"
  | "viewer";

export const ROLES: Record<string, Role> = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
  BILLING_ADMIN: "billing_admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
};

export function hasRole(userRoles: Role[], requiredRole: Role): boolean {
  return userRoles.includes(requiredRole);
}

export function hasAnyRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function hasAllRoles(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.every((role) => userRoles.includes(role));
}
