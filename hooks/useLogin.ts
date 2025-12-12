/**
 * useLogin Hook
 * Custom hook for handling login operations
 */

import { useState, useCallback } from 'react';
import { login as loginApi, verifyMFA } from '../services/api/authService';
import { tokenService } from '../services/auth/tokenService';
import type { LoginRequest, LoginResponse } from '../types/api';

interface UseLoginResult {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  verifyMfa: (token: string, code: string) => Promise<LoginResponse>;
  loading: boolean;
  error: string | null;
  requiresMfa: boolean;
  mfaToken: string | null;
  clearError: () => void;
}

export const useLogin = (): UseLoginResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);
    setRequiresMfa(false);
    setMfaToken(null);

    try {
      const credentials: LoginRequest = { email, password };
      const response = await loginApi(credentials);

      // Check if MFA is required
      if (response.requiresMfa && response.mfaToken) {
        setRequiresMfa(true);
        setMfaToken(response.mfaToken);
        return response;
      }

      // Store tokens
      if (response.accessToken) {
        tokenService.setAccessToken(response.accessToken, rememberMe);
      }
      if (response.refreshToken) {
        tokenService.setRefreshToken(response.refreshToken);
      }

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMfaCode = useCallback(async (
    token: string,
    code: string
  ): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await verifyMFA({ token, code });

      // Store tokens after successful MFA verification
      if (response.accessToken) {
        tokenService.setAccessToken(response.accessToken);
      }
      if (response.refreshToken) {
        tokenService.setRefreshToken(response.refreshToken);
      }

      setRequiresMfa(false);
      setMfaToken(null);

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'MFA verification failed';
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
    login,
    verifyMfa: verifyMfaCode,
    loading,
    error,
    requiresMfa,
    mfaToken,
    clearError,
  };
};

export default useLogin;
