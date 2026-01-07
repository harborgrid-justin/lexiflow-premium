/**
 * HTTP Client
 *
 * Base HTTP client with automatic cookie-based authentication.
 * All requests automatically include credentials for cookie transport.
 *
 * Enterprise pattern: Frontend never handles auth tokens directly.
 * Backend authentication is enforced via httpOnly cookies.
 *
 * @module services/data/client/httpClient
 */

import { getBackendConfig } from "./config";

export interface HttpRequestInit extends RequestInit {
  /** Query parameters to append to URL */
  params?: Record<string, string | number | boolean>;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}

/**
 * Core HTTP fetch with automatic authentication
 *
 * @param input - URL or Request object
 * @param init - Request configuration
 * @returns Parsed response data
 */
export async function httpFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  const config = getBackendConfig();
  const { params, timeout = 30000, ...fetchInit } = init || {};

  // Build URL with query params
  const url = typeof input === "string" ? buildUrl(input, params) : input;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchInit,
      signal: controller.signal,
      // CRITICAL: Always include credentials for cookie-based auth
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...fetchInit.headers,
      },
    });

    clearTimeout(timeoutId);

    // Parse response
    let data: T;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else if (contentType?.includes("text/")) {
      data = (await response.text()) as T;
    } else {
      data = (await response.blob()) as T;
    }

    // Handle error responses
    if (!response.ok) {
      throw new HttpError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new HttpError("Request timeout", 408);
      }
      throw new HttpError(error.message, 0);
    }

    throw new HttpError("Unknown error", 0);
  }
}

/**
 * GET request
 */
export async function httpGet<T = unknown>(
  url: string,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, { ...init, method: "GET" });
}

/**
 * POST request
 */
export async function httpPost<T = unknown>(
  url: string,
  body?: unknown,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, {
    ...init,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function httpPut<T = unknown>(
  url: string,
  body?: unknown,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, {
    ...init,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request
 */
export async function httpPatch<T = unknown>(
  url: string,
  body?: unknown,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, {
    ...init,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function httpDelete<T = unknown>(
  url: string,
  init?: HttpRequestInit
): Promise<HttpResponse<T>> {
  return httpFetch<T>(url, { ...init, method: "DELETE" });
}
