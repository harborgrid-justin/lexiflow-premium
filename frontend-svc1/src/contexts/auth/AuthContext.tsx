// src/contexts/auth/AuthContext.tsx
import { authApi } from "@/api/domains/auth.api";
import { apiClient } from "@/services/infrastructure/apiClient";
import type { User } from "@/types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AuthState =
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: User };

type AuthContextValue = {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'lexiflow_auth_token';
const AUTH_REFRESH_KEY = 'lexiflow_refresh_token';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ status: "anonymous", user: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_STORAGE_KEY);
      if (token) {
        try {
          apiClient.setAuthTokens(token, localStorage.getItem(AUTH_REFRESH_KEY) || '');
          // Verify token and get user profile
          // Note: Assuming /auth/me or similar exists, otherwise we might need to store user in localstorage
          // For now, we'll try to fetch profile, if fails, logout
          // If authApi.auth.getProfile doesn't exist, we might need to rely on stored user or just validate token
          // Let's assume we can get the current user.
          // If not available, we might need to rely on what's in localStorage if we stored it there.

          // For this implementation, we'll try to fetch the user.
          // If the API doesn't support it, we'd need to adjust.
          // authApi.users.getProfile() might be what we need if it exists.
          // Let's check if we can get the current user.

          // Fallback: check if we have a user in localStorage
          const storedUser = localStorage.getItem('lexiflow_user');
          if (storedUser) {
            setAuth({ status: "authenticated", user: JSON.parse(storedUser) });
          } else {
            // If no user data, we might be anonymous or need to fetch
            // For now, let's assume anonymous if no user data but token exists (edge case)
            // or try to fetch if we had an endpoint.
          }
        } catch (err) {
          console.error("Auth initialization failed", err);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(AUTH_REFRESH_KEY);
          localStorage.removeItem('lexiflow_user');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.auth.login(email, password);
      const { accessToken, refreshToken, user } = response;

      localStorage.setItem(AUTH_STORAGE_KEY, accessToken);
      localStorage.setItem(AUTH_REFRESH_KEY, refreshToken);
      localStorage.setItem('lexiflow_user', JSON.stringify(user));

      apiClient.setAuthTokens(accessToken, refreshToken);
      setAuth({ status: "authenticated", user });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // await authApi.auth.logout(); // If endpoint exists
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_REFRESH_KEY);
      localStorage.removeItem('lexiflow_user');
      apiClient.clearAuthTokens();
      setAuth({ status: "anonymous", user: null });
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      login,
      logout,
      isLoading,
      error
    }),
    [auth, login, logout, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};