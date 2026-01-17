/**
 * Request Builder
 * Constructs headers and validates request parameters
 */

import { ValidationError } from "@/services/core/errors";

import {
  getAuthToken,
  getRefreshToken,
  isTokenExpiringSoon,
} from "./auth-manager";
import { refreshAccessToken } from "./token-refresh";

let isRefreshing = false;

/**
 * Ensure token is valid before building headers
 * Proactively refreshes if token is expiring soon
 */
async function ensureValidToken(): Promise<void> {
  // During SSR, skip token refresh logic
  if (typeof window === "undefined") {
    return;
  }

  if (isRefreshing) {
    // Already refreshing, wait until it's done
    while (isRefreshing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    // Re-check just in case
    if (!isTokenExpiringSoon(5)) {
      return;
    }
  }

  if (isTokenExpiringSoon(5)) {
    const refreshToken = getRefreshToken();
    if (refreshToken && !isRefreshing) {
      isRefreshing = true;
      try {
        await refreshAccessToken(refreshToken);
      } catch (error) {
        console.error("[RequestBuilder] Token refresh failed:", error);
      } finally {
        isRefreshing = false;
      }
    }
  }
}

/**
 * Build headers for requests
 * Includes authentication token if available
 */
export async function buildHeaders(
  customHeaders: HeadersInit = {}
): Promise<HeadersInit> {
  // Try to refresh token if needed
  await ensureValidToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // CSRF protection
    ...(customHeaders as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Validate endpoint parameter
 */
export function validateEndpoint(endpoint: string, methodName: string): void {
  if (!endpoint || endpoint.trim() === "") {
    console.error(
      `[ApiClient.${methodName}] Invalid endpoint parameter. Endpoint:`,
      endpoint
    );
    console.trace();
    throw new ValidationError(
      `[ApiClient.${methodName}] Invalid endpoint parameter`
    );
  }
  if (!endpoint.startsWith("/")) {
    throw new ValidationError(
      `[ApiClient.${methodName}] Endpoint must start with /`
    );
  }
}

/**
 * Validate data object parameter
 */
export function validateData(data: unknown, methodName: string): void {
  // Allow FormData, objects, undefined, and null
  if (data !== undefined && data !== null && typeof data !== "object") {
    throw new ValidationError(
      `[ApiClient.${methodName}] Data must be an object, FormData, or undefined`
    );
  }
}

/**
 * Build complete URL with query parameters
 */
export function buildURL(
  baseURL: string,
  endpoint: string,
  origin: string,
  params?: Record<string, unknown>
): URL {
  const fullUrl = baseURL ? `${baseURL}${endpoint}` : endpoint;
  const url = new URL(fullUrl, origin);

  if (params) {
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        // Handle arrays by appending each item separately
        if (Array.isArray(value)) {
          value.forEach((item) => {
            url.searchParams.append(key, String(item));
          });
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  return url;
}
