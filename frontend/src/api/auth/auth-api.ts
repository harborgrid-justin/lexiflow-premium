/**
 * AuthApiService
 * API service split from apiServices.ts
 */

import { REFRESH_TOKEN_KEY } from "@/services/infrastructure/api-client/config";
import { apiClient } from "@/services/infrastructure/api-client.service";

import type { User } from "@/types";

export class AuthApiService {
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // Note: The generic logic in apiClient.post automatically unwraps the { success: true, data: ... } envelope.
    // So 'response' here will be the inner data object directly: { accessToken, refreshToken, user }
    const data = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/auth/login", {
      email,
      password,
    });

    const { accessToken, refreshToken, user } = data;

    // Store tokens
    console.warn("[AuthApiService.login] Storing tokens:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
    });
    apiClient.setAuthTokens(accessToken, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // Note: apiClient auto-unwraps the response envelope
    const data = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/auth/register", userData);

    const { accessToken, refreshToken, user } = data;

    // Store tokens
    apiClient.setAuthTokens(accessToken, refreshToken);

    return { accessToken, refreshToken, user };
  }

  logout(): Promise<void> {
    apiClient.clearAuthTokens();
    return Promise.resolve();
  }

  async getCurrentUser(): Promise<User> {
    // Check if user is authenticated before making request
    if (!apiClient.isAuthenticated()) {
      throw new Error("User is not authenticated");
    }

    const response = await apiClient.get<{ success: boolean; data: User }>(
      "/auth/profile",
    );
    return response.data;
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }
    const refreshToken = storedRefreshToken;

    const response = await apiClient.post<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
      };
    }>("/auth/refresh", { refreshToken });

    const tokens = response.data;
    const accessToken = String(tokens.accessToken);
    const refreshedToken = String(tokens.refreshToken);
    apiClient.setAuthTokens(accessToken, refreshedToken);

    return { accessToken, refreshToken: refreshedToken };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { message: string };
    }>("/auth/forgot-password", {
      email,
    });
    return response.data;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  async enableMFA(): Promise<{ qrCode: string; secret: string }> {
    return apiClient.post<{ qrCode: string; secret: string }>(
      "/auth/enable-mfa",
      {},
    );
  }

  async verifyMFA(code: string): Promise<{
    verified: boolean;
    backupCodes?: string[];
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  }> {
    return apiClient.post<{
      verified: boolean;
      backupCodes?: string[];
      accessToken?: string;
      refreshToken?: string;
      user?: User;
    }>("/auth/verify-mfa", { code });
  }

  async disableMFA(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/disable-mfa", {});
  }
}
