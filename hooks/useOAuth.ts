/**
 * useOAuth Hook
 * Custom hook for handling OAuth authentication flows
 */

import { useState, useCallback } from 'react';
import {
  getGoogleOAuthUrl,
  getMicrosoftOAuthUrl,
  handleOAuthCallback,
} from '../services/api/authService';
import { tokenService } from '../services/auth/tokenService';
import type { OAuthCallbackRequest, LoginResponse } from '../types/api';

interface UseOAuthResult {
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  handleCallback: (provider: string, code: string, state?: string) => Promise<LoginResponse>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useOAuth = (): UseOAuthResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiate Google OAuth flow
   */
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getGoogleOAuthUrl();

      // Store state for CSRF protection
      const state = `google_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('oauth_state', state);

      // Redirect to Google OAuth
      window.location.href = response.url;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to initiate Google login';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Initiate Microsoft OAuth flow
   */
  const loginWithMicrosoft = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMicrosoftOAuthUrl();

      // Store state for CSRF protection
      const state = `microsoft_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('oauth_state', state);

      // Redirect to Microsoft OAuth
      window.location.href = response.url;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to initiate Microsoft login';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Handle OAuth callback after redirect
   */
  const handleCallback = useCallback(async (
    provider: string,
    code: string,
    state?: string
  ): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      // Verify state for CSRF protection
      const storedState = sessionStorage.getItem('oauth_state');
      if (state && storedState && state !== storedState) {
        throw new Error('Invalid OAuth state. Possible CSRF attack.');
      }

      // Clear stored state
      sessionStorage.removeItem('oauth_state');

      // Exchange code for tokens
      const request: OAuthCallbackRequest = {
        provider,
        code,
        state,
      };

      const response = await handleOAuthCallback(request);

      // Store tokens
      if (response.accessToken) {
        tokenService.setAccessToken(response.accessToken);
      }
      if (response.refreshToken) {
        tokenService.setRefreshToken(response.refreshToken);
      }

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'OAuth authentication failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loginWithGoogle,
    loginWithMicrosoft,
    handleCallback,
    loading,
    error,
    clearError,
  };
};

export default useOAuth;
