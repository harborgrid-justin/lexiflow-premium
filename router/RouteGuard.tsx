/**
 * RouteGuard.tsx
 * Protected route wrapper with authentication and authorization
 * Supports role-based access control and redirect logic
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// ============================================================================
// Types
// ============================================================================

export interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

// ============================================================================
// RouteGuard Component
// ============================================================================

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/login',
  fallback,
  onUnauthorized,
}) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // ============================================================================
  // Get User from Context/Storage
  // ============================================================================

  const getUser = (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  // ============================================================================
  // Authorization Check
  // ============================================================================

  useEffect(() => {
    const checkAuthorization = async () => {
      setIsChecking(true);

      // Check if authentication is required
      if (!requireAuth) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user is authenticated
      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        setIsAuthorized(false);
        setIsChecking(false);
        onUnauthorized?.();
        return;
      }

      // Check role-based access
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.includes(user.role);
        if (!hasRequiredRole) {
          setIsAuthorized(false);
          setIsChecking(false);
          onUnauthorized?.();
          return;
        }
      }

      // Check permission-based access
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          user.permissions.includes(permission)
        );
        if (!hasAllPermissions) {
          setIsAuthorized(false);
          setIsChecking(false);
          onUnauthorized?.();
          return;
        }
      }

      // All checks passed
      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuthorization();
  }, [requireAuth, requiredRoles, requiredPermissions, onUnauthorized]);

  // ============================================================================
  // Render
  // ============================================================================

  // Show loading state while checking
  if (isChecking) {
    return fallback || <LoadingFallback />;
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Render protected content
  return <>{children}</>;
};

// ============================================================================
// Default Loading Fallback
// ============================================================================

const LoadingFallback: React.FC = () => {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Checking permissions...</p>
    </div>
  );
};

// ============================================================================
// RoleGuard Component (convenience wrapper)
// ============================================================================

export interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  redirectTo = '/unauthorized',
  fallback,
}) => {
  return (
    <RouteGuard
      requireAuth={true}
      requiredRoles={roles}
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
};

// ============================================================================
// PermissionGuard Component (convenience wrapper)
// ============================================================================

export interface PermissionGuardProps {
  children: ReactNode;
  permissions: string[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permissions,
  redirectTo = '/unauthorized',
  fallback,
}) => {
  return (
    <RouteGuard
      requireAuth={true}
      requiredPermissions={permissions}
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
};

// ============================================================================
// AdminGuard Component (admin-only routes)
// ============================================================================

export interface AdminGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  redirectTo = '/unauthorized',
  fallback,
}) => {
  return (
    <RoleGuard roles={['admin']} redirectTo={redirectTo} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

// ============================================================================
// GuestGuard Component (redirect authenticated users)
// ============================================================================

export interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// ============================================================================
// useAuth Hook
// ============================================================================

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) || false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => user?.role === role);
  };

  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every(permission => user?.permissions.includes(permission));
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllPermissions,
  };
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '14px',
    color: '#6b7280',
  },
};

// Add keyframe animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default RouteGuard;
