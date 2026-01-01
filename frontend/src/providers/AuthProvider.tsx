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

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents an authenticated user
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'attorney' | 'paralegal' | 'staff';
  avatarUrl?: string;
  permissions: string[];
}

/**
 * Authentication state exposed to consumers
 */
interface AuthStateValue {
  /** Current authenticated user, null if not authenticated */
  user: AuthUser | null;
  /** Whether authentication is being checked */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Authentication error message */
  error: string | null;
}

/**
 * Authentication actions exposed to consumers
 */
interface AuthActionsValue {
  /** Login with credentials */
  login: (email: string, password: string) => Promise<boolean>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Refresh authentication token */
  refreshToken: () => Promise<boolean>;
  /** Check if user has specific permission */
  hasPermission: (permission: string) => boolean;
  /** Check if user has any of the specified roles */
  hasRole: (...roles: AuthUser['role'][]) => boolean;
}

// ============================================================================
// Context
// ============================================================================

/**
 * Split contexts for performance optimization (BP3)
 * - State context triggers re-renders only for state consumers
 * - Actions context is stable and doesn't trigger re-renders
 */
const AuthStateContext = createContext<AuthStateValue | undefined>(undefined);
const AuthActionsContext = createContext<AuthActionsValue | undefined>(undefined);

// ============================================================================
// Custom Hooks (BP4: Export only hooks, not raw contexts)
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
      // TODO: Replace with actual API call
      // const response = await api.auth.login({ email, password });

      // Placeholder for demo - simulate API response
      const mockUser: AuthUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'attorney',
        permissions: ['cases:read', 'cases:write', 'documents:read'],
      };

      // Store token and user
      localStorage.setItem(AUTH_STORAGE_KEY, 'mock_token_' + Date.now());
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));

      setUser(mockUser);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // TODO: Call logout API endpoint
      // await api.auth.logout();

      // Clear storage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);

      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API fails
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      // TODO: Implement token refresh
      // const newToken = await api.auth.refresh();
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
// Utility Functions for Loaders
// ============================================================================

/**
 * Get current user from request cookies/headers
 * Use in route loaders for SSR authentication
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  // TODO: Implement actual session/JWT validation from request
  // const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  // if (!token) return null;
  // return await validateAndDecodeToken(token);

  // Placeholder - in real app, validate server-side
  return null;
}

/**
 * Require authentication in route loader
 * Throws redirect to login if not authenticated
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);

  if (!user) {
    // In React Router v7, throw a Response to redirect
    throw new Response(null, {
      status: 302,
      headers: { Location: '/login' },
    });
  }

  return user;
}

/**
 * Require specific role(s) in route loader
 * Throws 403 if user doesn't have required role
 */
export async function requireRole(
  request: Request,
  ...roles: AuthUser['role'][]
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!roles.includes(user.role)) {
    throw new Response('Forbidden', { status: 403 });
  }

  return user;
}
