// ================================================================================
// ENTERPRISE REACT CONTEXT FILE - AUTH DOMAIN (EXTENDED)
// ================================================================================
//
// CANONICAL STRUCTURE:
// ├── Types
// ├── State Shape
// ├── Actions (Domain Methods)
// ├── Context
// ├── Provider
// └── Public Hooks
//
// POSITION IN ARCHITECTURE:
//   Frontend API (truth) → AuthService (effects) → Context (state) → Views
//
// RULES ENFORCED:
//   ✓ Domain-scoped state only (authentication)
//   ✓ No direct HTTP calls (uses AuthApiService via AuthService)
//   ✓ No router navigation (except SSO redirects - acceptable)
//   ✓ No JSX layout (only provider wrapper)
//   ✓ Loader-based initialization support
//   ✓ Session management (timers, warnings)
//   ✓ MFA support
//   ✓ Audit logging
//   ✓ Memoized context values
//   ✓ Split state/actions contexts
//
// ENTERPRISE FEATURES:
//   • Multi-factor authentication (MFA)
//   • Session timeout with warnings
//   • Role-based access control (RBAC)
//   • SSO/SAML integration hooks
//   • Audit logging for auth events
//   • Password policy enforcement
//   • Account lockout handling
//   • Token refresh automation
//
// ================================================================================

/**
 * Auth Provider for React Router v7
 *
 * Enterprise-grade authentication provider with:
 * - Multi-factor authentication (MFA)
 * - Session management with timeout warnings
 * - Role-based access control (RBAC)
 * - SSO/SAML integration hooks
 * - Audit logging for auth events
 * - Password policy enforcement
 * - Account lockout handling
 *
 * @module providers/AuthProvider
 */

import { AuthApiService } from '@/lib/frontend-api';
import { AUTH_REFRESH_TOKEN_STORAGE_KEY, AUTH_TOKEN_STORAGE_KEY } from '@/config/security/security.config';
import { clearAuthTokens, setAuthTokens } from '@/services/infrastructure/api-client/auth-manager';
import type { User } from '@/types';
import { useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AuthActionsContext, AuthStateContext } from './authContexts';
import type { AuthActionsValue, AuthEvent, AuthLoginResult, AuthStateValue, AuthUser, MFASetup, PasswordPolicy, SessionInfo } from './authTypes';

interface LoginUserResponse extends User {
  permissions?: string[];
  mfaEnabled?: boolean;
  accountLocked?: boolean;
  passwordExpiresAt?: Date;
}

// ============================================================================
// Constants
// ============================================================================

const AUTH_STORAGE_KEY = AUTH_TOKEN_STORAGE_KEY;
const REFRESH_STORAGE_KEY = AUTH_REFRESH_TOKEN_STORAGE_KEY;
const AUTH_USER_KEY = 'lexiflow_auth_user';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const AUDIT_LOG_KEY = 'lexiflow_audit_log';

// Default password policy
const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  expiryDays: 90,
  preventReuse: 5,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log an authentication event to local storage for audit trail
 */
