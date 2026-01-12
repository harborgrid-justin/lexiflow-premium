/**
 * Auth Provider for Next.js 16
 *
 * Provides authentication context throughout the application with:
 * - User state management via server actions
 * - Authentication status tracking with HttpOnly cookies
 * - Login/logout functionality using secure server-side sessions
 * - Session persistence without localStorage
 *
 * @module providers/AuthProvider
 * @security Uses HttpOnly cookies and server actions
 */

'use client';

import {
  loginAction,
  logoutAction,
  refreshTokenAction,
  validateSession,
} from '@/app/actions/auth/session';
import { useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthActionsContext, AuthStateContext } from './authContexts';
import type { AuthActionsValue, AuthStateValue, AuthUser } from './authTypes';

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

  // Computed values
  const isAuthenticated = user !== null;

  // Initialize auth state from server session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionData = await validateSession();
        
        if (sessionData.valid && sessionData.user) {
          setUser(sessionData.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthProvider] Failed to initialize auth:', err);
        setError('Failed to restore session');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Stable action callbacks using server actions
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthProvider] Starting login for:', email);
      const result = await loginAction(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log('[AuthProvider] Login successful');
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('[AuthProvider] Login error:', err);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutAction();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('[AuthProvider] Logout error:', err);
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const result = await refreshTokenAction();
      return result.success;
    } catch (error) {
      console.error('[AuthProvider] Token refresh error:', error);
      return false;
    }
  }, []);

  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const authApi = new AuthApiService();
      const response = await authApi.refreshToken();
      localStorage.setItem(AUTH_STORAGE_KEY, response.accessToken);
      return true;
    } catch {
      await logout();
      return false;
    }
  }, [logout]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((...roles: AuthUser['role'][]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  // Memoized context values (BP7)
  const stateValue = useMemo<AuthStateValue>(() => ({
    user,
    isLoading,
    isAuthenticated,
    error,
  }), [user, isLoading, isAuthenticated, error]);

  const actionsValue = useMemo<AuthActionsValue>(() => ({
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
  }), [login, logout, refreshToken, hasPermission, hasRole]);

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
