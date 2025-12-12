/**
 * Auth Interceptor
 * Enhanced token refresh interceptor for seamless authentication
 */

import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenService } from './tokenService';
import { sessionService } from './sessionService';
import apiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../api/config';

// Track if a token refresh is already in progress
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh completion
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers when refresh completes
 */
const onRefreshComplete = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Setup request interceptor to add auth token
 */
export const setupRequestInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Skip auth for certain endpoints
      const publicEndpoints = [
        API_ENDPOINTS.AUTH.LOGIN,
        API_ENDPOINTS.AUTH.REGISTER,
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        API_ENDPOINTS.AUTH.REFRESH,
      ];

      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        config.url?.includes(endpoint)
      );

      if (isPublicEndpoint) {
        return config;
      }

      // Check if token is expiring soon and refresh proactively
      if (tokenService.isTokenExpiringSoon() && !isRefreshing) {
        try {
          await refreshToken();
        } catch (error) {
          console.warn('Proactive token refresh failed:', error);
        }
      }

      // Add access token to request
      const accessToken = tokenService.getAccessToken();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Update session activity
      sessionService.updateActivity();

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );
};

/**
 * Setup response interceptor to handle token refresh
 */
export const setupResponseInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        // Don't retry if already tried once
        originalRequest._retry = true;

        // Check if this is a refresh token request that failed
        if (originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)) {
          // Refresh token is invalid, logout user
          handleAuthenticationFailure();
          return Promise.reject(error);
        }

        // If refresh is already in progress, wait for it
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(instance(originalRequest));
            });
          });
        }

        // Start refresh process
        try {
          const newToken = await refreshToken();

          // Update the failed request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          handleAuthenticationFailure();
          return Promise.reject(refreshError);
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        window.dispatchEvent(
          new CustomEvent('auth:forbidden', {
            detail: {
              message: error.response.data || 'Access denied',
              url: originalRequest?.url,
            },
          })
        );
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Refresh access token
 */
const refreshToken = async (): Promise<string> => {
  isRefreshing = true;

  try {
    const refreshTokenValue = tokenService.getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    // Call refresh endpoint
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken: refreshTokenValue,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store new tokens
    const rememberMe = sessionService.isRememberMeEnabled();
    tokenService.setAccessToken(accessToken, rememberMe);

    if (newRefreshToken) {
      tokenService.setRefreshToken(newRefreshToken);
    }

    // Notify all waiting requests
    onRefreshComplete(accessToken);

    return accessToken;
  } catch (error) {
    // Clear tokens on refresh failure
    tokenService.clearTokens();
    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Handle authentication failure
 */
const handleAuthenticationFailure = () => {
  // Clear all auth data
  tokenService.clearTokens();
  sessionService.clearSession();

  // Dispatch logout event
  window.dispatchEvent(
    new CustomEvent('auth:sessionExpired', {
      detail: { redirectToLogin: true },
    })
  );

  // Redirect to login after a short delay
  setTimeout(() => {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.startsWith('/auth');

    if (!isAuthPage) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }, 100);
};

/**
 * Initialize all interceptors
 */
export const initializeAuthInterceptors = (instance: AxiosInstance = apiClient) => {
  setupRequestInterceptor(instance);
  setupResponseInterceptor(instance);
};

/**
 * Manual token refresh (can be called from UI)
 */
export const manualRefreshToken = async (): Promise<void> => {
  try {
    await refreshToken();
  } catch (error) {
    console.error('Manual token refresh failed:', error);
    throw error;
  }
};

export default {
  initializeAuthInterceptors,
  setupRequestInterceptor,
  setupResponseInterceptor,
  manualRefreshToken,
};
