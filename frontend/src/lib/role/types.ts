/**
 * Role Type Definitions
 *
 * Shared types for role-based access control system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module lib/role/types
 */

/**
 * System roles with hierarchical privileges
 */
export type SystemRole =
  | "admin"
  | "attorney"
  | "paralegal"
  | "staff"
  | "Administrator"
  | "Senior Partner"
  | "Partner"
  | "Associate"
  | "Paralegal"
  | "Client User"
  | "Guest";

/**
 * Role with metadata
 */
export interface Role {
  id: string;
  name: SystemRole;
  displayName: string;
  description?: string;
  permissions: string[];
  hierarchy: number; // Lower number = higher privilege
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Role assignment to a user
 */
export interface RoleAssignment {
  userId: string;
  roleId: string;
  roleName: SystemRole;
  assignedAt: Date;
  assignedBy?: string;
  expiresAt?: Date;
}

/**
 * Role hierarchy definition
 */
export interface RoleHierarchy {
  role: SystemRole;
  inheritsFrom: SystemRole[];
  level: number;
}

/**
 * State value exposed to consumers
 */
export interface RoleStateValue {
  /** Current user's roles */
  currentRoles: Role[];
  /** All available roles in the system */
  availableRoles: Role[];
  /** Whether roles are being loaded */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Role hierarchy map */
  hierarchy: Map<SystemRole, RoleHierarchy>;
}

/**
 * Actions value exposed to consumers
 */
export interface RoleActionsValue {
  /** Check if user has specific role */
  hasRole: (role: SystemRole) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: SystemRole[]) => boolean;
  /** Check if user has all of the specified roles */
  hasAllRoles: (roles: SystemRole[]) => boolean;
  /** Check if user's role is higher than or equal to specified role */
  hasRoleOrHigher: (role: SystemRole) => boolean;
  /** Get all permissions from user's roles */
  getAllPermissions: () => string[];
  /** Assign role to user */
  assignRole: (userId: string, role: SystemRole) => Promise<void>;
  /** Remove role from user */
  removeRole: (userId: string, role: SystemRole) => Promise<void>;
  /** Refresh roles from server */
  refresh: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Role event for audit logging
 */
export interface RoleEvent {
  type: "role_assigned" | "role_removed" | "role_updated" | "hierarchy_changed";
  timestamp: Date;
  userId?: string;
  roleId?: string;
  roleName?: SystemRole;
  metadata?: Record<string, unknown>;
}
