/**
 * useLogout Hook
 * Custom hook for handling logout operations
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../services/api/authService';
import { tokenService } from '../services/auth/tokenService';
import { sessionService } from '../services/auth/sessionService';

interface UseLogoutResult {
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useLogout = (): UseLogoutResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Call logout API (best effort - don't fail if it errors)
      try {
        await logoutApi();
      } catch (apiError) {
        console.warn('Logout API call failed:', apiError);
      }

      // Clear tokens
      tokenService.clearTokens();

      // Clear session data
      sessionService.clearSession();

      // Clear any cached user data
      localStorage.removeItem('current_user');
      sessionStorage.clear();

      // Dispatch logout event for other components
      window.dispatchEvent(new CustomEvent('auth:logout'));

      // Redirect to login page
      navigate('/auth/login', {
        replace: true,
        state: { loggedOut: true }
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      console.error('Logout error:', err);

      // Even if logout fails, still clear local data and redirect
      tokenService.clearTokens();
      sessionService.clearSession();
      navigate('/auth/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    logout,
    loading,
    error,
  };
};

export default useLogout;
