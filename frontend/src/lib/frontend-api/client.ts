/**
 * Frontend API HTTP Client
 * Pure transport layer with no UI/React dependencies
 *
 * @module lib/frontend-api/client
 * @description Enterprise HTTP client per spec II & III:
 * - Pure function - no side effects
 * - No React imports allowed
 * - No context access allowed
 * - Returns Result<T> - never throws
 * - Maps backend errors to domain errors
 * - Handles retry with backoff
 * - Type-safe at boundaries
 *
 * POSITION IN SYSTEM:
 * Backend API → Frontend API Client → Domain API → Loaders → Context → Views
 *
 * RULES:
 * - Client handles transport only
 * - No validation logic (belongs in schemas)
 * - No normalization logic (belongs in normalizers)
 * - No caching logic (belongs in loaders/context)
 * - No optimism (belongs in actions)
 *
 * @example
 * ```typescript
 * const result = await client.get<Report>('/reports/123');
 * if (!result.ok) {
 *   return result; // Propagate error
 * }
 * return success(normalizeReport(result.data));
 * ```
 */

import { getApiBaseUrl, getApiPrefix } from "@/config/network/api.config";
import {
  extractFieldErrors,
  mapFetchError,
  mapHttpStatusToError,
  ValidationError,
} from "./errors";
import { failure, type Result, success } from "./types";

/**
 * Client configuration
 */
export interface ClientConfig {
  baseUrl?: string;
  apiPrefix?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Request options for individual calls
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  params?: Record<string, string | number | boolean>;
}

/**
 * Raw HTTP response wrapper
 */
interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

import {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
} from "@/services/infrastructure/api-client/auth-manager";
import { refreshAccessToken } from "@/services/infrastructure/api-client/token-refresh";

// Shared refresh state to prevent multiple concurrent refresh calls
let isRefreshing = false;

/**
 * Ensure token is valid before request
 * Proactively refreshes if token is expiring soon or tries to refresh on 401
 */
async function ensureValidToken(): Promise<void> {
  if (typeof window === "undefined") return;

  if (isRefreshing) {
    while (isRefreshing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }
}

/**
 * Handle token refresh logic
 */
async function handleTokenRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (isRefreshing) {
    await ensureValidToken();
    return !!getAuthToken();
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  isRefreshing = true;
  try {
    const success = await refreshAccessToken(refreshToken);
    return success;
  } catch (error) {
    console.error("[ApiClient] Token refresh failed:", error);
    return false;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Create configured HTTP client
 */
export function createClient(config: ClientConfig = {}) {
  const baseUrl = config.baseUrl || getApiBaseUrl();
  const apiPrefix = config.apiPrefix || getApiPrefix();
  const timeout = config.timeout || 30000;
  const defaultHeaders = config.headers || {};
  const retryAttempts = config.retryAttempts || 3;
  const retryDelay = config.retryDelay || 1000;

  /**
   * Build full URL with query params
   */
  function buildUrl(
    path: string,
    params?: Record<string, string | number | boolean>
  ): string {
    // In dev mode with empty baseUrl, construct path directly
    if (!baseUrl || baseUrl === "") {
      let fullPath = `${apiPrefix}${path}`;

      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
        const queryString = searchParams.toString();
        if (queryString) {
          fullPath += `?${queryString}`;
        }
      }

      return fullPath;
    }

    // For production with absolute baseUrl
    const url = new URL(`${apiPrefix}${path}`, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Get merged headers with auth token
   */
  function getHeaders(
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...defaultHeaders,
      ...customHeaders,
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Execute HTTP request with timeout and retry
   */
  async function request<T>(
    method: string,
    path: string,
    options: RequestOptions & { body?: unknown } = {}
  ): Promise<Result<T>> {
    const url = buildUrl(path, options.params);
    // Headers are now built inside the loop to get fresh token

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || timeout
    );

    // Combine signals if provided
    if (options.signal) {
      options.signal.addEventListener("abort", () => controller.abort());
    }

    let lastError: Error | undefined;

    // Retry loop
    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        // Ensure valid token before request
        await ensureValidToken();
        const headersWithToken = getHeaders(options.headers);

        const response = await fetch(url, {
          method,
          headers: headersWithToken,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401 && attempt < retryAttempts - 1) {
          console.warn(
            "[ApiClient] 401 Unauthorized, attempting token refresh"
          );
          const refreshed = await handleTokenRefresh();
          if (refreshed) {
            console.log("[ApiClient] Token refreshed, retrying request");
            continue; // Retry with new token
          } else {
            // Refresh failed, clear tokens
            clearAuthTokens();
          }
        }

        // Parse response
        const result = await parseResponse<T>(response);

        // Success - return data
        if (response.ok) {
          return success(result.data);
        }

        // Error - map to domain error
        const errorMessage = extractErrorMessage(result.data);
        const fieldErrors = extractFieldErrors(
          (result.data as Record<string, unknown>)?.errors
        );

        if (response.status === 400 && fieldErrors) {
          return failure(new ValidationError(errorMessage, fieldErrors));
        }

        return failure(
          mapHttpStatusToError(response.status, errorMessage, {
            response: result.data,
          })
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on abort
        if (lastError.name === "AbortError") {
          clearTimeout(timeoutId);
          return failure(mapFetchError(lastError));
        }

        // Retry with exponential backoff
        if (attempt < retryAttempts - 1) {
          await sleep(retryDelay * Math.pow(2, attempt));
          continue;
        }
      }
    }

    clearTimeout(timeoutId);

    // All retries failed
    return failure(mapFetchError(lastError));
  }

  /**
   * Parse HTTP response to typed data
   */
  async function parseResponse<T>(
    response: Response
  ): Promise<HttpResponse<T>> {
    let data: T;

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  /**
   * Extract error message from backend response
   */
  function extractErrorMessage(data: unknown): string {
    if (!data || typeof data !== "object") {
      return "An error occurred";
    }

    const obj = data as Record<string, unknown>;

    // Check common error message fields
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.detail === "string") return obj.detail;

    return "An error occurred";
  }

  return {
    /**
     * GET request
     */
    async get<T>(path: string, options?: RequestOptions): Promise<Result<T>> {
      return request<T>("GET", path, options);
    },

    /**
     * POST request
     */
    async post<T>(
      path: string,
      body?: unknown,
      options?: RequestOptions
    ): Promise<Result<T>> {
      return request<T>("POST", path, { ...options, body });
    },

    /**
     * PUT request
     */
    async put<T>(
      path: string,
      body?: unknown,
      options?: RequestOptions
    ): Promise<Result<T>> {
      return request<T>("PUT", path, { ...options, body });
    },

    /**
     * PATCH request
     */
    async patch<T>(
      path: string,
      body?: unknown,
      options?: RequestOptions
    ): Promise<Result<T>> {
      return request<T>("PATCH", path, { ...options, body });
    },

    /**
     * DELETE request
     */
    async delete<T>(
      path: string,
      options?: RequestOptions
    ): Promise<Result<T>> {
      return request<T>("DELETE", path, options);
    },
  };
}

// Remove duplicate local getAuthToken since we import it
/*
function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}
*/

/**
 * Sleep helper for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Default client instance
 * Singleton for convenience
 */
export const client = createClient();
