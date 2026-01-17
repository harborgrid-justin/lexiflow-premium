/**
 * API Client - Main Composition
 * Enterprise-grade HTTP client with authentication and health monitoring
 */

import { API_CLIENT_DEFAULT_TIMEOUT_MS } from "@/config/features/services.config";

import * as AuthManager from "./auth-manager";
import * as BlobHandler from "./blob-handler";
import { buildBaseURL } from "./config";
import * as FileUpload from "./file-upload";
import * as HealthCheck from "./health-check";
import * as HttpMethods from "./http-methods";

/**
 * API Request Configuration
 */
interface RequestConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

/**
 * ApiClient Class
 * Aggregates all API client functionality
 */
export class ApiClient {
  private _baseURL: string | null = null;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> =
    [];
  private responseInterceptors: Array<(response: unknown) => unknown> = [];
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
    options?: {
      params?: Record<string, unknown> | undefined;
      headers?: HeadersInit | undefined;
    },
  ): Promise<T> => {
    let config: RequestConfig = {
      url: endpoint,
      method: "GET",
      headers: (options?.headers as Record<string, string>) || {},
      ...(options?.params ? { params: options.params } : {}),
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = (await HttpMethods.get<T>(endpoint, {
      ...(config.params ? { params: config.params } : {}),
      ...(config.headers ? { headers: config.headers } : {}),
    })) as T;

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result) as T;
    }

    return result;
  };

  public post = async <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> => {
    let config: RequestConfig = {
      url: endpoint,
      method: "POST",
      data,
      headers: (options?.headers as Record<string, string>) || {},
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = (await HttpMethods.post<T>(endpoint, config.data, {
      ...options,
      ...(config.headers ? { headers: config.headers } : {}),
    })) as T;

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result) as T;
    }

    return result;
  };

  public put = async <T>(endpoint: string, data?: unknown): Promise<T> => {
    let config: RequestConfig = {
      url: endpoint,
      method: "PUT",
      data,
      headers: {},
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = (await HttpMethods.put<T>(endpoint, config.data)) as T;

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result) as T;
    }

    return result;
  };

  public patch = async <T>(endpoint: string, data?: unknown): Promise<T> => {
    let config: RequestConfig = {
      url: endpoint,
      method: "PATCH",
      data,
      headers: {},
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = (await HttpMethods.patch<T>(endpoint, config.data)) as T;

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result) as T;
    }

    return result;
  };

  public delete = async <T>(endpoint: string): Promise<T> => {
    let config: RequestConfig = {
      url: endpoint,
      method: "DELETE",
      headers: {},
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config);
    }

    let result = (await HttpMethods.deleteFn<T>(endpoint)) as T;

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result) as T;
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
  public addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig,
  ): void {
    this.requestInterceptors.push(interceptor);
  }

  public removeRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig,
  ): void {
    const index = this.requestInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.requestInterceptors.splice(index, 1);
    }
  }

  public addResponseInterceptor(
    interceptor: (response: unknown) => unknown,
  ): void {
    this.responseInterceptors.push(interceptor);
  }

  public removeResponseInterceptor(
    interceptor: (response: unknown) => unknown,
  ): void {
    const index = this.responseInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.responseInterceptors.splice(index, 1);
    }
  }

  // Internal accessor for interceptors
  public getRequestInterceptors(): Array<
    (config: RequestConfig) => RequestConfig
  > {
    return this.requestInterceptors;
  }

  public getResponseInterceptors(): Array<(response: unknown) => unknown> {
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
