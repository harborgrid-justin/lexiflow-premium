/**
 * Enterprise Authentication Components
 *
 * Provides enterprise-grade authentication UI components:
 * - SAML 2.0 SSO Login
 * - Multi-Factor Authentication Setup
 * - Session Management
 * - Device Trust Management
 */

export { SSOLoginButton, SSOLoginCard } from './SSOLoginButton';
export { MFASetupWizard } from './MFASetupWizard';
export { SessionManager } from './SessionManager';
export { DeviceTrustPanel } from './DeviceTrustPanel';

export default {
  SSOLoginButton: () => import('./SSOLoginButton'),
  MFASetupWizard: () => import('./MFASetupWizard'),
  SessionManager: () => import('./SessionManager'),
  DeviceTrustPanel: () => import('./DeviceTrustPanel'),
};
