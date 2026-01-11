/**
 * HTTP Methods
 * Core REST methods: GET, POST, PUT, PATCH, DELETE
 */

import { AuthenticationError } from "@/services/core/errors";
import { buildBaseURL, getOrigin, DEFAULT_TIMEOUT } from "./config";
import { buildHeaders, validateEndpoint, validateData, buildURL } from "./request-builder";
import { handleResponse } from "./response-handler";

/**
 * GET request
 */
export async function get<T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<T> {
  validateEndpoint(endpoint, "get");
  try {
    const baseURL = buildBaseURL();
    const url = buildURL(baseURL, endpoint, getOrigin(), params);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: buildHeaders(),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (
      error instanceof AuthenticationError &&
      error.message === "TOKEN_REFRESHED"
    ) {
      return get<T>(endpoint, params);
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

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: buildHeaders(options?.headers),
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      ...options,
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
      headers: buildHeaders(),
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
      headers: buildHeaders(),
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
      headers: buildHeaders(),
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
