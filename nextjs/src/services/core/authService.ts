/**
 * @fileoverview Production Authentication Service
 * @description JWT-based authentication with localStorage token management, API verification,
 * role-based access control, and session management. Replaces mock auth implementations.
 *
 * Features:
 * - JWT token storage and refresh
 * - User session management
 * - Role-based authorization
 * - Token expiration handling
 * - API integration for auth endpoints
 */

import { api } from "@/api";

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  avatarUrl?: string;
  department?: string;
  title?: string;
}

export type UserRole = "admin" | "attorney" | "paralegal" | "staff" | "client";

export type Permission =
  | "cases:read"
  | "cases:write"
  | "cases:delete"
  | "documents:read"
  | "documents:write"
  | "documents:delete"
  | "billing:read"
  | "billing:write"
  | "admin:users"
  | "admin:settings"
  | "compliance:read"
  | "compliance:write";

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
//                         LOCAL STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  ACCESS_TOKEN: "lexiflow_access_token",
  REFRESH_TOKEN: "lexiflow_refresh_token",
  USER: "lexiflow_user",
  EXPIRES_AT: "lexiflow_token_expires",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//                         AUTHENTICATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════

class AuthenticationService {
  private currentUser: User | null = null;
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadUserFromStorage();
  }

  /**
   * Initialize auth state from localStorage on app load
   */
  private loadUserFromStorage(): void {
    try {
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

      if (userJson && accessToken && expiresAt) {
        const expiresAtNum = parseInt(expiresAt, 10);

        // Check if token is still valid
        if (expiresAtNum > Date.now()) {
          this.currentUser = JSON.parse(userJson);
          this.scheduleTokenRefresh(expiresAtNum);
        } else {
          // Token expired, attempt refresh
          this.refreshToken().catch(() => this.clearAuth());
        }
      }
    } catch (error) {
      console.error("[AuthService] Failed to load user from storage:", error);
      this.clearAuth();
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.auth.login(credentials);

      const { user, accessToken, refreshToken, expiresIn } = response;
      const expiresAt = Date.now() + expiresIn * 1000;

      // Store tokens and user
      this.storeAuthData({ accessToken, refreshToken, expiresAt }, user);
      this.currentUser = user;

      // Schedule token refresh
      this.scheduleTokenRefresh(expiresAt);

      return user;
    } catch (error) {
      console.error("[AuthService] Login failed:", error);
      throw new Error("Login failed. Please check your credentials.");
    }
  }

  /**
   * Logout and clear auth state
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await api.auth.logout({ refreshToken });
      }
    } catch (error) {
      console.error("[AuthService] Logout API call failed:", error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.auth.refresh({ refreshToken });
      const { accessToken, expiresIn } = response;
      const expiresAt = Date.now() + expiresIn * 1000;

      // Update stored token
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

      // Schedule next refresh
      this.scheduleTokenRefresh(expiresAt);

      return accessToken;
    } catch (error) {
      console.error("[AuthService] Token refresh failed:", error);
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string {
    if (!this.currentUser) {
      // Fallback for unauthenticated state (development mode)
      return "user-guest";
    }
    return this.currentUser.id;
  }

  /**
   * Get current user name
   */
  getCurrentUserName(): string {
    if (!this.currentUser) {
      // Fallback for unauthenticated state (development mode)
      return "Guest User";
    }
    return this.currentUser.name;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!token || !expiresAt) {
      return false;
    }

    const expiresAtNum = parseInt(expiresAt, 10);
    return expiresAtNum > Date.now();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser) {
      return false;
    }
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    if (!this.currentUser) {
      return false;
    }
    return this.currentUser.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    if (!this.currentUser) {
      return false;
    }
    return roles.includes(this.currentUser.role);
  }

  /**
   * Update current user profile
   */
  async updateProfile(
    updates: Partial<Omit<User, "id" | "role">>
  ): Promise<User> {
    if (!this.currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      const updatedUser = await api.users.update(this.currentUser.id, updates);
      this.currentUser = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("[AuthService] Profile update failed:", error);
      throw error;
    }
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(token: AuthToken, user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, token.expiresAt.toString());
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  private clearAuth(): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER);

    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  /**
   * Schedule automatic token refresh before expiration
   */
  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // Refresh 5 minutes before expiration
    const refreshTime = expiresAt - Date.now() - 5 * 60 * 1000;

    if (refreshTime > 0) {
      this.tokenRefreshTimeout = setTimeout(() => {
        this.refreshToken().catch((error) => {
          console.error("[AuthService] Scheduled token refresh failed:", error);
        });
      }, refreshTime);
    }
  }

  /**
   * Verify token with backend (useful for page reloads)
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return false;
      }

      const response = await api.auth.verify({ token });
      return response.valid;
    } catch (error) {
      console.error("[AuthService] Token verification failed:", error);
      return false;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                           SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const AuthService = new AuthenticationService();

// ═══════════════════════════════════════════════════════════════════════════
//                         CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current user ID (replaces mock implementation)
 */
export function getCurrentUserId(): string {
  return AuthService.getCurrentUserId();
}

/**
 * Get current user name (replaces mock implementation)
 */
export function getCurrentUserName(): string {
  return AuthService.getCurrentUserName();
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  return AuthService.getCurrentUser();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return AuthService.isAuthenticated();
}
