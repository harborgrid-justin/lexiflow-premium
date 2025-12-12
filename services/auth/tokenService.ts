/**
 * Token Service
 * Manages JWT token storage, retrieval, and refresh logic
 */

import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'lexiflow_access_token';
const REFRESH_TOKEN_KEY = 'lexiflow_refresh_token';
const TOKEN_EXPIRY_KEY = 'lexiflow_token_expiry';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

class TokenService {
  /**
   * Store access token (in memory or localStorage based on "Remember Me")
   */
  setAccessToken(token: string, remember: boolean = false): void {
    if (remember) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }

    // Store expiry time for quick checks
    const decoded = this.decodeToken(token);
    if (decoded?.exp) {
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
  }

  /**
   * Store refresh token (always in localStorage for persistence)
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens from storage
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Decode JWT token without verification
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return true;

    const decoded = this.decodeToken(tokenToCheck);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  isTokenExpiringSoon(token?: string): boolean {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return true;

    const decoded = this.decodeToken(tokenToCheck);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    const fiveMinutes = 5 * 60;
    return decoded.exp - currentTime < fiveMinutes;
  }

  /**
   * Get token expiry time in milliseconds
   */
  getTokenExpiry(token?: string): number | null {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return null;

    const decoded = this.decodeToken(tokenToCheck);
    if (!decoded || !decoded.exp) return null;

    return decoded.exp * 1000;
  }

  /**
   * Get user ID from token
   */
  getUserIdFromToken(token?: string): string | null {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return null;

    const decoded = this.decodeToken(tokenToCheck);
    return decoded?.sub || null;
  }

  /**
   * Get user role from token
   */
  getUserRoleFromToken(token?: string): string | null {
    const tokenToCheck = token || this.getAccessToken();
    if (!tokenToCheck) return null;

    const decoded = this.decodeToken(tokenToCheck);
    return decoded?.role || null;
  }

  /**
   * Validate token structure
   */
  isValidToken(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      return !!(decoded && decoded.sub && decoded.email && decoded.role);
    } catch {
      return false;
    }
  }

  /**
   * Get time until token expiry in seconds
   */
  getTimeUntilExpiry(token?: string): number | null {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) return null;

    const now = Date.now();
    const timeLeft = expiry - now;
    return Math.max(0, Math.floor(timeLeft / 1000));
  }

  /**
   * Check if we have valid tokens
   */
  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    return !!(
      accessToken &&
      refreshToken &&
      this.isValidToken(accessToken) &&
      !this.isTokenExpired(accessToken)
    );
  }
}

export const tokenService = new TokenService();
