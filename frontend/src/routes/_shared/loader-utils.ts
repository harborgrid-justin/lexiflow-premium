/**
 * Loader Utilities for React Router v7 Routes
 *
 * Provides type-safe utilities for:
 * - Throwing HTTP error responses
 * - Creating JSON responses
 * - Handling authentication redirects
 * - Parallel data fetching
 *
 * @module routes/_shared/loader-utils
 */

import { redirect } from 'react-router';

// ============================================================================
// Error Response Utilities
// ============================================================================

/**
 * Throw a 404 Not Found response
 *
 * @example
 * ```tsx
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const caseData = await DataService.cases.get(params.caseId);
 *   if (!caseData) throwNotFound('Case not found');
 *   return { caseData };
 * }
 * ```
 */
export function throwNotFound(message = 'Not Found'): never {
  throw new Response(message, {
    status: 404,
    statusText: message,
  });
}

/**
 * Throw a 403 Forbidden response
 *
 * @example
 * ```tsx
 * export async function loader({ request }: Route.LoaderArgs) {
 *   const user = await getUser(request);
 *   if (!user.isAdmin) throwForbidden('Admin access required');
 *   return { adminData };
 * }
 * ```
 */
export function throwForbidden(message = 'Forbidden'): never {
  throw new Response(message, {
    status: 403,
    statusText: message,
  });
}

/**
 * Throw a 401 Unauthorized response (redirects to login)
 *
 * @example
 * ```tsx
 * export async function loader({ request }: Route.LoaderArgs) {
 *   const user = await getUser(request);
 *   if (!user) throwUnauthorized();
 *   return { userData };
 * }
 * ```
 */
export function throwUnauthorized(loginPath = '/login'): never {
  throw redirect(loginPath);
}

/**
 * Throw a 400 Bad Request response
 */
export function throwBadRequest(message = 'Bad Request'): never {
  throw new Response(message, {
    status: 400,
    statusText: message,
  });
}

/**
 * Throw a 500 Internal Server Error response
 */
export function throwServerError(message = 'Internal Server Error'): never {
  throw new Response(message, {
    status: 500,
    statusText: message,
  });
}

// ============================================================================
// JSON Response Utilities
// ============================================================================

/**
 * Create a JSON response with proper headers
 *
 * @example
 * ```tsx
 * export async function action({ request }: Route.ActionArgs) {
 *   const result = await processForm(request);
 *   return createJsonResponse({ success: true, data: result });
 * }
 * ```
 */
export function createJsonResponse<T>(
  data: T,
  init?: ResponseInit
): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

/**
 * Create an error JSON response
 */
export function createErrorResponse(
  error: string,
  status = 400,
  fieldErrors?: Record<string, string>
): Response {
  return createJsonResponse(
    {
      success: false,
      error,
      fieldErrors,
    },
    { status }
  );
}

/**
 * Create a success JSON response
 */
export function createSuccessResponse<T>(data?: T): Response {
  return createJsonResponse({
    success: true,
    data,
  });
}

// ============================================================================
// Form Data Utilities
// ============================================================================

/**
 * Parse form data and extract typed values
 *
 * @example
 * ```tsx
 * export async function action({ request }: Route.ActionArgs) {
 *   const { title, description, intent } = await parseFormData(request, [
 *     'title',
 *     'description',
 *     'intent',
 *   ]);
 *   // ...
 * }
 * ```
 */
export async function parseFormData<T extends string>(
  request: Request,
  fields: T[]
): Promise<Record<T, string | null>> {
  const formData = await request.formData();
  const result = {} as Record<T, string | null>;

  for (const field of fields) {
    const value = formData.get(field);
    result[field] = typeof value === 'string' ? value : null;
  }

  return result;
}

/**
 * Get the intent from form data (for multi-action forms)
 */
export async function getFormIntent(request: Request): Promise<string | null> {
  const formData = await request.formData();
  const intent = formData.get('intent');
  return typeof intent === 'string' ? intent : null;
}

// ============================================================================
// Parallel Fetching Utilities
// ============================================================================

/**
 * Fetch multiple resources in parallel, returning results and errors
 *
 * @example
 * ```tsx
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const results = await fetchParallel({
 *     caseData: () => DataService.cases.get(params.caseId),
 *     documents: () => DataService.documents.getByCaseId(params.caseId),
 *     parties: () => DataService.parties.getByCaseId(params.caseId),
 *   });
 *
 *   if (!results.caseData.data) throwNotFound('Case not found');
 *
 *   return {
 *     caseData: results.caseData.data,
 *     documents: results.documents.data || [],
 *     parties: results.parties.data || [],
 *   };
 * }
 * ```
 */
export async function fetchParallel<T extends Record<string, () => Promise<unknown>>>(
  fetchers: T
): Promise<{
  [K in keyof T]: {
    data: Awaited<ReturnType<T[K]>> | null;
    error: Error | null;
  };
}> {
  const keys = Object.keys(fetchers) as Array<keyof T>;
  const promises = keys.map((key) =>
    fetchers[key]()
      .then((data) => ({ key, data, error: null }))
      .catch((error) => ({ key, data: null, error }))
  );

  const results = await Promise.all(promises);

  return results.reduce(
    (acc, result) => {
      acc[result.key as keyof T] = {
        data: result.data as Awaited<ReturnType<T[keyof T]>> | null,
        error: result.error,
      };
      return acc;
    },
    {} as {
      [K in keyof T]: {
        data: Awaited<ReturnType<T[K]>> | null;
        error: Error | null;
      };
    }
  );
}

/**
 * Defer non-critical data for streaming
 * Returns a promise that can be used with React Router's Await component
 *
 * @example
 * ```tsx
 * export async function loader({ params }: Route.LoaderArgs) {
 *   // Critical data - await immediately
 *   const caseData = await DataService.cases.get(params.caseId);
 *
 *   return {
 *     caseData,
 *     // Deferred data - streams to client
 *     documents: deferData(() => DataService.documents.getByCaseId(params.caseId)),
 *     analytics: deferData(() => DataService.analytics.getCaseMetrics(params.caseId)),
 *   };
 * }
 * ```
 */
export function deferData<T>(fetcher: () => Promise<T>): Promise<T> {
  // Simply return the promise - React Router will handle streaming
  return fetcher();
}

// ============================================================================
// Pagination Utilities
// ============================================================================

/**
 * Extract pagination params from URL search params
 */
export function getPaginationParams(request: Request): {
  page: number;
  pageSize: number;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
} {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
  const sortBy = url.searchParams.get('sortBy');
  const sortOrder = (url.searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  return {
    page: Math.max(1, page),
    pageSize: Math.min(100, Math.max(1, pageSize)),
    sortBy,
    sortOrder,
  };
}

/**
 * Extract filter params from URL search params
 */
export function getFilterParams(
  request: Request,
  allowedFilters: string[]
): Record<string, string> {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};

  for (const filter of allowedFilters) {
    const value = url.searchParams.get(filter);
    if (value) {
      filters[filter] = value;
    }
  }

  return filters;
}
