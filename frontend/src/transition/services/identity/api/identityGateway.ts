/**
 * Identity Gateway - API client for identity operations
 */

import type { User } from "../domain/user";

export interface LoginCredentials {
  email: string;
  password: string;
}

class IdentityGateway {
  private apiUrl = "/api/auth";

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return await response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.apiUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.apiUrl}/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    return await response.json();
  }

  async refreshToken(): Promise<void> {
    const response = await fetch(`${this.apiUrl}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }
  }
}

export const identityGateway = new IdentityGateway();
