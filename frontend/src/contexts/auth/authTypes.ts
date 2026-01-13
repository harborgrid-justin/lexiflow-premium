/**
 * Authentication Type Definitions
 *
 * Shared types for authentication system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module providers/authTypes
 */

/**
 * Represents an authenticated user
 */
export type AuthRole =
  | 'admin'
  | 'attorney'
  | 'paralegal'
  | 'staff'
  | 'Administrator'
  | 'Senior Partner'
  | 'Partner'
  | 'Associate'
  | 'Paralegal'
  | 'Client User'
  | 'Guest';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  avatarUrl?: string;
  permissions: string[];
  mfaEnabled?: boolean;
  accountLocked?: boolean;
  passwordExpiresAt?: Date;
  lastLoginAt?: Date;
  failedLoginAttempts?: number;
  organizationId?: string;
  orgId?: string;
  organizationName?: string;
  department?: string;
  title?: string;
  phone?: string;
}

/**
 * Session information
 */
export interface SessionInfo {
  expiresAt: Date;
  lastActivityAt: Date;
  warningShown: boolean;
}

/**
 * MFA Setup data
 */
export interface MFASetup {
  qrCode: string;
  secret: string;
  backupCodes?: string[];
}

/**
 * Password policy requirements
 */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays?: number;
  preventReuse?: number;
}

export interface AuthLoginResult {
  success: boolean;
  mfaRequired?: boolean;
}

/**
 * Authentication event for audit logging
 */
export interface AuthEvent {
  type: 'login' | 'logout' | 'mfa_enabled' | 'mfa_disabled' | 'password_changed' | 'token_refresh' | 'session_expired' | 'access_denied';
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * SSO Provider configuration
 */
export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc';
  enabled: boolean;
  loginUrl: string;
  logoUrl?: string;
}

/**
 * Authentication state exposed to consumers
 */
export interface AuthStateValue {
  /** Current authenticated user, null if not authenticated */
  user: AuthUser | null;
  /** Whether authentication is being checked */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Authentication error message */
  error: string | null;
  /** Current session information */
  session: SessionInfo | null;
  /** MFA verification required */
  requiresMFA: boolean;
  /** Password policy */
  passwordPolicy: PasswordPolicy;
}

/**
 * Authentication actions exposed to consumers
 */
export interface AuthActionsValue {
  /** Login with credentials */
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    mfaCode?: string
  ) => Promise<AuthLoginResult>;
  /** Verify MFA code during login */
  verifyMFA: (code: string) => Promise<boolean>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Refresh authentication token */
  refreshToken: () => Promise<boolean>;
  /** Check if user has specific permission */
  hasPermission: (permission: string) => boolean;
  /** Check if user has any of the specified roles */
  hasRole: (...roles: AuthUser["role"][]) => boolean;
  /** Enable MFA for current user */
  enableMFA: () => Promise<MFASetup>;
  /** Disable MFA for current user */
  disableMFA: () => Promise<void>;
  /** Change password */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Initiate SSO login */
  loginWithSSO: (providerId: string) => Promise<void>;
  /** Log authentication event */
  logAuthEvent: (event: AuthEvent) => void;
  /** Extend current session */
  extendSession: () => Promise<void>;
  /** Clear the current auth error state */
  clearError: () => void;
}