/**
 * Auth Proxy Module
 * Next.js 16 compliant authentication proxy (replaces middleware.ts)
 *
 * This module provides:
 * - Route protection with auth checks
 * - Session validation
 * - Role-based access control
 * - Token refresh handling
 * - CSRF validation
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { User, Session, UserRole } from './(auth)/types';

// ============================================================================
// Constants
// ============================================================================

const AUTH_COOKIE_NAME = 'auth_token';
const REFRESH_COOKIE_NAME = 'refresh_token';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/login-enhanced',
  '/login-enterprise',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/api/health',
];

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = [
  '/login',
  '/login-enhanced',
  '/login-enterprise',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'super_admin': 100,
  'admin': 80,
  'manager': 60,
  'attorney': 50,
  'paralegal': 40,
  'staff': 30,
  'guest': 10,
};

// ============================================================================
// Session Management (Cached)
// ============================================================================

/**
 * Get and validate session from auth cookie (cached per request)
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    // Decode JWT payload
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf8')
    );

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired - attempt refresh
      return null;
    }

    const user: User = payload.user || {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      role: payload.role || 'guest',
      permissions: payload.permissions || [],
      mfaEnabled: payload.mfaEnabled || false,
      emailVerified: payload.emailVerified || false,
      phoneVerified: payload.phoneVerified || false,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updatedAt || new Date().toISOString(),
    };

    return {
      user,
      accessToken: token,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      issuedAt: new Date(payload.iat * 1000).toISOString(),
    };
  } catch {
    return null;
  }
});

/**
 * Get current user (cached)
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user || null;
});

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

// ============================================================================
// Route Protection
// ============================================================================

/**
 * Check if a path is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path is an auth route (login, register, etc.)
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Protect a route - redirects to login if not authenticated
 * Use this in page components that require authentication
 */
export async function protectRoute(redirectTo: string = '/login'): Promise<Session> {
  const session = await getSession();

  if (!session) {
    // Get current path for redirect after login
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
    const searchParams = pathname ? `?from=${encodeURIComponent(pathname)}` : '';

    redirect(`${redirectTo}${searchParams}`);
  }

  return session;
}

/**
 * Protect a route with role requirement
 */
