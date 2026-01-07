/**
 * RequireRole - Role-based authorization guard
 * Restricts access based on user roles
 */

import { type ReactNode } from 'react';
import { useAuth } from '../../../services/identity/AuthProvider';

interface RequireRoleProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireRole({ children, roles, fallback, redirectTo = '/unauthorized' }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || <div>Checking permissions...</div>;
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return fallback || null;
  }

  const hasRequiredRole = user?.roles?.some(role => roles.includes(role));

  if (!hasRequiredRole) {
    if (typeof window !== 'undefined' && redirectTo) {
      window.location.href = redirectTo;
    }
    return fallback || <div>Access denied. Required roles: {roles.join(', ')}</div>;
  }

  return <>{children}</>;
}
