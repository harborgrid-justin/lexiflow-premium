/**
 * Enhanced Auth Context for LexiFlow Enterprise Legal Platform
 *
 * Provides comprehensive authentication with:
 * - User state management with organization/tenant context
 * - JWT token management with auto-refresh
 * - Session persistence (localStorage/sessionStorage)
 * - Permission-based access control
 * - MFA support
 * - Organization/tenant isolation
 *
 * @module contexts/AuthContext
 */

import { AuthApiService } from '@/api/auth/auth-api';
import type { User } from '@/types';
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
 * Extended user type with permissions
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatarUrl?: string;
  permissions: string[];
  organizationId?: string;
  organizationName?: string;
  department?: string;
  title?: string;
  phone?: string;
  mfaEnabled?: boolean;
}

/**
 * Organization/Tenant information
 */
export interface Organization {
  id: string;
  name: string;
  type: string;
  settings?: Record<string, unknown>;
}

/**
 * Session storage options
 */
export type StorageType = 'local' | 'session';

/**
 * Authentication state
 */
interface AuthState {
  user: AuthUser | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  mfaRequired: boolean;
}

/**
 * Authentication actions
 */
interface AuthActions {
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    mfaCode?: string
  ) => Promise<{ success: boolean; mfaRequired?: boolean }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<AuthUser>) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  clearError: () => void;
}

// ============================================================================
// Context
// ============================================================================

const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Access authentication state
 */
export function useAuthState(): AuthState {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
}

/**
 * Access authentication actions
 */
export function useAuthActions(): AuthActions {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
}

/**
 * Convenience hook for both state and actions
 */
export function useAuth() {
  return {
    ...useAuthState(),
    ...useAuthActions(),
  };
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lexiflow_auth_token',
  REFRESH_TOKEN: 'lexiflow_refresh_token',
  USER: 'lexiflow_auth_user',
  ORGANIZATION: 'lexiflow_auth_org',
  STORAGE_TYPE: 'lexiflow_storage_type',
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the appropriate storage based on remember me setting
 */
function getStorage(type?: StorageType): Storage {
  const storedType = localStorage.getItem(STORAGE_KEYS.STORAGE_TYPE) as StorageType | null;
  const storageType = type || storedType || 'session';
  return storageType === 'local' ? localStorage : sessionStorage;
}

/**
 * Convert User type to AuthUser type
 */
function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0] || 'User',
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role || 'Associate',
    avatarUrl: user.avatarUrl,
    permissions: [], // Will be populated from backend
    organizationId: user.orgId,
    department: user.department,
    title: user.title,
    phone: user.phone,
    mfaEnabled: user.twoFactorEnabled,
  };
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  // Computed values
  const isAuthenticated = user !== null;

  // Auth API instance
  const authApi = useMemo(() => new AuthApiService(), []);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try both storages
        let storage = getStorage('local');
        let storedUser = storage.getItem(STORAGE_KEYS.USER);
        let storedOrg = storage.getItem(STORAGE_KEYS.ORGANIZATION);

        if (!storedUser) {
          storage = getStorage('session');
          storedUser = storage.getItem(STORAGE_KEYS.USER);
          storedOrg = storage.getItem(STORAGE_KEYS.ORGANIZATION);
        }

        if (storedUser) {
          JSON.parse(storedUser) as AuthUser;
          const parsedOrg = storedOrg ? JSON.parse(storedOrg) as Organization : null;

          // Validate session with backend
          try {
            const currentUser = await authApi.getCurrentUser();
            const validatedUser = toAuthUser(currentUser);
            setUser(validatedUser);
            setOrganization(parsedOrg);
          } catch (err) {
            console.warn('[AuthContext] Session validation failed:', err);
            // Clear invalid session
            storage.removeItem(STORAGE_KEYS.USER);
            storage.removeItem(STORAGE_KEYS.ORGANIZATION);
            storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Failed to initialize auth:', err);
        setError('Failed to restore session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [authApi]);

  // Login action
  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false,
      mfaCode?: string
    ): Promise<{ success: boolean; mfaRequired?: boolean }> => {
      setIsLoading(true);
      setError(null);
      setMfaRequired(false);

      try {
        console.log('[AuthContext] Attempting login for:', email);

        const response = await authApi.login(email, password);

        // Check if MFA is required
        if ('mfaRequired' in response.user && response.user.mfaRequired && !mfaCode) {
          console.log('[AuthContext] MFA required');
          setMfaRequired(true);
          setIsLoading(false);
          return { success: false, mfaRequired: true };
        }

        // If MFA code provided, verify it
        if (mfaCode) {
          const mfaResult = await authApi.verifyMFA(mfaCode);
          if (!mfaResult.verified) {
            setError('Invalid MFA code');
            setIsLoading(false);
            return { success: false };
          }
        }

        // Convert to AuthUser
        const authUser = toAuthUser(response.user);

        // Get organization info if available
        let org: Organization | null = null;
        if (authUser.organizationId) {
          org = {
            id: authUser.organizationId,
            name: authUser.organizationName || 'Unknown Organization',
            type: 'LawFirm', // Default, should come from backend
          };
        }

        // Determine storage type
        const storageType: StorageType = rememberMe ? 'local' : 'session';
        const storage = getStorage(storageType);

        // Store auth data
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
        if (org) {
          storage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(org));
        }
        localStorage.setItem(STORAGE_KEYS.STORAGE_TYPE, storageType);

        // Update state
        setUser(authUser);
        setOrganization(org);
        setMfaRequired(false);

        console.log('[AuthContext] Login successful');
        return { success: true };
      } catch (err) {
        console.error('[AuthContext] Login error:', err);
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [authApi]
  );

  // Logout action
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      // Clear all storage
      const storage = getStorage();
      storage.removeItem(STORAGE_KEYS.USER);
      storage.removeItem(STORAGE_KEYS.ORGANIZATION);
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

      // Also clear from the other storage type
      const otherStorage = storage === localStorage ? sessionStorage : localStorage;
      otherStorage.removeItem(STORAGE_KEYS.USER);
      otherStorage.removeItem(STORAGE_KEYS.ORGANIZATION);
      otherStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      otherStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

      setUser(null);
      setOrganization(null);
      setError(null);
      setMfaRequired(false);
    }
  }, [authApi]);

  // Refresh token action
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await authApi.refreshToken();
      return true;
    } catch {
      await logout();
      return false;
    }
  }, [authApi, logout]);

  // Update user action
  const updateUser = useCallback((updates: Partial<AuthUser>): void => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      const storage = getStorage();
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Permission checking
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission) || user.permissions.includes('*');
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return permissions.some((p) => hasPermission(p));
    },
    [user, hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return permissions.every((p) => hasPermission(p));
    },
    [user, hasPermission]
  );

  // Role checking
  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoized context values
  const stateValue = useMemo<AuthState>(
    () => ({
      user,
      organization,
      isLoading,
      isAuthenticated,
      error,
      mfaRequired,
    }),
    [user, organization, isLoading, isAuthenticated, error, mfaRequired]
  );

  const actionsValue = useMemo<AuthActions>(
    () => ({
      login,
      logout,
      refreshToken,
      updateUser,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      clearError,
    }),
    [
      login,
      logout,
      refreshToken,
      updateUser,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      clearError,
    ]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}
