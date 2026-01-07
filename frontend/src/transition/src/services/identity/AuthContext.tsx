import { createContext, useContext } from 'react';
import type { LoginCredentials } from '../data/api/gateways/authGateway';
import type { Permission, Role, User } from './domain/user';

export interface AuthContextValue {
  /** Current user identity (null if not authenticated) */
  user: User | null;
  /** User roles */
  roles: Role[];
  /** User permissions */
  permissions: Permission[];
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether identity is being loaded */
  isLoading: boolean;
  /** Refresh user identity from backend */
  refreshIdentity: () => Promise<void>;
  /** Login with credentials */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  /** Clear user identity */
  logout: () => void;
  /** Check if user has specific role */
  hasRole: (role: Role) => boolean;
  /** Check if user has specific permission */
  hasPermission: (permission: Permission) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
