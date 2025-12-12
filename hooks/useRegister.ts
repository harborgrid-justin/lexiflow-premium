/**
 * useRegister Hook
 * Custom hook for handling user registration
 */

import { useState, useCallback } from 'react';
import { register as registerApi } from '../services/api/authService';
import type { RegisterRequest, RegisterResponse } from '../types/api';

interface UseRegisterResult {
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  loading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  reset: () => void;
}

export const useRegister = (): UseRegisterResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = useCallback(async (data: RegisterRequest): Promise<RegisterResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await registerApi(data);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
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
    register,
    loading,
    error,
    success,
    clearError,
    reset,
  };
};

export default useRegister;
