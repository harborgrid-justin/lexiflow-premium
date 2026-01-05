/**
 * Auth Utility Functions for Route Loaders
 *
 * Server-side authentication utilities for React Router v7 loaders.
 * Separated from AuthProvider to maintain Fast Refresh compatibility.
 *
 * @module providers/authUtils
 */

import type { AuthUser } from "./authTypes";

// ============================================================================
// Utility Functions for Loaders
// ============================================================================

/**
 * Get current user from request cookies/headers
 * Use in route loaders for SSR authentication
 */
export async function getAuthUser(_request: Request): Promise<AuthUser | null> {
  // TODO: Implement actual session/JWT validation from request
  // const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  // if (!token) return null;
  // return await validateAndDecodeToken(token);

  // Placeholder - in real app, validate server-side
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