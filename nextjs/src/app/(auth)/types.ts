/**
 * Authentication Types
 * Comprehensive types for authentication flows
 */

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  organizationId?: string;
  organizationName?: string;
  avatarUrl?: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'attorney'
  | 'paralegal'
  | 'staff'
  | 'guest';

// Session types
export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  issuedAt: string;
  deviceId?: string;
  ipAddress?: string;
}

export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
  location?: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaMethod?: MFAMethod;
  sessionExpiry?: Date;
}

// MFA types
export type MFAMethod = 'totp' | 'sms' | 'email' | 'backup_codes';

export interface MFAChallenge {
  challengeId: string;
  method: MFAMethod;
  expiresAt: string;
  attemptsRemaining: number;
}

export interface MFASetupData {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
}

// SSO types
export type SSOProvider =
  | 'google'
  | 'microsoft'
  | 'okta'
  | 'onelogin'
  | 'auth0'
  | 'azure-ad'
  | 'saml';

export interface SSOConfig {
  provider: SSOProvider;
  name: string;
  displayName: string;
  iconUrl?: string;
  buttonColor?: string;
  enabled: boolean;
}

// Login types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
  deviceId?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  session?: Session;
  mfaRequired?: boolean;
  mfaChallenge?: MFAChallenge;
  error?: string;
  errorCode?: LoginErrorCode;
}

export type LoginErrorCode =
  | 'invalid_credentials'
  | 'account_locked'
  | 'account_disabled'
  | 'email_not_verified'
  | 'mfa_required'
  | 'mfa_invalid'
  | 'rate_limited'
  | 'server_error';

// Registration types
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationName?: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
}

export interface RegisterResult {
  success: boolean;
  user?: User;
  requiresEmailVerification?: boolean;
  error?: string;
  errorCode?: RegisterErrorCode;
}

export type RegisterErrorCode =
  | 'email_exists'
  | 'invalid_email'
  | 'weak_password'
  | 'invalid_data'
  | 'rate_limited'
  | 'server_error';

// Password reset types
export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: ResetPasswordErrorCode;
}

export type ResetPasswordErrorCode =
  | 'invalid_token'
  | 'expired_token'
  | 'weak_password'
  | 'password_mismatch'
  | 'server_error';

// Password strength types
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  percentage: number;
  feedback: string[];
}

// CSRF types
export interface CSRFToken {
  token: string;
  expiresAt: string;
}

// Rate limiting types
export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: string;
}

// Enterprise branding types
export interface EnterpriseBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  footerText?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

// Form state types (for server actions)
export interface AuthFormState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: unknown;
}
