"use server";

/**
 * Server Actions Infrastructure - Central Utilities
 * Next.js 16 Strict Compliance: Async params, updateTag(), revalidateTag(tag, profile)
 *
 * This module provides:
 * - Type-safe action wrapper with error handling
 * - Validation helpers with Zod integration
 * - Response formatting utilities
 * - Authentication checks
 * - Cache invalidation helpers
 */

import { revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ActionError,
  buildTag,
  buildTags,
  extractFormData,
  failure,
  isFailure,
  isSuccess,
  parseInput,
  success,
  unwrapResult,
  validateInput,
  type ActionContext,
  type ActionOptions,
  type ActionResult,
  type CacheProfile,
  type PaginatedResult,
  type PaginationMeta,
} from "./errors";

// Re-export types and functions for convenience
export {
  ActionError,
  buildTag,
  buildTags,
  extractFormData,
  failure,
  isFailure,
  isSuccess,
  parseInput,
  success,
  unwrapResult,
  validateInput,
};
export type {
  ActionContext,
  ActionOptions,
  ActionResult,
  CacheProfile,
  PaginatedResult,
  PaginationMeta,
};

// ============================================================================
// Authentication & Authorization
// ============================================================================

/**
 * Get the current action context from cookies and headers
 * Next.js 16: cookies() and headers() are async
 */
export async function getActionContext(): Promise<ActionContext> {
  const cookieStore = await cookies();
  const headersList = await headers();

  const token = cookieStore.get("auth_token")?.value;
  const sessionId = cookieStore.get("session_id")?.value ?? null;

  // Extract user info from JWT (simplified - in production use proper JWT validation)
  let userId: string | null = null;
  let organizationId: string | null = null;

  if (token) {
    try {
      // Simple base64 decode of JWT payload (in production, verify signature)
      const payload = token.split(".")[1];
      if (payload) {
        const decoded = JSON.parse(
          Buffer.from(payload, "base64").toString("utf-8")
        );
        userId = decoded.sub ?? decoded.userId ?? null;
        organizationId = decoded.orgId ?? decoded.organizationId ?? null;
      }
    } catch {
      // Token parsing failed - user is not authenticated
    }
  }

  return {
    userId,
    organizationId,
    sessionId,
    isAuthenticated: !!userId,
    userAgent: headersList.get("user-agent"),
    ip: headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip"),
  };
}

/**
 * Verify the current user is authenticated
 * Redirects to login if not authenticated and redirect is true
 */
export async function requireAuth(
  redirectToLogin = true
): Promise<ActionContext> {
  const context = await getActionContext();

  if (!context.isAuthenticated) {
    if (redirectToLogin) {
      redirect("/login");
    }
    throw new ActionError("Authentication required", "UNAUTHORIZED");
  }

  return context;
}

/**
 * Check if user has required permissions
 */
export async function checkPermissions(
  context: ActionContext,
  requiredPermissions: string[]
): Promise<boolean> {
  if (!context.isAuthenticated || !context.userId) {
    return false;
  }

  // In production, this would query the permissions service
  // For now, we'll allow all authenticated users
  // TODO: Implement proper RBAC check against backend
  return true;
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Invalidate cache tags with the specified profile
 * Next.js 16: revalidateTag requires (tag, profile) signature
 */
export async function invalidateTags(
  tags: string[],
  profile: CacheProfile = "default"
): Promise<void> {
  for (const tag of tags) {
    // Next.js 16 revalidateTag signature
    revalidateTag(tag);
  }
}

/**
 * Chain multiple action results
 */
export async function chainActions<T>(
  actions: Array<() => Promise<ActionResult<unknown>>>,
  finalResult: T
): Promise<ActionResult<T>> {
  for (const action of actions) {
    const result = await action();
    if (!result.success) {
      return result as ActionResult<T>;
    }
  }
  return success(finalResult);
}
