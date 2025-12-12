/**
 * Authentication Routes Configuration
 * Complete route configuration for all auth flows
 */

import React from 'react';
import { RouteObject } from 'react-router-dom';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import TwoFactorPage from '../pages/auth/TwoFactorPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage';
import AccountLockedPage from '../pages/auth/AccountLockedPage';

// Route Guards
import { PublicRoute } from './PublicRoute';

/**
 * Auth routes configuration
 * These routes are public and redirect to dashboard if already authenticated
 */
export const authRoutes: RouteObject[] = [
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'two-factor',
        element: (
          <PublicRoute>
            <TwoFactorPage />
          </PublicRoute>
        ),
      },
      {
        path: 'oauth/callback',
        element: <OAuthCallbackPage />,
      },
      {
        path: 'account-locked',
        element: <AccountLockedPage />,
      },
    ],
  },
];

export default authRoutes;
