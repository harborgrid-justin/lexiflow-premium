/**
 * Token Refresh Module
 * Handles JWT access token refresh with deduplication
 */

import { setAuthTokens } from "./auth-manager";
import { buildBaseURL, getOrigin } from "./config";

let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh access token using refresh token
 * Prevents duplicate refresh requests with promise deduplication
 */
export async function refreshAccessToken(refreshToken: string): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseURL = buildBaseURL();
      const fullUrl = baseURL ? `${baseURL}/auth/refresh` : "/auth/refresh";
      const url = new URL(fullUrl, getOrigin());

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle wrapped response from NestJS interceptor
        const accessToken = data.accessToken || data.data?.accessToken;
        const newRefreshToken = data.refreshToken || data.data?.refreshToken;

        if (accessToken) {
          setAuthTokens(accessToken, newRefreshToken);
          console.log("[TokenRefresh] Token refreshed successfully");
          return true;
        }
        console.error(
          "[TokenRefresh] Token refresh failed: Invalid response format",
          data
        );
        return false;
      }
      console.warn(
        "[TokenRefresh] Token refresh returned non-OK status:",
        response.status
      );
      return false;
    } catch (error) {
      console.error("[TokenRefresh] Token refresh error:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
