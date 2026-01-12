/**
 * API Client - Main Composition
 * Enterprise-grade HTTP client with authentication and health monitoring
 */

import * as AuthManager from "./auth-manager";
import * as BlobHandler from "./blob-handler";
import { buildBaseURL } from "./config";
import * as FileUpload from "./file-upload";
import * as HealthCheck from "./health-check";
import * as HttpMethods from "./http-methods";
import { API_CLIENT_DEFAULT_TIMEOUT_MS } from '@/config/features/services.config';

/**
 * ApiClient Class
 * Aggregates all API client functionality
 */
export class ApiClient {
  private _baseURL: string | null = null;
  private _authToken: string | null = null;
  private requestInterceptors: Array<(config: any) => any> = [];
  private responseInterceptors: Array<(response: any) => any> = [];
  private _retryAttempts: number = 0;
  private _timeout: number = API_CLIENT_DEFAULT_TIMEOUT_MS;

  private get baseURL(): string {
    return this._baseURL || buildBaseURL();
  }

  constructor() {
    this.logInitialization();
  }

  private logInitialization(): void {
    /* console.log("[ApiClient] Initialized", {
      baseURL: this.baseURL,
      authEnabled: !!this.getAuthToken(),
    }); */
  }

  // Authentication methods
  public getAuthToken = AuthManager.getAuthToken;
  public getRefreshToken = AuthManager.getRefreshToken;
  public setAuthTokens = AuthManager.setAuthTokens;
  public clearAuthTokens = AuthManager.clearAuthTokens;
  public clearAuthToken = AuthManager.clearAuthTokens; // Alias for test compatibility
  public isAuthenticated = AuthManager.isAuthenticated;

  // HTTP methods - wrapped to apply interceptors
  public get = async <T>(
    endpoint: string,
    options?: { params?: Record<string, unknown>; headers?: HeadersInit }
  ): Promise<T> => {
    let config: any = {
      url: endpoint,
      method: "GET",
      params: options?.params,
      headers: options?.headers || {},
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = await HttpMethods.get<T>(endpoint, {
      params: config.params,
      headers: config.headers,
    });

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result);
    }

    return result;
  };

  public post = async <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> => {
    let config: any = {
      url: endpoint,
      method: "POST",
      data,
      headers: options?.headers || {},
      ...options,
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = await HttpMethods.post<T>(endpoint, config.data, {
      ...options,
      headers: config.headers,
    });

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result);
    }

    return result;
  };

  public put = async <T>(endpoint: string, data?: unknown): Promise<T> => {
    let config: any = { url: endpoint, method: "PUT", data, headers: {} };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = await HttpMethods.put<T>(endpoint, config.data);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result);
    }

    return result;
  };

  public patch = async <T>(endpoint: string, data?: unknown): Promise<T> => {
    let config: any = { url: endpoint, method: "PATCH", data, headers: {} };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = await HttpMethods.patch<T>(endpoint, config.data);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result);
    }

    return result;
  };

  public delete = async <T>(endpoint: string): Promise<T> => {
    let config: any = { url: endpoint, method: "DELETE", headers: {} };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = await HttpMethods.deleteFn<T>(endpoint);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result);
    }

    return result;
  };

  // Binary data methods
  public getBlob = BlobHandler.getBlob;

  // File upload methods
  public upload = FileUpload.upload;

  // Health check methods
  public healthCheck = HealthCheck.healthCheck;
  public checkServiceHealth = HealthCheck.checkServiceHealth;
  public checkSystemHealth = HealthCheck.checkSystemHealth;

  // Base URL getter for external use
  public getBaseUrl(): string {
    return this.baseURL;
  }

  // Configuration methods
  public setBaseURL(url: string): void {
    this._baseURL = url;
  }

  public setAuthToken(token: string): void {
    this._authToken = token;
    // Also update the auth manager - extract Bearer prefix if present
    const actualToken = token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
    AuthManager.setAuthTokens(actualToken);
  }

  public setTimeout(timeout: number): void {
    this._timeout = timeout;
  }

  public setRetryAttempts(attempts: number): void {
    this._retryAttempts = attempts;
  }

  // Interceptor management
  public addRequestInterceptor(interceptor: (config: any) => any): void {
    this.requestInterceptors.push(interceptor);
  }

  public removeRequestInterceptor(interceptor: (config: any) => any): void {
    const index = this.requestInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.requestInterceptors.splice(index, 1);
    }
  }

  public addResponseInterceptor(interceptor: (response: any) => any): void {
    this.responseInterceptors.push(interceptor);
  }

  public removeResponseInterceptor(interceptor: (response: any) => any): void {
    const index = this.responseInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.responseInterceptors.splice(index, 1);
    }
  }

  // Internal accessor for interceptors
  public getRequestInterceptors(): Array<(config: any) => any> {
    return this.requestInterceptors;
  }

  public getResponseInterceptors(): Array<(response: any) => any> {
    return this.responseInterceptors;
  }

  public getTimeout(): number {
    return this._timeout;
  }

  public getRetryAttempts(): number {
    return this._retryAttempts;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
