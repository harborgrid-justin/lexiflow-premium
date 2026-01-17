/**
 * Auth Utility Functions for Route Loaders
 *
 * Server-side authentication utilities for React Router v7 loaders.
 * Separated from AuthProvider to maintain Fast Refresh compatibility.
 *
 * @module providers/authUtils
 */

import { STORAGE_KEYS, StorageUtils } from "@/utils/storage";

import type { AuthUser } from "@/lib/auth";

// ============================================================================
// Utility Functions for Loaders
// ============================================================================

/**
 * Get current user from request cookies/headers
 * Use in route loaders for SSR authentication
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  void request;
  // Production implementation using StorageUtils for client-side auth
  const token = StorageUtils.get<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
  const user = StorageUtils.get<AuthUser | null>(
    STORAGE_KEYS.USER_SESSION,
    null,
  );

  if (token && user) {
    return user;
  }
  return null;
}

/**
 * Require authentication in route loader
 * Throws redirect to login if not authenticated
 */
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);

  if (!user) {
    // In React Router v7, throw a Response to redirect
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  return user;
}

/**
 * Require specific role(s) in route loader
 * Throws 403 if user doesn't have required role
 */
export async function requireRole(
  request: Request,
  ...roles: AuthUser["role"][]
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!roles.includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
