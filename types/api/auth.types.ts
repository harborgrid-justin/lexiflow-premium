/**
 * Authentication & Authorization API Types
 */

import type { ID } from './common';

// User role
export type UserRole = 'admin' | 'attorney' | 'paralegal' | 'legal_assistant' | 'client' | 'guest';

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Login response
export interface LoginResponse {
  success: true;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
  organizationId?: ID;
}

// Register response
export interface RegisterResponse {
  success: true;
  message: string;
  userId: ID;
  requiresVerification: boolean;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Refresh token response
export interface RefreshTokenResponse {
  success: true;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

// Authenticated user
export interface AuthUser {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId?: ID;
  organizationName?: string;
  department?: string;
  permissions: string[];
  isTwoFactorEnabled: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

// Two-factor setup response
export interface TwoFactorSetupResponse {
  success: true;
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

// Two-factor verify request
export interface TwoFactorVerifyRequest {
  token: string;
  code: string;
}

// OAuth callback request
export interface OAuthCallbackRequest {
  code: string;
  state?: string;
  provider: 'google' | 'microsoft' | 'apple';
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Reset password request
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Forgot password request
export interface ForgotPasswordRequest {
  email: string;
}

// Verify email request
export interface VerifyEmailRequest {
  token: string;
}

// Session info
export interface SessionInfo {
  id: ID;
  userId: ID;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  isCurrent: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

// Password strength
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: string[];
  warning?: string;
  isValid: boolean;
}

// API key
export interface ApiKey {
  id: ID;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

// Create API key request
export interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expiresAt?: Date;
}

// Permission
export interface Permission {
  id: ID;
  name: string;
  description?: string;
  resource: string;
  action: string;
  category: string;
}

// Role
export interface Role {
  id: ID;
  name: UserRole;
  displayName: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  userCount: number;
}
