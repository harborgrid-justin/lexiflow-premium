/**
 * Enhanced Loader Utilities for React Router v7 Routes
 *
 * Provides type-safe utilities for:
 * - Combining multiple loaders
 * - Adding auth guards to loaders
 * - Validating route parameters
 * - Composing loader pipelines
 *
 * @module routes/_shared/loaderUtils
 */

import { redirect, type LoaderFunctionArgs } from 'react-router';

import { throwForbidden, throwNotFound, throwUnauthorized } from './loader-utils';

// Note: These utilities extend the existing loader-utils.ts
// Export everything from base loader-utils
export * from './loader-utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Loader function type compatible with React Router v7
 */
export type LoaderFunction<T = unknown> = (
  args: LoaderFunctionArgs
) => Promise<T> | T;

/**
 * Auth check function for loader guards
 */
export type AuthCheckFunction = (
  args: LoaderFunctionArgs
) => Promise<AuthCheckResult> | AuthCheckResult;

/**
 * Result from auth check
 */
export interface AuthCheckResult {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** User object if authenticated */
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  /** Optional redirect path */
  redirectTo?: string;
}

/**
 * Options for auth loader wrapper
 */
export interface WithAuthLoaderOptions {
  /** Require admin role */
  requireAdmin?: boolean;
  /** Require attorney role */
  requireAttorney?: boolean;
  /** Require staff role */
  requireStaff?: boolean;
  /** Require specific roles */
  requireRoles?: string[];
  /** Require specific permissions */
  requirePermissions?: string[];
  /** Custom redirect path */
  redirectTo?: string;
  /** Custom auth check function */
  authCheck?: AuthCheckFunction;
}

// ============================================================================
// Loader Composition Utilities
// ============================================================================

/**
 * Combine multiple loaders into a single loader
 *
 * All loaders run in parallel and their results are merged.
 * If any loader throws, the error propagates immediately.
 *
 * @example
 * ```tsx
 * const combinedLoader = combineLoaders(
 *   async ({ params }) => ({ caseData: await getCaseData(params.caseId) }),
 *   async ({ params }) => ({ documents: await getDocuments(params.caseId) }),
 *   async ({ params }) => ({ parties: await getParties(params.caseId) })
 * );
 *
 * export { combinedLoader as loader };
 * ```
 */
export function combineLoaders<T extends Record<string, unknown>>(
  ...loaders: LoaderFunction[]
): LoaderFunction<T> {
  return async (args: LoaderFunctionArgs): Promise<T> => {
    const results = await Promise.all(
      loaders.map((loader) => loader(args))
    );

    // Merge all results into single object
    return results.reduce(
      (acc, result) => {
        if (typeof result === 'object' && result !== null) {
          return { ...acc, ...result };
        }
        return acc;
      },
      {} as T
    );
  };
}

/**
 * Chain loaders sequentially, passing data through pipeline
 *
 * Each loader receives the result of the previous loader as context.
 * Use when loaders depend on previous results.
 *
 * @example
 * ```tsx
 * const chainedLoader = chainLoaders(
 *   async ({ params }) => ({ userId: params.userId }),
 *   async ({ params }, prev) => ({
 *     ...prev,
 *     user: await getUser(prev.userId)
 *   }),
 *   async ({ params }, prev) => ({
 *     ...prev,
 *     cases: await getUserCases(prev.user.id)
 *   })
 * );
 * ```
 */
export function chainLoaders<T = unknown>(
  ...loaders: Array<
    (args: LoaderFunctionArgs, previousData?: unknown) => Promise<unknown> | unknown
  >
): LoaderFunction<T> {
  return async (args: LoaderFunctionArgs): Promise<T> => {
    let data: unknown = undefined;

    for (const loader of loaders) {
      data = await loader(args, data);
    }

    return data as T;
  };
}

// ============================================================================
// Auth Guard for Loaders
// ============================================================================

/**
 * Simple auth check that can be overridden
 * In production, this would integrate with your auth service
 */
async function defaultAuthCheck(
  args: LoaderFunctionArgs
): Promise<AuthCheckResult> {
  // This is a placeholder - in production, check session/token
  const authHeader = args.request.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      isAuthenticated: false,
      redirectTo: '/auth/login',
    };
  }

  // Placeholder user - replace with actual auth logic
  return {
    isAuthenticated: true,
    user: {
      id: '1',
      role: 'user',
      permissions: [],
    },
  };
}

/**
 * Wrap a loader with authentication checks
 *
 * Validates authentication and authorization before running loader.
 * Redirects or throws errors for unauthorized access.
 *
 * @example Basic auth
 * ```tsx
 * const protectedLoader = withAuthLoader(
 *   async ({ params }) => {
 *     return { data: await getData(params.id) };
 *   }
 * );
 * ```
 *
 * @example Role-based auth
 * ```tsx
 * const adminLoader = withAuthLoader(
 *   async ({ params }) => {
 *     return { adminData: await getAdminData() };
 *   },
 *   { requireAdmin: true }
 * );
 * ```
 *
 * @example Permission-based auth
 * ```tsx
 * const restrictedLoader = withAuthLoader(
 *   async ({ params }) => {
 *     return { data: await getData(params.id) };
 *   },
 *   { requirePermissions: ['cases.read', 'cases.write'] }
 * );
 * ```
 */
