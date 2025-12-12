/**
 * Authentication Service
 * Handles login, logout, registration, OAuth, MFA, and token management
 */

import apiClient, { setAuthToken, setRefreshToken, clearTokens, getRefreshToken } from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  OAuthCallbackRequest,
  ChangePasswordRequest,
} from '../../types/api';

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    const { accessToken, refreshToken } = response.data;
    setAuthToken(accessToken);
    setRefreshToken(refreshToken);

    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Register new user account
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.warn('Logout request failed:', error);
  } finally {
    clearTokens();
    // Dispatch logout event for other components
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken } as RefreshTokenRequest
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setAuthToken(accessToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }

    return response.data;
  } catch (error) {
    clearTokens();
    throw createApiError(error);
  }
}

/**
 * Verify current auth token
 */
export async function verifyToken(): Promise<boolean> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
    return response.data.valid === true;
  } catch (error) {
    return false;
  }
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * OAuth - Get Google OAuth URL
 */
export async function getGoogleOAuthUrl(): Promise<{ url: string }> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.OAUTH_GOOGLE);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * OAuth - Get Microsoft OAuth URL
 */
export async function getMicrosoftOAuthUrl(): Promise<{ url: string }> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.OAUTH_MICROSOFT);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * OAuth - Handle OAuth callback
 */
export async function handleOAuthCallback(data: OAuthCallbackRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.OAUTH_CALLBACK,
      data
    );

    const { accessToken, refreshToken } = response.data;
    setAuthToken(accessToken);
    setRefreshToken(refreshToken);

    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * MFA - Setup two-factor authentication
 */
export async function setupMFA(): Promise<TwoFactorSetupResponse> {
  try {
    const response = await apiClient.post<TwoFactorSetupResponse>(
      API_ENDPOINTS.AUTH.MFA_SETUP
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * MFA - Verify two-factor authentication code
 */
export async function verifyMFA(data: TwoFactorVerifyRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.MFA_VERIFY,
      data
    );

    const { accessToken, refreshToken } = response.data;
    setAuthToken(accessToken);
    setRefreshToken(refreshToken);

    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * MFA - Disable two-factor authentication
 */
export async function disableMFA(password: string): Promise<{ message: string }> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.MFA_DISABLE, { password });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('auth_token');
  return !!token;
}

/**
 * Get current user from local storage
 */
export function getCurrentUser(): any | null {
  const userStr = localStorage.getItem('current_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Save current user to local storage
 */
export function saveCurrentUser(user: any): void {
  localStorage.setItem('current_user', JSON.stringify(user));
}

/**
 * Clear current user from local storage
 */
export function clearCurrentUser(): void {
  localStorage.removeItem('current_user');
}

export default {
  login,
  register,
  logout,
  refreshAccessToken,
  verifyToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getGoogleOAuthUrl,
  getMicrosoftOAuthUrl,
  handleOAuthCallback,
  setupMFA,
  verifyMFA,
  disableMFA,
  isAuthenticated,
  getCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
};
