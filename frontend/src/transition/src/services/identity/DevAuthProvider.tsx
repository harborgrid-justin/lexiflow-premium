/**
 * Development Auth Provider
 *
 * Automatically authenticates as a specific user for development speed.
 * Bypasses the login screen.
 *
 * @module services/identity/DevAuthProvider
 */

import { useEffect, useState, type ReactNode } from 'react';
import { authGateway } from '../data/api/gateways/authGateway';
import { userGateway, type UserIdentity } from '../data/api/gateways/userGateway';
import { AuthContext, type AuthContextValue } from './AuthContext';
import type { Permission, Role, User } from './domain/user';

export { useAuth } from './AuthContext';

interface DevAuthProviderProps {
  children: ReactNode;
}

export function DevAuthProvider({ children }: DevAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded dev credentials
  const DEV_CREDS = {
    email: 'admin@lexiflow.com',
    password: 'password'
  };

  const mapUserIdentity = (identity: any) => {
    // Transform API user to Domain user
    // Note: Adjust mapping based on actual API response structure
    const domainUser: User = {
      id: identity.id,
      email: identity.email,
      firstName: identity.firstName,
      lastName: identity.lastName,
      roles: [identity.role] as Role[],
      permissions: (identity.permissions || []) as Permission[],
      name: `${identity.firstName} ${identity.lastName}`,
      avatar: undefined, // Fixed: avatarUrl -> avatar
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUser(domainUser);
  };

  const performDevLogin = async () => {
    try {
      const response = await authGateway.login(DEV_CREDS);
      if (response.success && response.data?.user) {
        console.log('[DevAuth] Auto-login successful as', DEV_CREDS.email);
        mapUserIdentity(response.data.user as UserIdentity);
      } else {
        console.error('[DevAuth] Auto-login failed', response);
      }
    } catch (e) {
      console.error('[DevAuth] Auto-login error', e);
    }
  };

  const loadIdentity = async () => {
    try {
      const identity = await userGateway.getCurrentIdentity();
      if (identity) {
        mapUserIdentity(identity);
      } else {
        // If getting identity fails/returns null, try logging in
        await performDevLogin();
      }
    } catch (error) {
      console.warn('[DevAuth] Failed to load identity, attempting auto-login...');
      await performDevLogin();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIdentity();
  }, []);

  const value: AuthContextValue = {
    user,
    roles: user?.roles || [],
    permissions: user?.permissions || [],
    isAuthenticated: !!user,
    isLoading,
    refreshIdentity: loadIdentity,
    login: async () => true, // No-op for dev
    logout: () => {
      authGateway.logout();
      setUser(null);
    },
    hasRole: (role: Role) => user?.roles.includes(role) || false,
    hasPermission: (perm: Permission) => user?.permissions.includes(perm) || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
