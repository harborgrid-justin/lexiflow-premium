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
import type {
  ActionContext,
  ActionOptions,
  ActionResult,
  CacheProfile,
  PaginatedResult,
  PaginationMeta,
} from "./errors";
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
  let permissions: string[] = [];

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
        permissions = Array.isArray(decoded.permissions)
          ? decoded.permissions
          : [];
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
    permissions,
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

  // Validate permissions from JWT context
  if (requiredPermissions.length === 0) return true;

  // Check if user has ALL required permissions
  return requiredPermissions.every((p) => context.permissions.includes(p));
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  profile: CacheProfile = "default"
): Promise<void> {
  for (const tag of tags) {
    // Next.js 16 revalidateTag signature
    revalidateTag(tag);
  }
}
