/**
 * Authentication-related interfaces
 * Shared between frontend and backend
 */

import { UserId } from '../entities/base.entity';
import { UserRole, UserStatus } from '../enums/user.enums';

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
  expiresIn: number;
}

/**
 * Authenticated user information
 */
export interface AuthenticatedUser {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  twoFactorEnabled: boolean;
  emailVerified: boolean;
}

/**
 * JWT token payload
 */
export interface JwtPayload {
  sub: UserId; // User ID
  email: string;
  role: UserRole;
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Two-factor authentication setup response
 */
export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string; // Data URL
  backupCodes: string[];
}

/**
 * Two-factor authentication verification request
 */
export interface TwoFactorVerificationRequest {
  code: string;
  trustDevice?: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Session information
 */
export interface SessionInfo {
  userId: UserId;
  sessionId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}
