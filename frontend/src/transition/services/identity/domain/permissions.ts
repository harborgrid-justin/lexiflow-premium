/**
 * Permission definitions
 */

export type Permission =
  | "read"
  | "write"
  | "delete"
  | "admin"
  | "billing:read"
  | "billing:write"
  | "reporting:read"
  | "reporting:export"
  | "users:manage";

export const PERMISSIONS: Record<string, Permission> = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  ADMIN: "admin",
  BILLING_READ: "billing:read",
  BILLING_WRITE: "billing:write",
  REPORTING_READ: "reporting:read",
  REPORTING_EXPORT: "reporting:export",
  USERS_MANAGE: "users:manage",
};

export function hasPermission(
  userPermissions: Permission[],
  required: Permission
): boolean {
  return (
    userPermissions.includes(required) || userPermissions.includes("admin")
  );
}

export function hasAnyPermission(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  if (userPermissions.includes("admin")) return true;
  return required.some((perm) => userPermissions.includes(perm));
}

export function hasAllPermissions(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  if (userPermissions.includes("admin")) return true;
  return required.every((perm) => userPermissions.includes(perm));
}
