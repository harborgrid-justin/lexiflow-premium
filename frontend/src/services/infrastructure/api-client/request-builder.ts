/**
 * Request Builder
 * Constructs headers and validates request parameters
 */

import { ValidationError } from "@/services/core/errors";
import { getAuthToken } from "./auth-manager";

/**
 * Build headers for requests
 * Includes authentication token if available
 */
export function buildHeaders(customHeaders: HeadersInit = {}): HeadersInit {
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
  if (data !== undefined && data !== null && typeof data !== "object") {
    throw new ValidationError(
      `[ApiClient.${methodName}] Data must be an object or undefined`
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
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, String(params[key]));
      }
    });
  }

  return url;
}
