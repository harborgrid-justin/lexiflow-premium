/**
 * RoleRoute Component
 * Wrapper for routes that require specific roles/permissions
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { permissionService } from '../services/auth/permissionService';

interface RoleRouteProps {
  children: React.ReactNode;
  /**
   * Required roles (user must have at least one)
   */
  requiredRoles?: string[];
  /**
   * Required permissions (user must have at least one)
   */
  requiredPermissions?: string[];
  /**
   * Require all roles/permissions instead of just one
   */
  requireAll?: boolean;
  /**
   * Redirect path if unauthorized (default: /unauthorized)
   */
  unauthorizedRedirect?: string;
  /**
   * Redirect path if not authenticated (default: /auth/login)
   */
  loginRedirect?: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAll = false,
  unauthorizedRedirect = '/unauthorized',
  loginRedirect = '/auth/login',
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={loginRedirect} replace />;
  }

  // Check role authorization
  if (requiredRoles.length > 0) {
    const hasRole = requireAll
      ? permissionService.hasAllRoles(user, requiredRoles)
      : permissionService.hasAnyRole(user, requiredRoles);

    if (!hasRole) {
      return <Navigate to={unauthorizedRedirect} replace />;
    }
  }

  // Check permission authorization
  if (requiredPermissions.length > 0) {
    const hasPermission = requireAll
      ? permissionService.hasAllPermissions(user, requiredPermissions)
      : permissionService.hasAnyPermission(user, requiredPermissions);

    if (!hasPermission) {
      return <Navigate to={unauthorizedRedirect} replace />;
    }
  }

  // User is authorized, render content
  return <>{children}</>;
};
