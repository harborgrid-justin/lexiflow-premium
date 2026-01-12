/**
 * Development Auto-Login Utility
 *
 * Automatically logs in with demo credentials in development mode
 * when user is not authenticated.
 *
 * Usage: Set VITE_AUTO_LOGIN=true in .env file
 */

import { AuthApiService } from "@/api/auth/auth-api";
import {
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from "@/config/security/security.config";
import { setAuthTokens } from "@/services/infrastructure/api-client/auth-manager";

const DEMO_EMAIL = "admin@lexiflow.com";
const DEMO_PASSWORD = "Demo123!";
const AUTH_USER_KEY = "lexiflow_auth_user";

/**
 * Check if auto-login is enabled
 */
export function isAutoLoginEnabled(): boolean {
  return import.meta.env.VITE_AUTO_LOGIN === "true" || import.meta.env.DEV;
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const user = localStorage.getItem(AUTH_USER_KEY);
  return !!(token && user);
}

/**
 * Perform auto-login with demo credentials
 */
export async function performAutoLogin(): Promise<boolean> {
  // Only auto-login in development and if not already authenticated
  if (!isAutoLoginEnabled() || isAuthenticated()) {
    return false;
  }

  console.log("[DevAutoLogin] Attempting auto-login with demo credentials...");

  try {
    const authApi = new AuthApiService();
    const response = await authApi.login(DEMO_EMAIL, DEMO_PASSWORD);

    // Store tokens
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.accessToken);
    localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, response.refreshToken);

    // Create auth user object
    const authUser = {
      id: response.user.id,
      email: response.user.email,
      name: response.user.firstName
        ? `${response.user.firstName} ${response.user.lastName}`.trim()
        : response.user.email.split("@")[0] || "Demo User",
      role: response.user.role || "attorney",
      avatarUrl: response.user.avatarUrl,
      permissions: [],
      mfaEnabled: false,
      accountLocked: false,
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));

    // Sync with API client
    setAuthTokens(response.accessToken, response.refreshToken);

    console.log("[DevAutoLogin] Auto-login successful!");
    return true;
  } catch (error) {
    console.error("[DevAutoLogin] Auto-login failed:", error);
    return false;
  }
}

/**
 * Initialize auto-login if enabled
 * Call this during app initialization
 */
export async function initializeAutoLogin(): Promise<void> {
  if (isAutoLoginEnabled() && !isAuthenticated()) {
    console.log(
      "[DevAutoLogin] Auto-login is enabled and user is not authenticated"
    );
    try {
      const success = await performAutoLogin();
      if (success) {
        console.log("[DevAutoLogin] Auto-login completed, reloading page...");
        // Reload to trigger authentication flow
        window.location.reload();
      }
    } catch (error) {
      console.error("[DevAutoLogin] Auto-login initialization failed:", error);
    }
  }
}
