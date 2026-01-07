/**
 * AuthProvider - Identity Resolution Provider
 *
 * Enterprise pattern: Frontend identity ≠ backend authentication
 *
 * Responsibilities:
 * - Fetch user identity from backend /me endpoint
 * - Expose user, roles, permissions to UI
 * - Listen for auth events (401, 403)
 *
 * Does NOT handle:
 * - Token issuance/refresh (backend owns this)
 * - Auth headers (transport layer handles this)
 * - Session management (cookies, not tokens)
 *
 * @module services/identity/AuthProvider
 */

import { useEffect, useState, type ReactNode } from 'react';
import { authGateway, type LoginCredentials } from '../data/api/gateways/authGateway';
import { userGateway, type UserIdentity } from '../data/api/gateways/userGateway';
import { AuthContext } from './AuthContext';
import type { Permission, Role, User } from './domain/user';

export { useAuth } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  useEffect(() => {
    // Fetch identity from backend on mount
    loadIdentity();

    // Listen for auth events from transport layer
    const handleUnauthorized = () => {
      console.warn('Session expired - clearing identity');
      setUser(null);
      setRoles([]);
      setPermissions([]);
    };

    const handleForbidden = () => {
      console.warn('Insufficient permissions');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      window.addEventListener('auth:forbidden', handleForbidden);

      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
        window.removeEventListener('auth:forbidden', handleForbidden);
      };
    }
  }, []);

  /**
   * Load user identity from backend /me endpoint
   * Backend validates session via httpOnly cookie
   */
  const loadIdentity = async () => {
    setIsLoading(true);
    try {
      // Call backend /users/me - cookie auth happens at transport layer
      const identity: UserIdentity = await userGateway.getCurrentIdentity();

      // Map backend identity to frontend domain model
      setUser({
        id: identity.id,
        email: identity.email,
        firstName: identity.firstName,
        lastName: identity.lastName,
        name: `${identity.firstName} ${identity.lastName}`,
        avatar: identity.avatar,
        roles: identity.roles as Role[],
        permissions: identity.permissions as Permission[],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setRoles(identity.roles as Role[]);
      setPermissions(identity.permissions as Permission[]);
    } catch (error: any) {
      // 401 = not authenticated (no valid session)
      if (error.status === 401) {
        console.log('No active session');
      } else {
        console.error('Failed to load identity:', error);
      }

      setUser(null);
      setRoles([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    const response = await authGateway.login(credentials);
    if (response.success) {
      await loadIdentity();
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const refreshIdentity = async () => {
    await loadIdentity();
  };

  const hasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const value: AuthContextValue = {
    user,
    roles,
    permissions,
    isAuthenticated,
    isLoading,
    refreshIdentity,
    login,
    logout,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
