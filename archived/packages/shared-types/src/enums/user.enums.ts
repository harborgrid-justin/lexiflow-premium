/**
 * User-related enums
 * Shared between frontend and backend
 */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SENIOR_PARTNER = 'senior_partner',
  PARTNER = 'partner',
  ATTORNEY = 'attorney',
  ASSOCIATE = 'associate',
  PARALEGAL = 'paralegal',
  LEGAL_SECRETARY = 'legal_secretary',
  STAFF = 'staff',
  CLIENT = 'client',
  CLIENT_USER = 'client_user',
  GUEST = 'guest',
  ADMINISTRATOR = 'administrator',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

/**
 * Legacy user role type for backwards compatibility
 */
export type UserRoleType = 'Senior Partner' | 'Associate' | 'Paralegal' | 'Administrator' | 'Client User' | 'Guest';