export function withAuthLoader<T = unknown>(
  loader: LoaderFunction<T>,
  options: WithAuthLoaderOptions = {}
): LoaderFunction<T> {
  return async (args: LoaderFunctionArgs): Promise<T> => {
    // Run auth check
    const authCheck = options.authCheck || defaultAuthCheck;
    const authResult = await authCheck(args);

    // Check authentication
    if (!authResult.isAuthenticated) {
      const redirectPath = options.redirectTo || authResult.redirectTo || '/auth/login';
      throw redirect(redirectPath);
    }

    // Check role-based access
    const user = authResult.user!;

    if (options.requireAdmin && user.role !== 'admin' && user.role !== 'Administrator') {
      throwForbidden('Administrator access required');
    }

    if (options.requireAttorney && !['attorney', 'Senior Partner', 'Partner', 'Associate'].includes(user.role)) {
      throwForbidden('Attorney access required');
    }

    if (options.requireStaff && !['staff', 'paralegal', 'Paralegal'].includes(user.role)) {
      throwForbidden('Staff access required');
    }

    if (options.requireRoles && options.requireRoles.length > 0) {
      if (!options.requireRoles.includes(user.role)) {
        throwForbidden('Insufficient role privileges');
      }
    }

    // Check permission-based access
    if (options.requirePermissions && options.requirePermissions.length > 0) {
      const hasAllPermissions = options.requirePermissions.every((permission) =>
        user.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        throwForbidden('Insufficient permissions');
      }
    }

    // All checks passed - run the loader
    return loader(args);
  };
}

// ============================================================================
// Parameter Validation
// ============================================================================

/**
 * Validate required route parameters
 *
 * Throws 400 Bad Request if required params are missing
 *
 * @example
 * ```tsx
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const validatedParams = validateParams(params, ['caseId', 'documentId']);
 *
 *   return {
 *     data: await getData(validatedParams.caseId, validatedParams.documentId)
 *   };
 * }
 * ```
 */
export function validateParams<T extends string>(
  params: Record<string, string | undefined>,
  required: T[]
): Record<T, string> {
  const validated: Record<string, string> = {};
  const missing: string[] = [];

  for (const key of required) {
    const value = params[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    } else {
      validated[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new Response(
      `Missing required parameters: ${missing.join(', ')}`,
      {
        status: 400,
        statusText: 'Bad Request',
      }
    );
  }

  return validated as Record<T, string>;
}

/**
 * Validate param exists and return it, or throw 404
 *
 * @example
 * ```tsx
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const caseId = requireParam(params, 'caseId');
 *   const caseData = await DataService.cases.get(caseId);
 *
 *   if (!caseData) throwNotFound('Case not found');
 *
 *   return { caseData };
 * }
 * ```
 */
export function requireParam(
  params: Record<string, string | undefined>,
  key: string
): string {
  const value = params[key];

  if (!value || value.trim() === '') {
    throwNotFound(`Required parameter '${key}' not found`);
  }

  return value;
}

/**
 * Get optional param with default value
 *
 * @example
 * ```tsx
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const page = getOptionalParam(params, 'page', '1');
 *   const pageSize = getOptionalParam(params, 'pageSize', '20');
 *
 *   return {
 *     data: await getData({
 *       page: parseInt(page),
 *       pageSize: parseInt(pageSize)
 *     })
 *   };
 * }
 * ```
 */
export function getOptionalParam(
  params: Record<string, string | undefined>,
  key: string,
  defaultValue: string
): string {
  const value = params[key];
  return value && value.trim() !== '' ? value : defaultValue;
}

// ============================================================================
// Convenience Loader Composers
// ============================================================================

/**
 * Create a loader that requires authentication
 *
 * Shorthand for withAuthLoader with no additional options
 *
 * @example
 * ```tsx
 * export const loader = requireAuth(async ({ params }) => {
 *   return { data: await getData(params.id) };
 * });
 * ```
 */
export function requireAuth<T = unknown>(
  loader: LoaderFunction<T>
): LoaderFunction<T> {
  return withAuthLoader(loader);
}

/**
 * Create a loader that requires admin role
 *
 * @example
 * ```tsx
 * export const loader = requireAdmin(async () => {
 *   return { adminData: await getAdminData() };
 * });
 * ```
 */
export function requireAdmin<T = unknown>(
  loader: LoaderFunction<T>
): LoaderFunction<T> {
  return withAuthLoader(loader, { requireAdmin: true });
}

/**
 * Create a loader that requires attorney role
 *
 * @example
 * ```tsx
 * export const loader = requireAttorney(async ({ params }) => {
 *   return { cases: await getCases() };
 * });
 * ```
 */
export function requireAttorney<T = unknown>(
  loader: LoaderFunction<T>
): LoaderFunction<T> {
  return withAuthLoader(loader, { requireAttorney: true });
}
