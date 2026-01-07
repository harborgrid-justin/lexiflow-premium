/**
 * Auth Manager for Enterprise API Client
 */

export class AuthManager {
  private authTokenKey: string = "lexiflow_auth_token";
  private refreshTokenKey: string = "lexiflow_refresh_token";

  /**
   * Get auth token from storage
   */
  getAuthToken(): string | null {
    try {
      return localStorage.getItem(this.authTokenKey);
    } catch (error) {
      console.error("[AuthManager] Failed to get auth token:", error);
      return null;
    }
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error("[AuthManager] Failed to get refresh token:", error);
      return null;
    }
  }

  /**
   * Set auth tokens
   */
  setAuthTokens(accessToken: string, refreshToken?: string): void {
    try {
      localStorage.setItem(this.authTokenKey, accessToken);
      if (refreshToken) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
      }
    } catch (error) {
      console.error("[AuthManager] Failed to set auth tokens:", error);
      throw new Error("Failed to store authentication tokens");
    }
  }

  /**
   * Clear auth tokens
   */
  clearAuthTokens(): void {
    try {
      localStorage.removeItem(this.authTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error("[AuthManager] Failed to clear auth tokens:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}
