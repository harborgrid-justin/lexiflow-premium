/**
 * Enterprise Auth Components
 * Barrel export for authentication and RBAC UI components
 *
 * @module components/enterprise/auth
 */

// Existing components
export { LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm';

export { MFASetup } from './MFASetup';
export type { MFASetupProps } from './MFASetup';

export { SessionManager } from './SessionManager';
export type { SessionManagerProps, Session } from './SessionManager';

export { RoleManager } from './RoleManager';
export type { RoleManagerProps } from './RoleManager';

export { UserProfile } from './UserProfile';
export type { UserProfileProps } from './UserProfile';

export { ApiKeyManager } from './ApiKeyManager';
export type { ApiKeyManagerProps } from './ApiKeyManager';

// New authentication components
export { RegisterForm } from './RegisterForm';
export type { RegisterFormProps } from './RegisterForm';

export { ForgotPasswordForm } from './ForgotPasswordForm';
export type { ForgotPasswordFormProps } from './ForgotPasswordForm';

export { PasswordResetForm } from './PasswordResetForm';
export type { PasswordResetFormProps } from './PasswordResetForm';

// Password strength and security
export { PasswordStrengthMeter, calculatePasswordStrength } from './PasswordStrengthMeter';
export type { PasswordStrengthMeterProps, PasswordStrength } from './PasswordStrengthMeter';

export { SecurityIndicator, ConnectionSecurityBadge } from './SecurityIndicator';
export type { SecurityIndicatorProps, SecurityStatus, SecurityLevel, ConnectionSecurityBadgeProps } from './SecurityIndicator';

// SSO integration
export { SSOLogin, SSOCallback } from './SSOLogin';
export type { SSOLoginProps, SSOCallbackProps, SSOProvider, SSOProviderConfig } from './SSOLogin';

// Enterprise branding
export { EnterpriseBrandingConfig } from './EnterpriseBrandingConfig';
export type { EnterpriseBrandingConfigProps, BrandingConfig } from './EnterpriseBrandingConfig';
