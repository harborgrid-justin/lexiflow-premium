/**
 * PublicRoute Component
 * Wrapper for routes that should only be accessible when NOT authenticated
 * (e.g., login, register pages)
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
  /**
   * Redirect path if already authenticated (default: /)
   */
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/',
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || redirectTo;

  // Redirect to home/intended page if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Render public content
  return <>{children}</>;
};
