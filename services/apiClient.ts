/**
 * API Client for Backend Communication
 * Handles HTTP requests to the NestJS backend with authentication
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';
const BASE_URL = `${API_URL}${API_PREFIX}`;

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiClient {
  private baseURL: string;
  private authTokenKey: string;
  private refreshTokenKey: string;

  constructor() {
    this.baseURL = BASE_URL;
    this.authTokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || 'lexiflow_auth_token';
    this.refreshTokenKey = import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'lexiflow_refresh_token';
  }

  /**
   * Get stored authentication token
   */
  private getAuthToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  /**
   * Get stored refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Store authentication tokens
   */
  public setAuthTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.authTokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * Clear authentication tokens
   */
  public clearAuthTokens(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Build headers for requests
   */
  private getHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: response.statusText || 'An error occurred',
          statusCode: response.status,
        };
      }

      // Handle 401 Unauthorized - token refresh
      if (response.status === 401) {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          // Try to refresh token
          try {
            const refreshed = await this.refreshAccessToken(refreshToken);
            if (refreshed) {
              // Retry the original request - caller should handle this
              throw new Error('TOKEN_REFRESHED');
            }
          } catch {
            this.clearAuthTokens();
            window.location.href = '/login';
          }
        } else {
          this.clearAuthTokens();
          window.location.href = '/login';
        }
      }

      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setAuthTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, String(additionalData[key]));
      });
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      throw new Error('Backend server is not reachable');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
