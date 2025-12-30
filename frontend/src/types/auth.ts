/**
 * Auth & Security Types
 * Types for authentication, permissions, and security
 */

import type { BaseEntity } from './primitives';

export interface ApiKey extends BaseEntity {
  name: string;
  key: string;
  scopes: string[];
  status: 'active' | 'revoked';
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface Permission extends BaseEntity {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | '*';
  effect: 'allow' | 'deny';
  conditions?: {
    type: string;
    operator: string;
    value: unknown;
  }[];
  metadata?: Record<string, unknown>;
}

export interface RolePermissions {
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface BlacklistedToken extends BaseEntity {
  token: string;
  userId?: string;
  reason: 'logout' | 'expired' | 'security' | 'admin';
  blacklistedAt: string;
  expiresAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * SSO Provider Types
 * Single Sign-On integration types for enterprise authentication
 */
export type SSOProviderType =
  | 'saml'
  | 'google'
  | 'microsoft'
  | 'okta'
  | 'onelogin'
  | 'auth0'
  | 'azure-ad'
  | 'custom';

export interface SSOProviderConfig extends BaseEntity {
  type: SSOProviderType;
  name: string;
  displayName: string;
  enabled: boolean;
  autoRedirect?: boolean;

  // Visual customization
  icon?: string;
  iconUrl?: string;
  buttonColor?: string;
  buttonTextColor?: string;

  // Provider-specific metadata
  metadata: {
    // SAML
    entityId?: string;
    ssoUrl?: string;
    x509Certificate?: string;

    // OAuth/OIDC
    clientId?: string;
    clientSecret?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    scopes?: string[];

    // Additional settings
    domain?: string;
    tenant?: string;
    [key: string]: unknown;
  };

  // JIT provisioning
  jitProvisioning?: {
    enabled: boolean;
    defaultRole?: string;
    attributeMapping?: Record<string, string>;
  };
}

/**
 * Enterprise Branding Types
 * Login page customization and branding configuration
 */
export interface EnterpriseBrandingConfig extends BaseEntity {
  organizationId?: string;

  // Logo
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  faviconUrl?: string;

  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  linkColor?: string;

  // Content
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  footerText?: string;
  supportEmail?: string;
  supportUrl?: string;

  // Background
  backgroundImageUrl?: string;
  backgroundGradient?: string;
  backgroundStyle?: 'solid' | 'gradient' | 'image';
  backgroundPosition?: string;

  // Legal
  termsUrl?: string;
  privacyUrl?: string;
  companyName?: string;

  // Advanced
  customCss?: string;
  customHtml?: string;
}

/**
 * Security Status Types
 * Account security and authentication status
 */
export type SecurityLevel = 'secure' | 'warning' | 'danger';

export interface SecurityStatus {
  level: SecurityLevel;
  score: number;
  mfaEnabled: boolean;

  lastLogin?: {
    timestamp: string;
    ip: string;
    location?: string;
    deviceInfo?: string;
  };

  suspiciousActivity?: boolean;
  accountAge?: number; // days since account creation
  passwordAge?: number; // days since last password change
  failedLoginAttempts?: number;

  recommendations?: string[];
}

/**
 * Password Strength Types
 * Password validation and strength calculation
 */
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  percentage: number;
  feedback: string[];
}
