/**
 * Session Service
 * Manages user session state and persistence
 */

import { tokenService } from './tokenService';

const USER_DATA_KEY = 'lexiflow_user_data';
const REMEMBER_ME_KEY = 'lexiflow_remember_me';
const LAST_ACTIVITY_KEY = 'lexiflow_last_activity';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions?: string[];
  mfaEnabled?: boolean;
  createdAt: string;
}

class SessionService {
  /**
   * Save user session data
   */
  saveSession(user: UserSession, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(USER_DATA_KEY, JSON.stringify(user));
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
    this.updateLastActivity();
  }

  /**
   * Get current user session data
   */
  getSession(): UserSession | null {
    const userData =
      localStorage.getItem(USER_DATA_KEY) ||
      sessionStorage.getItem(USER_DATA_KEY);

    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
    tokenService.clearTokens();
  }

  /**
   * Check if user has an active session
   */
  hasActiveSession(): boolean {
    const user = this.getSession();
    const hasValidTokens = tokenService.hasValidTokens();
    return !!(user && hasValidTokens);
  }

  /**
   * Get remember me preference
   */
  isRememberMeEnabled(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }

  /**
   * Get last activity timestamp
   */
  getLastActivity(): number | null {
    const timestamp = localStorage.getItem(LAST_ACTIVITY_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  }

  /**
   * Check if session is expired based on inactivity
   */
  isSessionExpired(timeoutMinutes: number = 30): boolean {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return true;

    const now = Date.now();
    const timeout = timeoutMinutes * 60 * 1000; // Convert to milliseconds
    return now - lastActivity > timeout;
  }

  /**
   * Extend session by updating last activity
   */
  extendSession(): void {
    this.updateLastActivity();
  }

  /**
   * Get session age in minutes
   */
  getSessionAge(): number | null {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return null;

    const now = Date.now();
    return Math.floor((now - lastActivity) / (60 * 1000));
  }

  /**
   * Check if session needs refresh
   */
  needsRefresh(): boolean {
    // Refresh if token is expiring soon
    return tokenService.isTokenExpiringSoon();
  }

  /**
   * Get complete session info
   */
  getSessionInfo(): {
    user: UserSession | null;
    isActive: boolean;
    isExpired: boolean;
    needsRefresh: boolean;
    age: number | null;
    rememberMe: boolean;
  } {
    return {
      user: this.getSession(),
      isActive: this.hasActiveSession(),
      isExpired: this.isSessionExpired(),
      needsRefresh: this.needsRefresh(),
      age: this.getSessionAge(),
      rememberMe: this.isRememberMeEnabled(),
    };
  }

  /**
   * Validate and sync session with token
   */
  syncWithToken(): boolean {
    const user = this.getSession();
    const accessToken = tokenService.getAccessToken();

    if (!user || !accessToken) {
      this.clearSession();
      return false;
    }

    // Verify token matches user
    const tokenUserId = tokenService.getUserIdFromToken(accessToken);
    if (tokenUserId !== user.id) {
      this.clearSession();
      return false;
    }

    // Check token expiry
    if (tokenService.isTokenExpired(accessToken)) {
      // Token expired but we have refresh token
      return !!tokenService.getRefreshToken();
    }

    return true;
  }

  /**
   * Handle session timeout
   */
  handleTimeout(): void {
    this.clearSession();
    // Optionally emit event for session timeout handling
    window.dispatchEvent(new CustomEvent('session:timeout'));
  }

  /**
   * Start session monitoring
   */
  startMonitoring(checkInterval: number = 60000): () => void {
    const intervalId = setInterval(() => {
      if (this.isSessionExpired()) {
        this.handleTimeout();
      }
    }, checkInterval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export const sessionService = new SessionService();
