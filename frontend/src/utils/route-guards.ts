/**
 * Route Guard Utilities
 *
 * Provides utilities for protecting routes based on:
 * - Authentication status
 * - User roles
 * - User permissions
 *
 * These utilities are used in route loaders to enforce access control
 *
 * @module utils/route-guards
 */

import type { AuthUser } from '@/providers/application/AuthProvider';

// ============================================================================
// Constants
// ============================================================================

const AUTH_STORAGE_KEY = "lexiflow_auth_token";
const AUTH_USER_KEY = "lexiflow_auth_user";

// ============================================================================
// Types
// ============================================================================

export type UserRole = "admin" | "attorney" | "paralegal" | "client";

export interface RouteGuardResult {
  authenticated: boolean;
  user: AuthUser | null;
}

// ============================================================================
// Authentication Guards
// ============================================================================

/**
 * Get current authenticated user from storage
 * @returns AuthUser if authenticated, null otherwise
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    const userJson = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !userJson) {
      return null;
    }

    return JSON.parse(userJson) as AuthUser;
  } catch (error) {
    console.error("[RouteGuards] Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * Use in route loaders to require authentication
 *
 * @param request - Request object from loader
 * @returns RouteGuardResult with user data
 * @throws Response with redirect to login if not authenticated
 */
export function requireAuthentication(request: Request): RouteGuardResult {
  const user = getCurrentUser();

  if (!user) {
    const url = new URL(request.url);
    const redirect = encodeURIComponent(url.pathname + url.search);

    throw new Response(null, {
      status: 302,
      headers: {
        Location: `/login?redirect=${redirect}`,
      },
    });
  }

  return { authenticated: true, user };
}

/**
 * Check if user is already authenticated (for login/register pages)
 * Redirects to dashboard if already logged in
 *
 * @param request - Request object from loader
 * @returns RouteGuardResult
 * @throws Response with redirect to dashboard if authenticated
 */
export function requireGuest(request: Request): RouteGuardResult {
  const user = getCurrentUser();

  // Log request metadata for security auditing
  const userAgent = request.headers.get("User-Agent") || "Unknown";
  const referer = request.headers.get("Referer") || "Direct";
  console.debug(`Guest route access: ${userAgent}, from: ${referer}`);

  if (user) {
    // Already authenticated - redirect to dashboard
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
  }

  return { authenticated: false, user: null };
}

// ============================================================================
// Role-Based Guards
// ============================================================================

/**
 * Require user to have one of the specified roles
 *
 * @param request - Request object from loader
 * @param allowedRoles - Array of roles that can access the route
 * @returns RouteGuardResult with user data
 * @throws Response with 403 Forbidden if user doesn't have required role
 */
