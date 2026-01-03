/**
 * Auth Provider for React Router v7
 *
 * Provides authentication context throughout the application with:
 * - User state management
 * - Authentication status tracking
 * - Login/logout functionality
 * - Session persistence
 *
 * @module providers/AuthProvider
 */

import { AuthApiService } from '@/api/auth/auth-api';
import { useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthActionsContext, AuthStateContext } from './authContexts';
import type { AuthActionsValue, AuthStateValue, AuthUser } from './authTypes';

// ============================================================================
// Constants
// ============================================================================

const AUTH_STORAGE_KEY = 'lexiflow_auth_token';
const AUTH_USER_KEY = 'lexiflow_auth_user';

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

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored token and user
        const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (storedToken && storedUser) {
          // Validate token with backend (placeholder for actual API call)
          // const isValid = await validateToken(storedToken);
          const isValid = true; // TODO: Implement actual token validation

          if (isValid) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to restore session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Stable action callbacks (BP10)
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthProvider] Starting login for:', email);
      const authApi = new AuthApiService();
      const response = await authApi.login(email, password);
      console.log('[AuthProvider] Login response received:', { hasToken: !!response.accessToken, userId: response.user?.id });

      // Convert API user response to AuthUser format
      const authUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.firstName ? `${response.user.firstName} ${response.user.lastName}`.trim() : response.user.email.split('@')[0],
        role: (response.user.role || 'attorney') as AuthUser['role'],
        avatarUrl: response.user.avatarUrl,
        permissions: response.user.permissions || [],
      };

      // Store token and user
      localStorage.setItem(AUTH_STORAGE_KEY, response.accessToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));

      setUser(authUser);
      console.log('[AuthProvider] Login successful');
      return true;
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
      const authApi = new AuthApiService();
      await authApi.logout();

      // Clear storage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);

      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API fails
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
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
