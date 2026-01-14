/**
 * Response Handler
 * Processes API responses, handles errors, and performs case conversion
 */

import {
  AuthenticationError,
  ExternalServiceError,
  ValidationError,
} from "@/services/core/errors";
import { keysToCamel } from "@/utils/caseConverter";
import { clearAuthTokens, getRefreshToken } from "./auth-manager";
import { refreshAccessToken } from "./token-refresh";
import type { ApiError } from "./types";

/**
 * Handle API response with error management
 * Automatically refreshes token on 401 errors
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || "An error occurred",
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle 401 Unauthorized - attempt token refresh
    const isLoginRequest = response.url.includes("/auth/login");
    const isSSR = typeof window === "undefined";

    if (response.status === 401 && !isLoginRequest) {
      console.warn(
        "[ResponseHandler] Received 401 Unauthorized, attempting token refresh"
      );

      // During SSR, we cannot access localStorage or redirect
      // Return a special error that the loader can handle
      if (isSSR) {
        console.log(
          "[ResponseHandler] SSR detected, returning auth error for loader handling"
        );
        throw new AuthenticationError("SSR_AUTH_REQUIRED");
      }

      const refreshToken = getRefreshToken();
      console.log("[ResponseHandler] Refresh token check:", {
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length || 0,
      });

      if (refreshToken) {
        try {
          const refreshed = await refreshAccessToken(refreshToken);
          if (refreshed) {
            throw new AuthenticationError("TOKEN_REFRESHED");
          } else {
            console.warn(
              "[ResponseHandler] Token refresh failed, clearing tokens and redirecting"
            );
            clearAuthTokens();
            window.location.href = "/login";
            throw new AuthenticationError(
              "Session expired. Please login again."
            );
          }
        } catch (error) {
          if (
            error instanceof AuthenticationError &&
            error.message === "TOKEN_REFRESHED"
          ) {
            throw error;
          }
          console.error("[ResponseHandler] Token refresh failed:", error);
          clearAuthTokens();
          window.location.href = "/login";
          throw new AuthenticationError("Session expired. Please login again.");
        }
      } else {
        console.warn("[ResponseHandler] No refresh token available");
        clearAuthTokens();
        console.log("[ResponseHandler] Redirecting to login");
        window.location.href = "/login";
        throw new AuthenticationError("Authentication required. Please login.");
      }
    }

    // Log error for debugging
    console.error("[ResponseHandler] Request failed:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      message: errorData.message,
    });

    // Create error object with response details attached
    interface ErrorResponse {
      data?: { message?: string; details?: unknown };
      status?: number;
    }

    interface ErrorWithResponse extends ExternalServiceError {
      response?: ErrorResponse;
      status?: number;
      statusCode?: number;
    }

    const error: ErrorWithResponse = new ExternalServiceError(
      "API",
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    ) as ErrorWithResponse;

    // Attach response details for test assertions
    error.response = errorData;
    error.status = response.status;
    error.statusCode = response.status;

    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  try {
    const jsonData = await response.json();

    // Convert snake_case keys to camelCase
    const camelData = keysToCamel<unknown>(jsonData);

    // Auto-unwrap NestJS standard response envelope
    if (
      camelData &&
      typeof camelData === "object" &&
      "success" in camelData &&
      (camelData as { success: boolean }).success === true &&
      "data" in camelData &&
      (camelData as { data: unknown }).data !== undefined
    ) {
      return (camelData as { data: T }).data;
    }

    return camelData as T;
  } catch (error) {
    console.error("[ResponseHandler] Failed to parse response:", error);
    throw new ValidationError("Invalid response format from server");
  }
}
