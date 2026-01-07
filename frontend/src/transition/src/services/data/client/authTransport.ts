/**
 * Authentication Transport
 *
 * Handles authentication at the transport boundary.
 * Frontend never constructs auth headers or handles tokens directly.
 *
 * Enterprise pattern:
 * - Backend enforces authentication via httpOnly cookies
 * - Frontend includes credentials automatically
 * - No JWT parsing or token refresh in frontend
 *
 * @module services/data/client/authTransport
 */

import { buildApiUrl } from "./config";
import {
  HttpError,
  httpFetch,
  type HttpRequestInit,
  type HttpResponse,
} from "./httpClient";
import { tokenStorage } from "./tokenStorage";

export interface AuthenticatedRequestInit extends HttpRequestInit {
  /** Skip auth requirement (for public endpoints) */
  skipAuth?: boolean;
}

/**
 * Make authenticated request to backend
 *
 * Adds Authorization header with Bearer token.
 *
 * @param endpoint - API endpoint (relative to /api)
 * @param init - Request configuration
 * @returns Response data
 */
export async function authenticatedFetch<T = unknown>(
  endpoint: string,
  init?: AuthenticatedRequestInit
): Promise<HttpResponse<T>> {
  const url = buildApiUrl(endpoint);

  // Attach token if available
  const token = tokenStorage.getToken();
  const headers = { ...init?.headers };

  if (token && !init?.skipAuth) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    return await httpFetch<T>(url, { ...init, headers });
  } catch (error: unknown) {
    // Handle 401 Unauthorized - redirect to login
    if (error instanceof HttpError && error.status === 401 && !init?.skipAuth) {
      handleUnauthorized();
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error instanceof HttpError && error.status === 403) {
      handleForbidden();
    }

    throw error;
  }
}

/**
 * Handle unauthorized response (401)
 *
 * In production, this would redirect to login.
 * For now, we'll emit an event that AuthProvider can listen to.
 */
function handleUnauthorized(): void {
  // Clear any local state/tokens
  tokenStorage.clearTokens();

  if (typeof window !== "undefined") {
    // Dispatch custom event for AuthProvider to handle
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));

    // Redirect to login page only if not already there
    if (!window.location.pathname.includes("/login")) {
      window.location.href = `/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
    }
  }
}

/**
 * Handle forbidden response (403)
 *
 * User is authenticated but lacks permissions.
 */
function handleForbidden(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:forbidden"));
  }
}

/**
 * GET request with authentication
 */
export async function authGet<T = unknown>(
  endpoint: string,
  init?: AuthenticatedRequestInit
): Promise<T> {
  const response = await authenticatedFetch<T>(endpoint, {
    ...init,
    method: "GET",
  });
  return response.data;
}

/**
 * POST request with authentication
 */
export async function authPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  init?: AuthenticatedRequestInit
): Promise<T> {
  const response = await authenticatedFetch<T>(endpoint, {
    ...init,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.data;
}

/**
 * PUT request with authentication
 */
export async function authPut<T = unknown>(
  endpoint: string,
  body?: unknown,
  init?: AuthenticatedRequestInit
): Promise<T> {
  const response = await authenticatedFetch<T>(endpoint, {
    ...init,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.data;
}

/**
 * PATCH request with authentication
 */
export async function authPatch<T = unknown>(
  endpoint: string,
  body?: unknown,
  init?: AuthenticatedRequestInit
): Promise<T> {
  const response = await authenticatedFetch<T>(endpoint, {
    ...init,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.data;
}

/**
 * DELETE request with authentication
 */
export async function authDelete<T = unknown>(
  endpoint: string,
  init?: AuthenticatedRequestInit
): Promise<T> {
  const response = await authenticatedFetch<T>(endpoint, {
    ...init,
    method: "DELETE",
  });
  return response.data;
}
