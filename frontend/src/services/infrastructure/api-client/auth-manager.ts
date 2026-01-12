/**
 * Authentication Token Manager
 * Handles storage and retrieval of JWT tokens
 */

import { OperationError, ValidationError } from "@/services/core/errors";
import { defaultStorage } from "../adapters/StorageAdapter";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./config";

/**
 * Get stored authentication token
 */
export function getAuthToken(): string | null {
  try {
    const token = defaultStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      const decoded = tryDecodeJwt(token);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decoded?.exp && decoded.exp < now;

      console.log("[AuthManager.getAuthToken] Retrieved token:", {
        key: AUTH_TOKEN_KEY,
        length: token.length,
        start: token.substring(0, 30) + "...",
        payload: decoded,
        isExpired,
        expiresAt: decoded?.exp
          ? new Date(decoded.exp * 1000).toISOString()
          : null,
      });

      if (isExpired) {
        console.warn("[AuthManager.getAuthToken] Token is expired!");
      }
    } else {
      console.warn(
        "[AuthManager.getAuthToken] No token found with key:",
        AUTH_TOKEN_KEY
      );
    }
    return token;
  } catch (error) {
    console.error("[AuthManager.getAuthToken] Error:", error);
    return null;
  }
}

/**
 * Helper to decode JWT payload (without verification)
 */
function tryDecodeJwt(
  token: string
): { type?: string; sub?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    return {
      type: decoded.type,
      sub: decoded.sub,
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  try {
    const token = defaultStorage.getItem(REFRESH_TOKEN_KEY);
    console.log("[AuthManager.getRefreshToken] Retrieved token:", {
      key: REFRESH_TOKEN_KEY,
      found: !!token,
      length: token?.length || 0,
    });
    return token;
  } catch (error) {
    console.error("[AuthManager.getRefreshToken] Error:", error);
    return null;
  }
}

/**
 * Store authentication tokens
 */
export function setAuthTokens(
  accessToken: string,
  refreshToken?: string
): void {
  if (!accessToken) {
    throw new ValidationError(
      "[AuthManager.setAuthTokens] Invalid accessToken parameter"
    );
  }
  try {
    defaultStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    console.log(
      "[AuthManager.setAuthTokens] Stored access token with key:",
      AUTH_TOKEN_KEY
    );

    if (refreshToken) {
      defaultStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log(
        "[AuthManager.setAuthTokens] Stored refresh token with key:",
        REFRESH_TOKEN_KEY,
        {
          length: refreshToken.length,
        }
      );
    } else {
      console.warn("[AuthManager.setAuthTokens] No refresh token provided");
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

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 * @param bufferMinutes - Minutes before expiration to consider as "expiring soon"
 */
export function isTokenExpiringSoon(bufferMinutes: number = 5): boolean {
  const token = getAuthToken();
  if (!token) return false;

  const decoded = tryDecodeJwt(token);
  if (!decoded?.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = bufferMinutes * 60;

  return decoded.exp < now + bufferSeconds;
}
