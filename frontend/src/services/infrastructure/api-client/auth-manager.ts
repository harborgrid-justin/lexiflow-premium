/**
 * Authentication Token Manager
 * Handles storage and retrieval of JWT tokens
 */

import { defaultStorage } from "../adapters/StorageAdapter";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./config";
import { OperationError, ValidationError } from "@/services/core/errors";

/**
 * Get stored authentication token
 */
export function getAuthToken(): string | null {
  try {
    return defaultStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("[AuthManager.getAuthToken] Error:", error);
    return null;
  }
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  try {
    return defaultStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("[AuthManager.getRefreshToken] Error:", error);
    return null;
  }
}

/**
 * Store authentication tokens
 */
export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  if (!accessToken) {
    throw new ValidationError(
      "[AuthManager.setAuthTokens] Invalid accessToken parameter"
    );
  }
  try {
    defaultStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    if (refreshToken) {
      defaultStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    console.log("[AuthManager] Auth tokens stored successfully");
  } catch (error) {
    console.error("[AuthManager.setAuthTokens] Error:", error);
    throw new OperationError(
      "AuthManager.setAuthTokens",
      "Failed to store authentication tokens"
    );
  }
}

/**
 * Clear authentication tokens and logout
 */
export function clearAuthTokens(): void {
  try {
    defaultStorage.removeItem(AUTH_TOKEN_KEY);
    defaultStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log("[AuthManager] Auth tokens cleared");
  } catch (error) {
    console.error("[AuthManager.clearAuthTokens] Error:", error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
