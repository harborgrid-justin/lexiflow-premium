/**
 * Authentication Type Definitions
 *
 * Shared types for authentication system.
 * Separated to maintain Fast Refresh compatibility.
 *
 * @module providers/authTypes
 */

/**
 * Represents an authenticated user
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "attorney" | "paralegal" | "staff";
  avatarUrl?: string;
  permissions: string[];
}

/**
 * Authentication state exposed to consumers
 */
export interface AuthStateValue {
  /** Current authenticated user, null if not authenticated */
  user: AuthUser | null;
  /** Whether authentication is being checked */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Authentication error message */
  error: string | null;
}

/**
 * Authentication actions exposed to consumers
 */
export interface AuthActionsValue {
  /** Login with credentials */
  login: (email: string, password: string) => Promise<boolean>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Refresh authentication token */
  refreshToken: () => Promise<boolean>;
  /** Check if user has specific permission */
  hasPermission: (permission: string) => boolean;
  /** Check if user has any of the specified roles */
  hasRole: (...roles: AuthUser["role"][]) => boolean;
}
