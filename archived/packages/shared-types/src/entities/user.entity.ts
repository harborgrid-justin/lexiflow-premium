import { UserId } from './base.entity';
import { UserRole, UserStatus } from '../enums/user.enums';
import { UserPreferences } from '../common/json-value.types';

/**
 * User entity interface
 * Shared between frontend and backend
 * Note: Backend has passwordHash which is never sent to frontend
 */
export interface User {
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
  lastLoginAt?: string; // ISO timestamp
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User profile for display (subset of User)
 */
export interface UserProfile {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  title?: string;
  avatarUrl?: string;
}

/**
 * User summary for lists and assignments
 */
export interface UserSummary {
  id: UserId;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
