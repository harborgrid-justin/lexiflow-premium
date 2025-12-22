/**
 * User-related DTOs
 * Shared between frontend and backend
 */

import { UserId } from '../entities/base.entity';
import { UserRole, UserStatus } from '../enums/user.enums';
import { UserPreferences } from '../common/json-value.types';

/**
 * Create user request DTO
 */
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string;
  title?: string;
  department?: string;
  barNumber?: string;
  permissions?: string[];
}

/**
 * Update user request DTO
 */
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  title?: string;
  department?: string;
  barNumber?: string;
  permissions?: string[];
  preferences?: UserPreferences;
  avatarUrl?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

/**
 * User filter parameters
 */
export interface UserFilterParams {
  search?: string;
  role?: UserRole | UserRole[];
  status?: UserStatus | UserStatus[];
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * User response DTO (excludes password)
 */
export interface UserResponseDto {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  title?: string;
  department?: string;
  barNumber?: string;
  permissions?: string[];
  preferences?: UserPreferences;
  avatarUrl?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Change password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update user preferences DTO
 */
export interface UpdateUserPreferencesDto {
  preferences: UserPreferences;
}

/**
 * Invite user DTO
 */
export interface InviteUserDto {
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  department?: string;
  sendInviteEmail?: boolean;
}
