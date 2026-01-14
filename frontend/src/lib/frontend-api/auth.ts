/**
 * Auth Frontend API
 * Domain contract for authentication and user management
 */

import { client, type Result, success, failure, ValidationError, AuthError } from "./index";
import { validate, validators } from "./schemas";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function login(input: LoginInput): Promise<Result<AuthResponse>> {
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

export async function logout(): Promise<Result<void>> {
  const result = await client.post<void>("/auth/logout");
  
  // Clear token regardless of result
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
    } catch {
      // Storage failure - non-critical
    }
  }

  return result;
}

export async function getCurrentUser(): Promise<Result<AuthResponse["user"]>> {
  const result = await client.get<AuthResponse["user"]>("/auth/me");
  
  if (!result.ok) return result;
  
  return success(result.data);
}

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

export const authApi = {
  login,
  logout,
  getCurrentUser,
  refreshToken,
};
