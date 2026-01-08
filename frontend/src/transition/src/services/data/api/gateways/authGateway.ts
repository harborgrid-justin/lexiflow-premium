/**
 * Authentication Gateway
 *
 * Handles authentication operations at the backend boundary.
 * Cookie-based auth managed by backend (no tokens in frontend).
 *
 * @module services/data/api/gateways/authGateway
 */

import { authPost } from "../../client/authTransport";
import { buildApiUrl } from "../../client/config";
import { httpFetch } from "../../client/httpClient";
import { tokenStorage } from "../../client/tokenStorage";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginData {
  user: unknown;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: LoginData;
}

export interface LogoutResponse {
  success: boolean;
}

/**
 * Authentication Gateway
 *
 * Provides authentication operations.
 * Backend sets httpOnly cookies on successful login.
 */
export const authGateway = {
  /**
   * Login with credentials
   *
   * Backend returns httpOnly cookie on success.
   * Frontend never sees or stores the token.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const url = buildApiUrl("/auth/login");
      const response = await httpFetch<LoginResponse>(url, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = response.data;

      // Store tokens if present (fallback for when cookies aren't used)
      if (payload.success && payload.data && payload.data.accessToken) {
        tokenStorage.setToken(payload.data.accessToken);
        if (payload.data.refreshToken) {
          tokenStorage.setRefreshToken(payload.data.refreshToken);
        }
      }

      return payload;
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Network error or server unavailable" };
    }
  },

  /**
   * Logout
   *
   * Backend clears httpOnly cookie.
   */
  async logout(): Promise<LogoutResponse> {
    try {
      tokenStorage.clearTokens();
      await authPost("/auth/logout");
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false };
    }
  },

  /**
   * Check session status
   */
  async checkSession(): Promise<boolean> {
    try {
      // Just try to fetch user profile
      // If 401, interceptor will catch it
      await authPost("/auth/refresh");
      return true;
    } catch {
      return false;
    }
  },
};
