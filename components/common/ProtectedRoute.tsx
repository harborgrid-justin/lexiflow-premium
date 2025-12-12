/**
 * ProtectedRoute Component
 * Route guard for authentication and authorization
 */

import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  requiredRole?: string | string[];
  userRole?: string;
  redirectTo?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated = true, // Default to true for now (replace with actual auth check)
  isLoading = false,
  requiredRole,
  userRole,
  redirectTo = '/login',
  fallback,
}) => {
  // Show loading state
  if (isLoading) {
    return fallback || <LoadingSpinner size="lg" fullScreen message="Loading..." />;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (requiredRole && userRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
