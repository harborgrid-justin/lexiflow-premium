/**
 * HTTP Methods
 * Core REST methods: GET, POST, PUT, PATCH, DELETE
 */

import { AuthenticationError } from "@/services/core/errors";
import { buildBaseURL, DEFAULT_TIMEOUT, getOrigin } from "./config";
import {
  buildHeaders,
  buildURL,
  validateData,
  validateEndpoint,
} from "./request-builder";
import { handleResponse } from "./response-handler";

/**
 * GET request
 */
export async function get<T>(
  endpoint: string,
  options?: { params?: Record<string, unknown>; headers?: HeadersInit }
): Promise<T> {
  validateEndpoint(endpoint, "get");
  try {
    const baseURL = buildBaseURL();
    const params = options?.params;
    const url = buildURL(baseURL, endpoint, getOrigin(), params);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: await buildHeaders(options?.headers),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return get<T>(endpoint, options);
    }
    console.error("[HttpMethods.get] Error:", error);
    throw error;
  }
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  validateEndpoint(endpoint, "post");
  validateData(data, "post");
  try {
    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin());

    // Handle FormData separately (don't JSON stringify it)
    const isFormData = data instanceof FormData;
    const headers = await buildHeaders(options?.headers);

    // Remove Content-Type header for FormData (browser sets it with boundary)
    if (
      isFormData &&
      headers &&
      typeof headers === "object" &&
      "Content-Type" in headers
    ) {
      delete (headers as Record<string, string>)["Content-Type"];
    }

    const response = await fetch(url.toString(), {
      ...options, // Spread options first
      method: "POST", // Then override specific properties
      headers,
      body: isFormData
        ? (data as FormData)
        : data
          ? JSON.stringify(data)
          : undefined,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return post<T>(endpoint, data, options);
    }
    console.error("[HttpMethods.post] Error:", error);
    throw error;
  }
}

/**
 * PUT request
 */
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  validateEndpoint(endpoint, "put");
  validateData(data, "put");
  try {
    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin());

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: await buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return put<T>(endpoint, data);
    }
    console.error("[HttpMethods.put] Error:", error);
    throw error;
  }
}

/**
 * PATCH request
 */
export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  validateEndpoint(endpoint, "patch");
  validateData(data, "patch");
  try {
    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin());

    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: await buildHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return patch<T>(endpoint, data);
    }
    console.error("[HttpMethods.patch] Error:", error);
    throw error;
  }
}

/**
 * DELETE request
 */
export async function deleteFn<T>(endpoint: string): Promise<T> {
  validateEndpoint(endpoint, "delete");
  try {
    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin());

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: await buildHeaders(),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return deleteFn<T>(endpoint);
    }
    console.error("[HttpMethods.delete] Error:", error);
    throw error;
  }
}