export function requireRole(
  _request: Request,
  ...allowedRoles: UserRole[]
): RouteGuardResult {
  const { user } = requireAuthentication(_request);

  if (!user) {
    throw new Response("Forbidden - Insufficient permissions", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  const hasRequiredRole = allowedRoles.some((role) => role === user.role);
  if (!hasRequiredRole) {
    throw new Response("Forbidden - Insufficient permissions", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return { authenticated: true, user };
}

/**
 * Require user to be an admin
 *
 * @param request - Request object from loader
 * @returns RouteGuardResult with user data
 * @throws Response with 403 Forbidden if user is not an admin
 */
export function requireAdmin(request: Request): RouteGuardResult {
  return requireRole(request, "admin");
}

/**
 * Require user to be an attorney or admin
 *
 * @param request - Request object from loader
 * @returns RouteGuardResult with user data
 * @throws Response with 403 Forbidden if user doesn't have required role
 */
export function requireAttorney(request: Request): RouteGuardResult {
  return requireRole(request, "admin", "attorney");
}

/**
 * Require user to be attorney, paralegal, or admin
 *
 * @param request - Request object from loader
 * @returns RouteGuardResult with user data
 * @throws Response with 403 Forbidden if user doesn't have required role
 */
export function requireStaff(request: Request): RouteGuardResult {
  return requireRole(request, "admin", "attorney", "paralegal");
}

// ============================================================================
// Permission-Based Guards
// ============================================================================

/**
 * Require user to have specific permission
 *
 * @param request - Request object from loader
 * @param permission - Permission string to check
 * @returns RouteGuardResult with user data
 * @throws Response with 403 Forbidden if user doesn't have permission
 */
export function requirePermission(
  _request: Request,
  permission: string
): RouteGuardResult {
  const { user } = requireAuthentication(_request);

  if (!user || !user.permissions.includes(permission)) {
    throw new Response("Forbidden - Missing required permission", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return { authenticated: true, user };
}

/**
 * Require user to have ALL of the specified permissions
 *
 * @param request - Request object from loader
 * @param permissions - Array of permission strings to check
 * @returns RouteGuardResult with user data
 * @throws Response with 403 Forbidden if user doesn't have all permissions
 */
export function requireAllPermissions(
  _request: Request,
  permissions: string[]
): RouteGuardResult {
  const { user } = requireAuthentication(_request);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const hasAllPermissions = permissions.every((perm) =>
    user.permissions.includes(perm)
  );

  if (!hasAllPermissions) {
    throw new Response("Forbidden - Missing required permissions", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return { authenticated: true, user };
}

/**
 * Require user to have ANY of the specified permissions
 *
 * @param request - Request object from loader
 * @param permissions - Array of permission strings to check
 * @returns RouteGuardResult with user data
 * @throws Response with 403 Forbidden if user doesn't have any permission
 */
export function requireAnyPermission(
  _request: Request,
  permissions: string[]
): RouteGuardResult {
  const { user } = requireAuthentication(_request);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const hasAnyPermission = permissions.some((perm) =>
    user.permissions.includes(perm)
  );

  if (!hasAnyPermission) {
    throw new Response("Forbidden - Missing required permissions", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  return { authenticated: true, user };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if current user has a specific role (without throwing)
 *
 * @param role - Role to check
 * @returns true if user has the role, false otherwise
 */
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

/**
 * Check if current user has any of the specified roles (without throwing)
 *
 * @param roles - Roles to check
 * @returns true if user has any of the roles, false otherwise
 */
export function hasAnyRole(...roles: UserRole[]): boolean {
  const user = getCurrentUser();
  return user ? roles.some((role) => role === user.role) : false;
}

/**
 * Check if current user has a specific permission (without throwing)
 *
 * @param permission - Permission to check
 * @returns true if user has the permission, false otherwise
 */
export function hasPermission(permission: string): boolean {
  const user = getCurrentUser();
  return user?.permissions.includes(permission) ?? false;
}

/**
 * Check if current user has all of the specified permissions (without throwing)
 *
 * @param permissions - Permissions to check
 * @returns true if user has all permissions, false otherwise
 */
export function hasAllPermissions(permissions: string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return permissions.every((perm) => user.permissions.includes(perm));
}

/**
 * Check if current user has any of the specified permissions (without throwing)
 *
 * @param permissions - Permissions to check
 * @returns true if user has any permission, false otherwise
 */
export function hasAnyPermission(permissions: string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return permissions.some((perm) => user.permissions.includes(perm));
}

// ============================================================================
// Loaders
// ============================================================================

/**
 * Standard authentication guard for React Router loaders.
 * Checks for stored credentials and redirects to login if missing.
 * Supports auto-login in generic development environment.
 */
export async function requireAuthLoader({ request }: { request: Request }) {
  // Client-side check only
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    const userJson = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !userJson) {
      // In development, try to auto-login
      if (import.meta.env.DEV) {
        try {
          const { performAutoLogin } = await import('@/utils/dev-auto-login');
          const autoLoginSuccess = await performAutoLogin();

          if (autoLoginSuccess) {
            const newToken = localStorage.getItem(AUTH_STORAGE_KEY);
            const newUserJson = localStorage.getItem(AUTH_USER_KEY);
            
            if (newToken && newUserJson) {
               return { authenticated: true, user: JSON.parse(newUserJson) };
            }
          }
        } catch (e) {
          console.warn('Auto-login failed', e);
        }
      }

      const url = new URL(request.url);
      throw new Response(null, {
        status: 302,
        headers: {
          Location: `/login?redirect=${encodeURIComponent(url.pathname)}`,
        },
      });
    }

    try {
      const user = JSON.parse(userJson);
      return { authenticated: true, user };
    } catch {
       throw new Response(null, {
        status: 302,
        headers: { Location: '/login' },
      });
    }
  }
  
  return { authenticated: true };
}
