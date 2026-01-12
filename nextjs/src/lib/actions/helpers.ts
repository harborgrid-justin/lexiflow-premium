/**
 * Action Helpers - Factory Functions and Utilities
 *
 * This file contains helper functions for creating server actions.
 * It does NOT have 'use server' directive since these are factory functions.
 */

import type {
  ActionContext,
  ActionOptions,
  ActionResult,
  CacheProfile,
} from "./errors";
import { ActionError, failure, success } from "./errors";

// Import server functions dynamically to avoid circular dependency issues
// with the "use server" directive in index.ts

// These will be provided by the server actions module
type GetActionContextFn = () => Promise<ActionContext>;
type CheckPermissionsFn = (
  context: ActionContext,
  permissions: string[]
) => Promise<boolean>;
type InvalidateTagsFn = (
  tags: string[],
  profile?: CacheProfile
) => Promise<void>;

// Store references to server-side functions
let getActionContextFn: GetActionContextFn | undefined;
let checkPermissionsFn: CheckPermissionsFn | undefined;
let invalidateTagsFn: InvalidateTagsFn | undefined;
let isInitialized = false;

/**
 * Lazy initialization - automatically imports and sets up dependencies
 */
async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;

  // Dynamic import to avoid circular dependency with "use server" directive
  const { getActionContext, checkPermissions, invalidateTags } =
    await import("./index");
  getActionContextFn = getActionContext;
  checkPermissionsFn = checkPermissions;
  invalidateTagsFn = invalidateTags;
  isInitialized = true;
}

/**
 * Initialize helpers with server-side functions (deprecated - now auto-initialized)
 * @deprecated This function is no longer needed as initialization is automatic
 */
export function initializeActionHelpers(
  getActionContext: GetActionContextFn,
  checkPermissions: CheckPermissionsFn,
  invalidateTags: InvalidateTagsFn
): void {
  getActionContextFn = getActionContext;
  checkPermissionsFn = checkPermissions;
  invalidateTagsFn = invalidateTags;
  isInitialized = true;
}

/**
 * Type-safe server action wrapper with authentication, validation, and error handling
 *
 * @example
 * ```typescript
 * export const createCase = createAction(
 *   async (input: CreateCaseInput, ctx) => {
 *     const validated = parseInput(createCaseSchema, input);
 *     const case = await api.createCase(validated, ctx.userId);
 *     return case;
 *   },
 *   { requireAuth: true, revalidateTags: ['cases'] }
 * );
 * ```
 */
export function createAction<TInput, TOutput>(
  handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
  options: ActionOptions = {}
): (input: TInput) => Promise<ActionResult<TOutput>> {
  const {
    requireAuth: shouldRequireAuth = false,
    requiredPermissions = [],
    revalidateTags = [],
    cacheProfile = "default",
    authErrorMessage = "You must be logged in to perform this action",
    auditLog = false,
  } = options;

  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // Ensure helpers are initialized
      await ensureInitialized();

      if (!getActionContextFn || !checkPermissionsFn || !invalidateTagsFn) {
        throw new Error("Action helpers not properly initialized");
      }

      // Get context
      const context = await getActionContextFn();

      // Check authentication
      if (shouldRequireAuth && !context.isAuthenticated) {
        return failure(authErrorMessage, "UNAUTHORIZED");
      }

      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasPermission = await checkPermissionsFn(
          context,
          requiredPermissions
        );
        if (!hasPermission) {
          return failure(
            "You do not have permission to perform this action",
            "FORBIDDEN"
          );
        }
      }

      // Execute the handler
      const result = await handler(input, context);

      // Invalidate cache tags on success
      if (revalidateTags.length > 0) {
        await invalidateTagsFn(revalidateTags, cacheProfile);
      }

      // Audit logging (simplified - in production, send to logging service)
      if (auditLog && context.userId) {
        console.log(`[AUDIT] User ${context.userId} performed action`, {
          timestamp: new Date().toISOString(),
          userId: context.userId,
          ip: context.ip,
        });
      }

      return success(result);
    } catch (error) {
      // Handle ActionError
      if (error instanceof ActionError) {
        return failure(error.message, error.code, error.details);
      }

      // Handle other errors
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("[Action Error]", error);

      return failure(message, "INTERNAL_ERROR");
    }
  };
}

/**
 * Create a mutation action that requires authentication by default
 */
export function createMutation<TInput, TOutput>(
  handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
  options: Omit<ActionOptions, "requireAuth"> = {}
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return createAction(handler, { ...options, requireAuth: true });
}

/**
 * Create a query action (read-only, may not require auth)
 */
export function createQuery<TInput, TOutput>(
  handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
  options: ActionOptions = {}
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return createAction(handler, { ...options, auditLog: false });
}

/**
 * Create a form action that handles FormData
 */
export function createFormAction<TOutput>(
  handler: (formData: FormData, context: ActionContext) => Promise<TOutput>,
  options: ActionOptions = {}
): (formData: FormData) => Promise<ActionResult<TOutput>> {
  return createAction(handler, options);
}
