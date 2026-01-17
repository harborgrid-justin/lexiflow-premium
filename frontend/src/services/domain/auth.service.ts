// ================================================================================
// AUTH SERVICE - DOMAIN SERVICE LAYER
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context (state) → Service (effects) → Frontend API (HTTP)
//
// PURPOSE:
//   - Encapsulates authentication side effects
//   - Manages token storage
//   - Provides domain-level auth operations
//   - Never called by views directly (only by AuthContext)
//
// ================================================================================

import { authApi } from "@/api/domains/auth.api";
import {
  clearAuthTokens,
  setAuthTokens,
} from "@/services/infrastructure/api-client/auth-manager";

import type { User } from "@/types";

const AUTH_STORAGE_KEY = "lexiflow_auth_token";
const AUTH_REFRESH_KEY = "lexiflow_refresh_token";
const AUTH_USER_KEY = "lexiflow_user";

export class AuthService {
  /**
   * Initialize auth state from storage
   * Called by context on mount if no loader data provided
   */
  static async initializeFromStorage(): Promise<User | null> {
    try {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const refreshToken = localStorage.getItem(AUTH_REFRESH_KEY);

      if (token && storedUser && refreshToken) {
        // Sync with API client
        setAuthTokens(token, refreshToken);
        return JSON.parse(storedUser);
      }

      return null;
    } catch (err) {
      console.error("Failed to initialize auth from storage", err);
      this.clearStorage();
      return null;
    }
  }

  /**
   * Login user
   * Returns user on success, throws on failure
   */
  static async login(email: string, password: string): Promise<User> {
    try {
      const response = await authApi.auth.login(email, password);
      const { accessToken, refreshToken, user } = response;

      // Store tokens and user
      localStorage.setItem(AUTH_STORAGE_KEY, accessToken);
      localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      // Sync with API client
      setAuthTokens(accessToken, refreshToken);

      return user;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Login failed");
    }
  }

  /**
   * Logout user
   * Clears storage and tokens
   */
  static async logout(): Promise<void> {
    try {
      // Attempt to call backend logout endpoint
      // await authApi.auth.logout();
    } catch (err) {
      console.error("Logout API call failed", err);
      // Continue with local cleanup even if API fails
    } finally {
      this.clearStorage();
      clearAuthTokens();
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(AUTH_REFRESH_KEY);
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Call refresh endpoint
      // const response = await authApi.auth.refreshToken(refreshToken);
      // localStorage.setItem(AUTH_STORAGE_KEY, response.accessToken);
      // setAuthTokens(response.accessToken, refreshToken);
    } catch (err) {
      console.error("Token refresh failed", err);
      throw err;
    }
  }

  /**
   * Clear all auth storage
   */
  private static clearStorage(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}