function logAuditEvent(event: AuthEvent): void {
  try {
    const logs = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]') as AuthEvent[];
    logs.push(event);
    // Keep only last 100 events
    if (logs.length > 100) {
      logs.shift();
    }
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
    console.log('[Auth Audit]', event);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Get audit logs
 */
export function getAuditLogs(): AuthEvent[] {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

// ============================================================================
// Provider Component
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [passwordPolicy] = useState<PasswordPolicy>(DEFAULT_PASSWORD_POLICY);

  // Refs for intervals and timeouts
  const sessionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const tokenRefreshRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sessionWarningRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const userRef = useRef<AuthUser | null>(null);

  // Keep user ref in sync
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Computed values
  const isAuthenticated = user !== null;

  // Session management functions
  const clearSessionTimers = useCallback(() => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (sessionWarningRef.current) clearTimeout(sessionWarningRef.current);
    if (tokenRefreshRef.current) clearInterval(tokenRefreshRef.current);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const userId = userRef.current?.id;
    try {
      const authApi = new AuthApiService();
      await authApi.logout();

      // Clear storage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);

      // Also clear tokens from API client's auth-manager
      clearAuthTokens();

      clearSessionTimers();
      setUser(null);
      setSession(null);
      setRequiresMFA(false);
      setError(null);

      logAuditEvent({
        type: 'logout',
        timestamp: new Date(),
        userId,
      });
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API fails
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      clearSessionTimers();
      setUser(null);
      setSession(null);
      setRequiresMFA(false);
    }
  }, [clearSessionTimers]);

  const startSession = useCallback(() => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);

    setSession({
      expiresAt,
      lastActivityAt: now,
      warningShown: false,
    });

    // Clear existing timers
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (sessionWarningRef.current) clearTimeout(sessionWarningRef.current);

    // Set warning timeout
    sessionWarningRef.current = setTimeout(() => {
      setSession(prev => prev ? { ...prev, warningShown: true } : null);
      logAuditEvent({
        type: 'session_expired',
        timestamp: new Date(),
        metadata: { warning: true },
      });
      // Show warning toast/modal (implement via custom event)
      window.dispatchEvent(new CustomEvent('session-warning', {
        detail: { remainingTime: SESSION_WARNING_TIME },
      }));
    }, SESSION_TIMEOUT - SESSION_WARNING_TIME);

    // Set session timeout
    sessionTimeoutRef.current = setTimeout(() => {
      logAuditEvent({
        type: 'session_expired',
        timestamp: new Date(),
      });
      logout();
    }, SESSION_TIMEOUT);
  }, [logout]);

  const resetSessionTimer = useCallback(() => {
    if (session) {
      startSession();
    }
  }, [session, startSession]);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored token and user
        const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Check if account is locked
          if (parsedUser.accountLocked) {
            setError('Account is locked. Please contact administrator.');
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            return;
          }

          setUser(parsedUser);

          // Sync token with API client's auth-manager for backend API calls
          const storedRefreshToken = localStorage.getItem(REFRESH_STORAGE_KEY);
          if (storedRefreshToken) {
            setAuthTokens(storedToken, storedRefreshToken);
          } else {
            // If no refresh token, clear auth state - session is invalid
            console.warn('[AuthProvider] No refresh token found during init, clearing auth state');
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
            clearAuthTokens();
            return;
          }

          startSession();

          // Start automatic token refresh
          tokenRefreshRef.current = setInterval(async () => {
            try {
              const authApi = new AuthApiService();
              await authApi.refreshToken();
              logAuditEvent({
                type: 'token_refresh',
                timestamp: new Date(),
                userId: parsedUser.id,
              });
            } catch (error) {
              console.error('Token refresh failed:', error);
            }
          }, TOKEN_REFRESH_INTERVAL);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to restore session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      clearSessionTimers();
    };
  }, [startSession, clearSessionTimers]);

  // Stable action callbacks (BP10)
  const login = useCallback(async (
    email: string,
    password: string,
    _rememberMe?: boolean,
    _mfaCode?: string
  ): Promise<AuthLoginResult> => {
    setIsLoading(true);
    setError(null);
    setRequiresMFA(false);

    try {
      console.log('[AuthProvider] Starting login for:', email);
      const authApi = new AuthApiService();
      const response = await authApi.login(email, password);
      console.log('[AuthProvider] Login response received:', { hasToken: !!response.accessToken, userId: response.user?.id });

      const userResponse = response.user as LoginUserResponse;

      // Convert API user response to AuthUser format
      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        name: (response.user.firstName ? `${response.user.firstName} ${response.user.lastName}`.trim() : response.user.email.split('@')[0]) || 'Unknown User',
        role: ((response.user.role as AuthUser['role']) || 'attorney') as AuthUser['role'],
        avatarUrl: response.user.avatarUrl,
        permissions: userResponse.permissions || [],
        mfaEnabled: userResponse.mfaEnabled,
        accountLocked: userResponse.accountLocked,
        passwordExpiresAt: userResponse.passwordExpiresAt,
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        organizationId: response.user.organizationId || response.user.orgId,
        orgId: response.user.orgId,
        organizationName: response.user.organizationName,
        department: response.user.department,
        title: response.user.title,
        phone: response.user.phone,
      };

      // Check if account is locked
      if (authUser.accountLocked) {
        setError('Account is locked. Please contact administrator.');
        logAuditEvent({
          type: 'access_denied',
          timestamp: new Date(),
          userId: authUser.id,
          metadata: { reason: 'account_locked' },
        });
        return { success: false };
      }

      // Check if MFA is required
      if (authUser.mfaEnabled) {
        // Store user temporarily and wait for MFA verification
        setRequiresMFA(true);
        setUser(authUser);
        logAuditEvent({
          type: 'login',
          timestamp: new Date(),
          userId: authUser.id,
          metadata: { mfaRequired: true },
        });
        return { success: false, mfaRequired: true };
      }

      // Store token and user
      localStorage.setItem(AUTH_STORAGE_KEY, response.accessToken);
      localStorage.setItem(REFRESH_STORAGE_KEY, response.refreshToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      // Also store in API client's auth-manager for backend API calls
      setAuthTokens(response.accessToken, response.refreshToken);

      setUser(authUser);
      startSession();

      // Start automatic token refresh
      tokenRefreshRef.current = setInterval(async () => {
        try {
          await authApi.refreshToken();
          logAuditEvent({
            type: 'token_refresh',
            timestamp: new Date(),
            userId: authUser.id,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, TOKEN_REFRESH_INTERVAL);

      logAuditEvent({
        type: 'login',
        timestamp: new Date(),
        userId: authUser.id,
      });

      console.log('[AuthProvider] Login successful');
      return { success: true };
    } catch (err) {
      console.error('[AuthProvider] Login error:', err);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      logAuditEvent({
        type: 'access_denied',
        timestamp: new Date(),
        metadata: { reason: 'login_failed', error: message },
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [startSession]);

  const verifyMFA = useCallback(async (code: string): Promise<boolean> => {
    if (!requiresMFA || !user) {
      return false;
    }

    try {
      const authApi = new AuthApiService();
      const response = await authApi.verifyMFA(code);

      if (response.verified && response.accessToken && response.refreshToken && response.user) {
        // Store tokens and user
        localStorage.setItem(AUTH_STORAGE_KEY, response.accessToken);
        localStorage.setItem(REFRESH_STORAGE_KEY, response.refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));

        // Sync with API client's auth-manager
        setAuthTokens(response.accessToken, response.refreshToken);

        setRequiresMFA(false);
        setUser(response.user as AuthUser);
        startSession();

        // Start automatic token refresh
        tokenRefreshRef.current = setInterval(async () => {
          try {
            await authApi.refreshToken();
            logAuditEvent({
              type: 'token_refresh',
              timestamp: new Date(),
              userId: response.user?.id,
            });
          } catch (error) {
            console.error('Token refresh failed:', error);
          }
        }, TOKEN_REFRESH_INTERVAL);

        logAuditEvent({
          type: 'login',
          timestamp: new Date(),
          userId: response.user.id,
          metadata: { mfaVerified: true },
        });

        return true;
      }
      return false;
    } catch (err) {
      console.error('MFA verification failed:', err);
      setError('MFA verification failed');
      return false;
    }
  }, [requiresMFA, user, startSession]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const authApi = new AuthApiService();
      const response = await authApi.refreshToken();
      localStorage.setItem(AUTH_STORAGE_KEY, response.accessToken);
      localStorage.setItem(REFRESH_STORAGE_KEY, response.refreshToken);

      // Also sync new token with API client's auth-manager
      setAuthTokens(response.accessToken, response.refreshToken);

      if (user) {
        logAuditEvent({
          type: 'token_refresh',
          timestamp: new Date(),
          userId: user.id,
        });
      }

      return true;
    } catch {
      await logout();
      return false;
    }
  }, [logout, user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((...roles: AuthUser['role'][]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const enableMFA = useCallback(async (): Promise<MFASetup> => {
    const authApi = new AuthApiService();
    const response = await authApi.enableMFA();

    if (user) {
      logAuditEvent({
        type: 'mfa_enabled',
        timestamp: new Date(),
        userId: user.id,
      });

      // Update user state
      setUser({ ...user, mfaEnabled: true });
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...user, mfaEnabled: true }));
    }

    return response;
  }, [user]);

  const disableMFA = useCallback(async (): Promise<void> => {
    const authApi = new AuthApiService();
    await authApi.disableMFA();

    if (user) {
      logAuditEvent({
        type: 'mfa_disabled',
        timestamp: new Date(),
        userId: user.id,
      });

      // Update user state
      setUser({ ...user, mfaEnabled: false });
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...user, mfaEnabled: false }));
    }
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    const authApi = new AuthApiService();
    await authApi.changePassword(currentPassword, newPassword);

    if (user) {
      logAuditEvent({
        type: 'password_changed',
        timestamp: new Date(),
        userId: user.id,
      });

      // Update password expiry
      const passwordExpiresAt = passwordPolicy.expiryDays
        ? new Date(Date.now() + passwordPolicy.expiryDays * 24 * 60 * 60 * 1000)
        : undefined;

      setUser({ ...user, passwordExpiresAt });
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...user, passwordExpiresAt }));
    }
  }, [user, passwordPolicy]);

  const loginWithSSO = useCallback(async (providerId: string): Promise<void> => {
    // Redirect to SSO provider login URL
    // In a real implementation, this would construct the SAML/OAuth URL with proper parameters
    logAuditEvent({
      type: 'login',
      timestamp: new Date(),
      metadata: { ssoProvider: providerId },
    });

    // This is a placeholder - actual implementation would redirect to SSO provider
    window.location.href = `/auth/sso/${providerId}`;
  }, []);

  const logAuthEventCallback = useCallback((event: AuthEvent): void => {
    logAuditEvent(event);
  }, []);

  const extendSession = useCallback(async (): Promise<void> => {
    resetSessionTimer();

    if (user) {
      logAuditEvent({
        type: 'token_refresh',
        timestamp: new Date(),
        userId: user.id,
        metadata: { sessionExtended: true },
      });
    }
  }, [resetSessionTimer, user]);

  // Memoized context values (BP7)
  const stateValue = useMemo<AuthStateValue>(() => ({
    user,
    isLoading,
    isAuthenticated,
    error,
    session,
    requiresMFA,
    passwordPolicy,
  }), [user, isLoading, isAuthenticated, error, session, requiresMFA, passwordPolicy]);

  const actionsValue = useMemo<AuthActionsValue>(() => ({
    login,
    verifyMFA,
    logout,
    refreshToken,
    clearError,
    hasPermission,
    hasRole,
    enableMFA,
    disableMFA,
    changePassword,
    loginWithSSO,
    logAuthEvent: logAuthEventCallback,
    extendSession,
  }), [
    login,
    verifyMFA,
    logout,
    refreshToken,
    clearError,
    hasPermission,
    hasRole,
    enableMFA,
    disableMFA,
    changePassword,
    loginWithSSO,
    logAuthEventCallback,
    extendSession,
  ]);

  // Split providers for performance (BP3 & BP8)
  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// ============================================================================
// Hooks - defined here for proper module resolution
// ============================================================================

/**
 * Access authentication state
 * @throws Error if used outside AuthProvider
 */
export function useAuthState(): AuthStateValue {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
}

/**
 * Access authentication actions
 * @throws Error if used outside AuthProvider
 */
export function useAuthActions(): AuthActionsValue {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
}

/**
 * Convenience hook for accessing both state and actions
 * Use sparingly - prefer specific hooks for better performance
 */
export function useAuth() {
  return {
    ...useAuthState(),
    ...useAuthActions(),
  };
}

// ============================================================================
// Type re-exports
// ============================================================================

export type { AuthActionsValue, AuthStateValue, AuthUser } from './authTypes';
