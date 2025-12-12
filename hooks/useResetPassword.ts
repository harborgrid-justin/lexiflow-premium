/**
 * useResetPassword Hook
 * Custom hook for handling password reset operations
 */

import { useState, useCallback } from 'react';
import { forgotPassword, resetPassword } from '../services/api/authService';

interface UseResetPasswordResult {
  requestReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  reset: () => void;
}

export const useResetPassword = (): UseResetPasswordResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestReset = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPasswordWithToken = useCallback(async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    requestReset,
    resetPassword: resetPasswordWithToken,
    loading,
    error,
    success,
    clearError,
    reset,
  };
};

export default useResetPassword;
