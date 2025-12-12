/**
 * Auth Routes Configuration
 * Defines all authentication-related routes
 */

import React, { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';

// Lazy load auth pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const TwoFactorPage = lazy(() => import('../pages/auth/TwoFactorPage'));
const OAuthCallbackPage = lazy(() => import('../pages/auth/OAuthCallbackPage'));

/**
 * Authentication routes
 * All wrapped with PublicRoute to prevent access when authenticated
 */
export const authRoutes: RouteObject[] = [
  {
    path: '/auth/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/auth/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/auth/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/auth/reset-password',
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/auth/two-factor',
    element: <TwoFactorPage />, // Not wrapped - needs special handling
  },
  {
    path: '/auth/callback',
    element: <OAuthCallbackPage />, // OAuth callback - no auth check
  },
];

export default authRoutes;
