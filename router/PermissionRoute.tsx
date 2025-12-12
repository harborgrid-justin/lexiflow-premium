/**
 * PermissionRoute Component
 * Wrapper for routes that require specific permissions
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { permissionService } from '../services/auth/permissionService';

interface PermissionRouteProps {
  children: React.ReactNode;
  /**
   * Required permission(s) - can be a single permission or array of permissions
   */
  permission: string | string[];
  /**
   * Require all permissions (default: false = require any)
   */
  requireAll?: boolean;
  /**
   * Redirect path if permission check fails (default: /unauthorized)
   */
  redirectTo?: string;
  /**
   * Show inline error instead of redirecting
   */
  showInlineError?: boolean;
  /**
   * Custom fallback component when permission is denied
   */
  fallback?: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  permission,
  requireAll = false,
  redirectTo = '/unauthorized',
  showInlineError = false,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

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
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check permissions
  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasPermission = requireAll
    ? permissionService.checkAllPermissions(permissions)
    : permissionService.checkAnyPermission(permissions);

  // Permission denied
  if (!hasPermission) {
    // Show custom fallback
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show inline error
    if (showInlineError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <LockIcon sx={{ fontSize: 64, color: 'error.dark' }} />
          </Box>

          <Alert severity="error" sx={{ maxWidth: 600, mb: 3 }}>
            <strong>Access Denied</strong>
            <br />
            You do not have the required permissions to access this resource.
            <br />
            <br />
            <strong>Required Permission{permissions.length > 1 ? 's' : ''}:</strong>
            <br />
            {permissions.map((perm, index) => (
              <span key={perm}>
                {index > 0 && (requireAll ? ' AND ' : ' OR ')}
                <code>{perm}</code>
              </span>
            ))}
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/'}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      );
    }

    // Redirect to unauthorized page
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location,
          requiredPermissions: permissions,
          requireAll,
        }}
        replace
      />
    );
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Higher-order component version
 */
export const withPermission = (
  Component: React.ComponentType<any>,
  permission: string | string[],
  options?: Omit<PermissionRouteProps, 'children' | 'permission'>
) => {
  return (props: any) => (
    <PermissionRoute permission={permission} {...options}>
      <Component {...props} />
    </PermissionRoute>
  );
};

export default PermissionRoute;
