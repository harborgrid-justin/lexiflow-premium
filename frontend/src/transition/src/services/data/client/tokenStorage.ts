/**
 * Token Storage
 *
 * Manages JWT tokens in localStorage.
 * Enterprise pattern: Should ideally be HttpOnly cookies, but using localStorage for current backend compat.
 *
 * @module services/data/client/tokenStorage
 */

const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || "lexiflow_auth_token";
const REFRESH_TOKEN_KEY =
  import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || "lexiflow_refresh_token";

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
