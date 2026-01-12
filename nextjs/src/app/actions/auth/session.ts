'use server';

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                LEXIFLOW AUTHENTICATION SERVER ACTIONS                     ║
 * ║          Secure Session Management with HttpOnly Cookies                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * All authentication must use HttpOnly cookies to prevent XSS attacks.
 * Never store JWT tokens in localStorage or expose them to client-side code.
 *
 * @module app/actions/auth/session
 * @security Critical - Session management and authentication
 * @author LexiFlow Engineering Team
 * @since 2026-01-12 (Security Hardening)
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthApiService } from '@/api/auth/auth-api';
import type { AuthUser } from '@/providers/authTypes';

const AUTH_COOKIE_NAME = 'auth_token';
const REFRESH_COOKIE_NAME = 'refresh_token';
const USER_COOKIE_NAME = 'user_data';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Convert API user response to AuthUser format
 */
function toAuthUser(apiUser: any): AuthUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.firstName
      ? `${apiUser.firstName} ${apiUser.lastName}`.trim()
      : apiUser.email.split('@')[0],
    role: (apiUser.role || 'attorney') as AuthUser['role'],
    avatarUrl: apiUser.avatarUrl,
    permissions: apiUser.permissions || [],
  };
}

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @returns Promise<{ success: boolean; error?: string; user?: AuthUser }>
 */
export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const authApi = new AuthApiService();
    const response = await authApi.login(email, password);

    const authUser = toAuthUser(response.user);
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, response.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (response.refreshToken) {
      cookieStore.set(REFRESH_COOKIE_NAME, response.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(authUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, user: authUser };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return { success: false, error: message };
  }
}

/**
 * Logout and clear all session data
 * @returns Promise<{ success: boolean }>
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const authApi = new AuthApiService();
    await authApi.logout();

    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);

    return { success: true };
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);

    return { success: true };
  }
}

/**
 * Get current authenticated user from session
 * @returns Promise<AuthUser | null>
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const authApi = new AuthApiService();
    const apiUser = await authApi.getCurrentUser();

    return toAuthUser(apiUser);
  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    return null;
  }
}

/**
 * Refresh authentication token
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function refreshTokenAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const authApi = new AuthApiService();
    const response = await authApi.refreshToken(refreshToken);

    cookieStore.set(AUTH_COOKIE_NAME, response.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });

    if (response.refreshToken) {
      cookieStore.set(REFRESH_COOKIE_NAME, response.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[Auth] Token refresh error:', error);
    const message =
      error instanceof Error ? error.message : 'Token refresh failed';
    return { success: false, error: message };
  }
}

/**
 * Validate current session
 * @returns Promise<{ valid: boolean; user?: AuthUser }>
 */
export async function validateSession(): Promise<{
  valid: boolean;
  user?: AuthUser;
}> {
  const user = await getCurrentUser();
  return { valid: user !== null, user: user || undefined };
}

/**
 * Require authentication (throws if not authenticated)
 * @returns Promise<AuthUser>
 * @throws Will redirect to login if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Check if user has specific permission
 * @param permission - Permission to check
 * @returns Promise<boolean>
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  return (
    user.permissions.includes(permission) || user.permissions.includes('*')
  );
}

/**
 * Check if user has specific role
 * @param role - Role to check
 * @returns Promise<boolean>
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  return user.role === role;
}

/**
 * Update user session data
 * @param updates - Partial user updates
 * @returns Promise<{ success: boolean; user?: AuthUser }>
 */
export async function updateUserSession(
  updates: Partial<AuthUser>
): Promise<{ success: boolean; user?: AuthUser }> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false };
    }

    const updatedUser = { ...currentUser, ...updates };
    const cookieStore = await cookies();

    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(updatedUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('[Auth] Update user session error:', error);
    return { success: false };
  }
}
