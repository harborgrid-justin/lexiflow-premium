/**
 * Auth Frontend API
 * Enterprise-grade API layer for authentication and user management
 *
 * @module lib/frontend-api/auth
 * @description Domain-level contract for auth operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * RESPONSIBILITIES:
 * ✓ Token management (localStorage)
 * ✓ Input validation (email, password)
 * ✓ Error typing (AuthError, ValidationError)
 * ✓ User data normalization
 * ✓ Session lifecycle
 * ✓ No state side effects
 * ✓ No context mutation
 *
 * FORBIDDEN:
 * ✗ React imports
 * ✗ Context access/mutation
 * ✗ Automatic token refresh (explicit reload)
 * ✗ Throwing exceptions
 * ✗ UI navigation
 */

import { client } from "./client";
import { ValidationError } from "./errors";
import { validate, validators } from "./schemas";
import { failure, type Result, success } from "./types";

/**
 * Login input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth response
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}

/**
 * User input for registration
 */
export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

/**
 * Password reset request input
 */
export interface ResetPasswordRequestInput {
  email: string;
}

/**
 * Password reset confirmation input
 */
export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Auth token refresh input
 */
export interface RefreshTokenInput {
  refreshToken: string;
}

/**
 * Login user with email and password
 */
export async function login(input: LoginInput): Promise<Result<AuthResponse>> {
  // Validation
  const validation = validate(input, {
    email: {
      type: "string",
      required: true,
      validator: validators.email,
      message: "Valid email is required",
    },
    password: {
      type: "string",
      required: true,
      min: 8,
      message: "Password must be at least 8 characters",
    },
  });

  if (!validation.ok) {
    return validation as Result<AuthResponse>;
  }

  const result = await client.post<AuthResponse>("/auth/login", input);

  if (!result.ok) return result;

  // Store token
  if (typeof window !== "undefined" && result.data.token) {
    try {
      localStorage.setItem("auth_token", result.data.token);
    } catch {
      // Storage failure - non-critical
    }
  }

  return success(result.data);
}

/**
 * Register new user
 */
export async function register(
  input: RegisterInput
): Promise<Result<AuthResponse>> {
  // Validation
  const validation = validate(input, {
    email: {
      type: "string",
      required: true,
      validator: validators.email,
      message: "Valid email is required",
    },
    password: {
      type: "string",
      required: true,
      min: 8,
      message: "Password must be at least 8 characters",
    },
    confirmPassword: {
      type: "string",
      required: true,
      message: "Password confirmation is required",
    },
    firstName: {
      type: "string",
      required: true,
      min: 2,
      message: "First name is required",
    },
    lastName: {
      type: "string",
      required: true,
      min: 2,
      message: "Last name is required",
    },
  });

  if (!validation.ok) {
    return validation as Result<AuthResponse>;
  }

  if (input.password !== input.confirmPassword) {
    return failure(new ValidationError("Passwords do not match"));
  }

  const result = await client.post<AuthResponse>("/auth/register", input);

  if (!result.ok) return result;

  // Store token
  if (typeof window !== "undefined" && result.data.token) {
    try {
      localStorage.setItem("auth_token", result.data.token);
    } catch {
      // Storage failure - non-critical
    }
  }

  return success(result.data);
}

/**
 * Logout current user
 */
export async function logout(): Promise<Result<void>> {
  const result = await client.post<void>("/auth/logout");

  // Clear token regardless of result
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    } catch {
      // Storage failure - non-critical
    }
  }

  return result;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<Result<AuthResponse["user"]>> {
  const result = await client.get<AuthResponse["user"]>("/auth/profile");

  if (!result.ok) return result;

  return success(result.data);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(): Promise<Result<{ token: string }>> {
  const result = await client.post<{ token: string }>("/auth/refresh");

  if (!result.ok) return result;

  // Update stored token
  if (typeof window !== "undefined" && result.data.token) {
    try {
      localStorage.setItem("auth_token", result.data.token);
    } catch {
      // Storage failure - non-critical
    }
  }

  return success(result.data);
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  input: ResetPasswordRequestInput
): Promise<Result<{ message: string }>> {
  const validation = validate(input, {
    email: {
      type: "string",
      required: true,
      validator: validators.email,
      message: "Valid email is required",
    },
  });

  if (!validation.ok) {
    return validation as Result<{ message: string }>;
  }

  const result = await client.post<{ message: string }>(
    "/auth/password/reset-request",
    input
  );

  return result;
}

/**
 * Confirm password reset with token
 */
export async function confirmPasswordReset(
  input: ResetPasswordInput
): Promise<Result<{ message: string }>> {
  const validation = validate(input, {
    token: {
      type: "string",
      required: true,
      message: "Reset token is required",
    },
    newPassword: {
      type: "string",
      required: true,
      min: 8,
      message: "Password must be at least 8 characters",
    },
    confirmPassword: {
      type: "string",
      required: true,
      message: "Password confirmation is required",
    },
  });

  if (!validation.ok) {
    return validation as Result<{ message: string }>;
  }

  if (input.newPassword !== input.confirmPassword) {
    return failure(new ValidationError("Passwords do not match"));
  }

  const result = await client.post<{ message: string }>(
    "/auth/password/reset",
    input
  );

  return result;
}

export const authApi = {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
  requestPasswordReset,
  confirmPasswordReset,
};
