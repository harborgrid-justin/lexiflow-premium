/**
 * RequireAuth - Authentication guard
 * Redirects unauthenticated users to login
 */

import { type ReactNode } from 'react';
import { useAuth } from '../../../services/identity/AuthProvider';

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, fallback, redirectTo = '/login' }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || <div>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return fallback || null;
  }

  return <>{children}</>;
}
