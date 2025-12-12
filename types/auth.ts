/**
 * Authentication Type Definitions
 * Comprehensive types for authentication and authorization
 */

/**
 * User object
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  permissions?: string[];
  organizationId?: string;
  organizationName?: string;
  avatar?: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User roles
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  FIRM_ADMIN = 'FIRM_ADMIN',
  SENIOR_PARTNER = 'SENIOR_PARTNER',
  PARTNER = 'PARTNER',
  SENIOR_ASSOCIATE = 'SENIOR_ASSOCIATE',
  ASSOCIATE = 'ASSOCIATE',
  PARALEGAL = 'PARALEGAL',
  CLIENT_ADMIN = 'CLIENT_ADMIN',
  CLIENT_USER = 'CLIENT_USER',
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  requiresMfa?: boolean;
  mfaToken?: string;
  expiresIn?: number;
}

/**
 * Register request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  inviteToken?: string;
  acceptTerms: boolean;
}

/**
 * Register response
 */
export interface RegisterResponse {
  user: User;
  message: string;
  requiresEmailVerification?: boolean;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * Two-factor setup response
 */
export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes?: string[];
}

/**
 * Two-factor verify request
 */
export interface TwoFactorVerifyRequest {
  token: string;
  code: string;
}

/**
 * OAuth callback request
 */
export interface OAuthCallbackRequest {
  provider: string;
  code: string;
  state?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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
export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

/**
 * Session info
 */
export interface SessionInfo {
  id: string;
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * Auth state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  error: string | null;
}

/**
 * Auth context value
 */
export interface AuthContextValue extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: string[];
}

/**
 * OAuth provider
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  GITHUB = 'github',
}

/**
 * OAuth state
 */
export interface OAuthState {
  provider: OAuthProvider;
  redirectUrl: string;
  timestamp: number;
  nonce: string;
}

/**
 * Account lock info
 */
export interface AccountLockInfo {
  isLocked: boolean;
  lockedAt?: string;
  lockedUntil?: string;
  reason?: 'multiple_failed_attempts' | 'suspicious_activity' | 'admin_locked' | 'policy_violation';
  failedAttempts?: number;
  maxAttempts?: number;
}

/**
 * Email verification
 */
export interface EmailVerification {
  email: string;
  token: string;
  expiresAt: string;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  mfaEnabled: boolean;
  mfaMethod?: 'totp' | 'sms' | 'email';
  passwordLastChanged?: string;
  sessionTimeout?: number;
  allowedIpAddresses?: string[];
  trustedDevices?: TrustedDevice[];
}

/**
 * Trusted device
 */
export interface TrustedDevice {
  id: string;
  deviceId: string;
  name: string;
  lastUsed: string;
  addedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Auth event types
 */
export enum AuthEventType {
  LOGIN = 'auth:login',
  LOGOUT = 'auth:logout',
  SESSION_EXPIRED = 'auth:sessionExpired',
  TOKEN_REFRESHED = 'auth:tokenRefreshed',
  FORBIDDEN = 'auth:forbidden',
  MFA_REQUIRED = 'auth:mfaRequired',
  EMAIL_VERIFIED = 'auth:emailVerified',
}

/**
 * Auth event
 */
export interface AuthEvent {
  type: AuthEventType;
  timestamp: number;
  data?: any;
}