export async function protectRouteWithRole(
  requiredRole: UserRole,
  redirectTo: string = '/login'
): Promise<Session> {
  const session = await protectRoute(redirectTo);

  if (!hasRole(session.user, requiredRole)) {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * Protect a route with permission requirement
 */
export async function protectRouteWithPermission(
  requiredPermission: string,
  redirectTo: string = '/login'
): Promise<Session> {
  const session = await protectRoute(redirectTo);

  if (!hasPermission(session.user, requiredPermission)) {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * Redirect authenticated users away from auth pages
 * Use this in login/register pages
 */
export async function redirectIfAuthenticated(redirectTo: string = '/dashboard'): Promise<void> {
  const session = await getSession();

  if (session) {
    redirect(redirectTo);
  }
}

// ============================================================================
// Authorization Helpers
// ============================================================================

/**
 * Check if user has a specific role or higher
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;

  const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  // Super admin has all permissions
  if (user.role === 'super_admin') return true;

  return user.permissions?.includes(permission) || false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  return permissions.some(p => user.permissions?.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  return permissions.every(p => user.permissions?.includes(p));
}

// ============================================================================
// Request Metadata
// ============================================================================

/**
 * Get client IP address
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Get user agent
 */
export async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get('user-agent') || 'unknown';
}

/**
 * Get request origin
 */
export async function getOrigin(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('origin');
}

/**
 * Get referer
 */
export async function getReferer(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('referer');
}

// ============================================================================
// CSRF Protection
// ============================================================================

/**
 * Validate CSRF token from request
 */
export async function validateCSRF(token: string): Promise<boolean> {
  if (!token) return false;

  const cookieStore = await cookies();
  const storedToken = cookieStore.get('csrf_token')?.value;

  return storedToken === token;
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('csrf_token')?.value || null;
}

// ============================================================================
// Session Utilities
// ============================================================================

/**
 * Check if session is about to expire (within 5 minutes)
 */
export async function isSessionExpiring(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const expiresAt = new Date(session.expiresAt).getTime();
  const fiveMinutes = 5 * 60 * 1000;

  return Date.now() > expiresAt - fiveMinutes;
}

/**
 * Check if refresh token exists
 */
export async function hasRefreshToken(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get(REFRESH_COOKIE_NAME)?.value;
}

// ============================================================================
// Server Component Helpers
// ============================================================================

/**
 * Create a protected server component wrapper
 * Usage: const session = await withAuth();
 */
export async function withAuth(): Promise<Session> {
  return protectRoute();
}

/**
 * Create a protected server component wrapper with role
 * Usage: const session = await withRole('admin');
 */
export async function withRole(role: UserRole): Promise<Session> {
  return protectRouteWithRole(role);
}

/**
 * Create a protected server component wrapper with permission
 * Usage: const session = await withPermission('users:read');
 */
export async function withPermission(permission: string): Promise<Session> {
  return protectRouteWithPermission(permission);
}

// ============================================================================
// API Route Helpers
// ============================================================================

/**
 * Validate auth token for API routes
 * Returns the session if valid, null otherwise
 */
export async function validateApiAuth(): Promise<Session | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    // Fall back to cookie auth
    return getSession();
  }

  const token = authHeader.slice(7);

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf8')
    );

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    const user: User = payload.user || {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      role: payload.role || 'guest',
      permissions: payload.permissions || [],
      mfaEnabled: payload.mfaEnabled || false,
      emailVerified: payload.emailVerified || false,
      phoneVerified: payload.phoneVerified || false,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updatedAt || new Date().toISOString(),
    };

    return {
      user,
      accessToken: token,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      issuedAt: new Date(payload.iat * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Require auth for API routes
 * Throws an error if not authenticated
 */
export async function requireApiAuth(): Promise<Session> {
  const session = await validateApiAuth();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Require specific role for API routes
 */
export async function requireApiRole(role: UserRole): Promise<Session> {
  const session = await requireApiAuth();

  if (!hasRole(session.user, role)) {
    throw new Error('Forbidden');
  }

  return session;
}

/**
 * Require specific permission for API routes
 */
export async function requireApiPermission(permission: string): Promise<Session> {
  const session = await requireApiAuth();

  if (!hasPermission(session.user, permission)) {
    throw new Error('Forbidden');
  }

  return session;
}

// ============================================================================
// Server Action Integration
// ============================================================================

/**
 * Get auth context for Server Actions
 * Returns structured context for use in action handlers
 */
export async function getActionAuthContext(): Promise<{
  userId: string | null;
  organizationId: string | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  session: Session | null;
}> {
  const session = await getSession();

  if (!session) {
    return {
      userId: null,
      organizationId: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
      session: null,
    };
  }

  return {
    userId: session.user.id,
    organizationId: (session.user as Record<string, unknown>).organizationId as string | null ?? null,
    role: session.user.role,
    permissions: session.user.permissions ?? [],
    isAuthenticated: true,
    session,
  };
}

/**
 * Require authentication for Server Actions
 * Use at the start of mutation actions
 */
export async function requireActionAuth(): Promise<{
  userId: string;
  organizationId: string | null;
  role: string;
  permissions: string[];
  session: Session;
}> {
  const context = await getActionAuthContext();

  if (!context.isAuthenticated || !context.session) {
    throw new Error('Authentication required');
  }

  return {
    userId: context.userId!,
    organizationId: context.organizationId,
    role: context.role!,
    permissions: context.permissions,
    session: context.session,
  };
}

/**
 * Require specific role for Server Actions
 */
export async function requireActionRole(requiredRole: UserRole): Promise<{
  userId: string;
  organizationId: string | null;
  role: string;
  session: Session;
}> {
  const context = await requireActionAuth();

  if (!hasRole(context.session.user, requiredRole)) {
    throw new Error('Insufficient permissions');
  }

  return context;
}

/**
 * Require specific permission for Server Actions
 */
export async function requireActionPermission(requiredPermission: string): Promise<{
  userId: string;
  organizationId: string | null;
  role: string;
  session: Session;
}> {
  const context = await requireActionAuth();

  if (!hasPermission(context.session.user, requiredPermission)) {
    throw new Error('Insufficient permissions');
  }

  return context;
}

// ============================================================================
// Cookie Management for Server Actions
// ============================================================================

/**
 * Set authentication cookies after successful login
 * Call from login Server Action
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
  options: {
    maxAge?: number;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
  } = {}
): Promise<void> {
  const cookieStore = await cookies();
  const {
    maxAge = 60 * 60 * 24 * 7, // 7 days
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
  } = options;

  cookieStore.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge,
    path: '/',
  });

  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }
}

/**
 * Clear authentication cookies on logout
 * Call from logout Server Action
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  cookieStore.delete('csrf_token');
  cookieStore.delete('session_id');
}

/**
 * Refresh the access token using refresh token
 * Returns new access token or null if refresh failed
 */
export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return null;
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.accessToken) {
      // Update cookies with new tokens
      await setAuthCookies(data.accessToken, data.refreshToken);
      return data.accessToken;
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Route Configuration for Dynamic Protection
// ============================================================================

export interface RouteProtectionConfig {
  pattern: string;
  requireAuth: boolean;
  roles?: UserRole[];
  permissions?: string[];
  redirectTo?: string;
}

/**
 * Extended route protection configuration
 */
export const ROUTE_PROTECTION_CONFIG: RouteProtectionConfig[] = [
  // Dashboard
  { pattern: '/dashboard', requireAuth: true },
  { pattern: '/dashboard/*', requireAuth: true },

  // Cases - all authenticated users
  { pattern: '/cases', requireAuth: true },
  { pattern: '/cases/*', requireAuth: true },

  // Documents - all authenticated users
  { pattern: '/documents', requireAuth: true },
  { pattern: '/documents/*', requireAuth: true },

  // Clients - attorneys and above
  { pattern: '/clients', requireAuth: true, roles: ['attorney', 'manager', 'admin', 'super_admin'] },
  { pattern: '/clients/*', requireAuth: true, roles: ['attorney', 'manager', 'admin', 'super_admin'] },

  // Matters - attorneys and above
  { pattern: '/matters', requireAuth: true, roles: ['attorney', 'manager', 'admin', 'super_admin'] },
  { pattern: '/matters/*', requireAuth: true, roles: ['attorney', 'manager', 'admin', 'super_admin'] },

  // Billing - managers and above
  { pattern: '/billing', requireAuth: true, roles: ['manager', 'admin', 'super_admin'] },
  { pattern: '/billing/*', requireAuth: true, roles: ['manager', 'admin', 'super_admin'] },
  { pattern: '/invoices', requireAuth: true, roles: ['manager', 'admin', 'super_admin'] },
  { pattern: '/invoices/*', requireAuth: true, roles: ['manager', 'admin', 'super_admin'] },

  // Trust accounting - admin only
  { pattern: '/trust-accounting', requireAuth: true, roles: ['admin', 'super_admin'] },
  { pattern: '/trust-accounting/*', requireAuth: true, roles: ['admin', 'super_admin'] },

  // Admin routes
  { pattern: '/admin', requireAuth: true, roles: ['admin', 'super_admin'] },
  { pattern: '/admin/*', requireAuth: true, roles: ['admin', 'super_admin'] },
  { pattern: '/users', requireAuth: true, roles: ['admin', 'super_admin'] },
  { pattern: '/users/*', requireAuth: true, roles: ['admin', 'super_admin'] },
  { pattern: '/permissions', requireAuth: true, roles: ['super_admin'] },
  { pattern: '/audit-logs', requireAuth: true, roles: ['admin', 'super_admin'] },
  { pattern: '/system-settings', requireAuth: true, roles: ['super_admin'] },
];

/**
 * Check if path matches a pattern (with wildcard support)
 */
function matchRoutePath(path: string, pattern: string): boolean {
  if (pattern === path) return true;
  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2);
    return path === base || path.startsWith(`${base}/`);
  }
  return false;
}

/**
 * Get protection config for a specific path
 */
export function getRouteProtection(pathname: string): RouteProtectionConfig | null {
  for (const config of ROUTE_PROTECTION_CONFIG) {
    if (matchRoutePath(pathname, config.pattern)) {
      return config;
    }
  }
  return null;
}

/**
 * Check route access based on configuration
 */
export async function checkRouteAccess(pathname: string): Promise<{
  allowed: boolean;
  reason?: 'unauthenticated' | 'role' | 'permission';
  redirectTo?: string;
}> {
  const config = getRouteProtection(pathname);

  // No config = public route
  if (!config || !config.requireAuth) {
    return { allowed: true };
  }

  const session = await getSession();

  // Not authenticated
  if (!session) {
    return {
      allowed: false,
      reason: 'unauthenticated',
      redirectTo: config.redirectTo || '/login',
    };
  }

  // Check roles
  if (config.roles && config.roles.length > 0) {
    const hasRequiredRole = config.roles.some(role => hasRole(session.user, role));
    if (!hasRequiredRole) {
      return {
        allowed: false,
        reason: 'role',
        redirectTo: '/unauthorized',
      };
    }
  }

  // Check permissions
  if (config.permissions && config.permissions.length > 0) {
    const hasRequiredPermission = hasAnyPermission(session.user, config.permissions);
    if (!hasRequiredPermission) {
      return {
        allowed: false,
        reason: 'permission',
        redirectTo: '/unauthorized',
      };
    }
  }

  return { allowed: true };
}
