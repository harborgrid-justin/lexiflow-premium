/**
 * Authentication Gateway
 *
 * Handles authentication operations at the backend boundary.
 * Cookie-based auth managed by backend (no tokens in frontend).
 *
 * @module services/data/api/gateways/authGateway
 */

import { authDelete, authPost } from "../../client/authTransport";
import { buildApiUrl } from "../../client/config";
import { httpFetch } from "../../client/httpClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
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

      return response.data;
    } catch (error: any) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  },

  /**
   * Logout current session
   *
   * Backend clears httpOnly cookie.
   */
  async logout(): Promise<LogoutResponse> {
    try {
      return await authDelete<LogoutResponse>("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false };
    }
  },

  /**
   * Refresh session
   *
   * Backend validates refresh token from cookie and issues new tokens.
   */
  async refreshSession(): Promise<boolean> {
    try {
      const response = await authPost<{ success: boolean }>(
        "/auth/refresh",
        {}
      );
      return response.success;
    } catch (error) {
      console.error("Session refresh failed:", error);
      return false;
    }
  },

  /**
   * Check if user is authenticated
   *
   * Validates session cookie with backend.
   */
  async checkAuth(): Promise<boolean> {
    try {
      const url = buildApiUrl("/auth/check");
      const response = await httpFetch<{ authenticated: boolean }>(url, {
        method: "GET",
      });
      return response.data.authenticated;
    } catch (error) {
      return false;
    }
  },
};
