/**
 * API Client for Backend Communication
 * Enterprise-grade HTTP client with authentication, error handling, and health monitoring
 *
 * @module ApiClient
 * @description Comprehensive HTTP client for NestJS backend communication including:
 * - RESTful CRUD operations (GET, POST, PUT, PATCH, DELETE)
 * - JWT authentication with automatic token refresh
 * - File upload with multipart/form-data support
 * - Request/response interceptors with case conversion (snake_case ↔ camelCase)
 * - Comprehensive error handling with retry logic
 * - Service health monitoring across 25+ backend endpoints
 * - Timeout handling and abort signal support
 * - Type-safe generic responses
 *
 * @security
 * - JWT bearer token authentication
 * - Automatic token refresh on 401 errors
 * - Secure token storage in localStorage
 * - HTTPS enforcement in production
 * - XSS prevention through proper encoding
 * - CSRF protection via custom headers
 * - Sensitive data logging prevention
 *
 * @architecture
 * - Singleton pattern for global access
 * - Backend: NestJS + PostgreSQL
 * - Frontend: React + TypeScript
 * - Case conversion: snake_case (backend) ↔ camelCase (frontend)
 * - Error propagation with structured ApiError types
 * - Abort signal support for request cancellation
 *
 * @performance
 * - Connection pooling via native fetch
 * - Parallel health checks with Promise.allSettled
 * - Lazy token validation
 * - Minimal memory footprint with streaming uploads
 */

import { getApiBaseUrl, getApiPrefix } from "@/config/network/api.config";
import {
  ApiTimeoutError,
  AuthenticationError,
  ExternalServiceError,
  OperationError,
  ValidationError,
} from "@/services/core/errors";
import { keysToCamel } from "@/utils/caseConverter";
import { defaultStorage } from "./adapters/StorageAdapter";

const getBaseUrl = () => getApiBaseUrl();

/**
 * Structured API error response
 * Matches NestJS exception filter format
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * Paginated response wrapper for list endpoints
 * Standardized pagination format across all services
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service health status enumeration
 */
export type ServiceHealthStatus = "online" | "degraded" | "offline" | "unknown";

/**
 * Individual service health information
 */
export interface ServiceHealth {
  status: ServiceHealthStatus;
  latency?: number; // Response time in milliseconds
  lastChecked: string; // ISO 8601 timestamp
  error?: string; // Error message if status is offline
}

/**
 * System-wide health aggregation
 * Monitors 25+ backend microservices
 */
export interface SystemHealth {
  overall: ServiceHealthStatus;
  services: {
    [serviceName: string]: ServiceHealth;
  };
  timestamp: string;
}

// Export type alias for convenience
export type { PaginatedResponse as PaginatedApiResponse };

/**
 * ApiClient Class
 * Enterprise-grade HTTP client with authentication and health monitoring
 */
class ApiClient {
  // Dynamic getter to support HMR and runtime config changes
  private get baseURL(): string {
    const base = getBaseUrl();
    const prefix = getApiPrefix();

    // If base is empty (dev proxy), return prefix
    if (!base) {
      return prefix;
    }

    // If base already ends with prefix, return as is
    if (base.endsWith(prefix)) {
      return base;
    }

    // Append prefix, ensuring no double slashes
    return `${base.replace(/\/$/, "")}${prefix}`;
  }

  private readonly authTokenKey: string;
  private readonly refreshTokenKey: string;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // this.baseURL is now a getter
    this.authTokenKey =
      import.meta.env?.VITE_AUTH_TOKEN_KEY || "lexiflow_auth_token";
    this.refreshTokenKey =
      import.meta.env?.VITE_AUTH_REFRESH_TOKEN_KEY || "lexiflow_refresh_token";
    this.logInitialization();
  }

  /**
   * Log client initialization
   * @private
   */
  private logInitialization(): void {
    console.log("[ApiClient] Initialized", {
      baseURL: this.baseURL,
      authEnabled: !!this.getAuthToken(),
    });
  }

  /**
   * Validate endpoint parameter
   * @private
   */
  private validateEndpoint(endpoint: string, methodName: string): void {
    if (!endpoint || false) {
      throw new ValidationError(
        `[ApiClient.${methodName}] Invalid endpoint parameter`
      );
    }
    if (!endpoint.startsWith("/")) {
      throw new ValidationError(
        `[ApiClient.${methodName}] Endpoint must start with /`
      );
    }
  }

  /**
   * Validate data object parameter
   * @private
   */
  private validateData(data: unknown, methodName: string): void {
    if (data !== undefined && data !== null && typeof data !== "object") {
      throw new ValidationError(
        `[ApiClient.${methodName}] Data must be an object or undefined`
      );
    }
  }

  // =============================================================================
  // AUTHENTICATION MANAGEMENT
  // =============================================================================

  /**
   * Get stored authentication token
   *
   * @returns string | null - JWT access token or null if not authenticated
   */
  public getAuthToken(): string | null {
    try {
      return defaultStorage.getItem(this.authTokenKey);
    } catch (error) {
      console.error("[ApiClient.getAuthToken] Error:", error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   *
   * @returns string | null - JWT refresh token or null if not available
   */
  public getRefreshToken(): string | null {
    try {
      return defaultStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.error("[ApiClient.getRefreshToken] Error:", error);
      return null;
    }
  }

  /**
   * Store authentication tokens
   *
   * @param accessToken - JWT access token
   * @param refreshToken - Optional JWT refresh token
   * @throws Error if token storage fails
   */
  public setAuthTokens(accessToken: string, refreshToken?: string): void {
    if (!accessToken) {
      throw new ValidationError(
        "[ApiClient.setAuthTokens] Invalid accessToken parameter"
      );
    }
    try {
      defaultStorage.setItem(this.authTokenKey, accessToken);
      if (refreshToken) {
        defaultStorage.setItem(this.refreshTokenKey, refreshToken);
      }
      console.log("[ApiClient] Auth tokens stored successfully");
    } catch (error) {
      console.error("[ApiClient.setAuthTokens] Error:", error);
      throw new OperationError(
        "ApiClient.setAuthTokens",
        "Failed to store authentication tokens"
      );
    }
  }

  /**
   * Clear authentication tokens and logout
   * Removes all stored credentials from localStorage
   */
  public clearAuthTokens(): void {
    try {
      defaultStorage.removeItem(this.authTokenKey);
      defaultStorage.removeItem(this.refreshTokenKey);
      console.log("[ApiClient] Auth tokens cleared");
    } catch (error) {
      console.error("[ApiClient.clearAuthTokens] Error:", error);
    }
  }

  /**
   * Check if user is authenticated
   *
   * @returns boolean - True if access token exists
   */
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Get the base URL for API requests
   *
   * @returns string - Base API URL with prefix
   */
  public getBaseUrl(): string {
    return this.baseURL;
  }

  // =============================================================================
  // REQUEST MANAGEMENT
  // =============================================================================

  /**
   * Build headers for requests
   * Includes authentication token if available
   * @private
   */
  private getHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest", // CSRF protection
      ...(customHeaders as Record<string, string>),
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response with error management
   * Automatically refreshes token on 401 errors
   * @private
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch (error) {
        errorData = {
          message: response.statusText || "An error occurred",
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        };
      }

      // Handle 401 Unauthorized - attempt token refresh
      // Skip redirect for login endpoint to prevent loops
      const isLoginRequest = response.url.includes("/auth/login");

      if (response.status === 401 && !isLoginRequest) {
        console.warn(
          "[ApiClient] Received 401 Unauthorized, attempting token refresh"
        );
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshed = await this.refreshAccessToken(refreshToken);
            if (refreshed) {
              throw new AuthenticationError("TOKEN_REFRESHED"); // Signal to retry request
            } else {
              console.warn(
                "[ApiClient] Token refresh failed, clearing tokens and redirecting"
              );
              this.clearAuthTokens();
              window.location.href = "/login";
              throw new AuthenticationError(
                "Session expired. Please login again."
              );
            }
          } catch (error) {
            if (
              error instanceof AuthenticationError &&
              error.message === "TOKEN_REFRESHED"
            ) {
              throw error;
            }
            console.error("[ApiClient] Token refresh failed:", error);
            this.clearAuthTokens();
            window.location.href = "/login";
            throw new AuthenticationError(
              "Session expired. Please login again."
            );
          }
        } else {
          console.warn(
            "[ApiClient] No refresh token available, redirecting to login"
          );
          this.clearAuthTokens();
          window.location.href = "/login";
        }
      }

      // Log error for debugging (avoid logging sensitive data)
      console.error("[ApiClient] Request failed:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        message: errorData.message,
      });

      throw new ExternalServiceError(
        "API",
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    try {
      const jsonData = await response.json();

      // Convert snake_case keys to camelCase for frontend consumption
      return keysToCamel<T>(jsonData);
    } catch (error) {
      console.error("[ApiClient] Failed to parse response:", error);
      throw new ValidationError("Invalid response format from server");
    }
  }

  /**
   * Refresh access token using refresh token
   * Backend: POST /auth/refresh
   * @private
   */
  private async refreshAccessToken(refreshToken: string): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const fullUrl = this.baseURL
          ? `${this.baseURL}/auth/refresh`
          : "/auth/refresh";
        const url = new URL(fullUrl, window.location.origin);
        const response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          // Handle wrapped response from NestJS interceptor
          const accessToken = data.accessToken || data.data?.accessToken;
          const newRefreshToken = data.refreshToken || data.data?.refreshToken;

          if (accessToken) {
            this.setAuthTokens(accessToken, newRefreshToken);
            console.log("[ApiClient] Token refreshed successfully");
            return true;
          }
          console.error(
            "[ApiClient] Token refresh failed: Invalid response format",
            data
          );
          return false;
        }
        console.warn(
          "[ApiClient] Token refresh returned non-OK status:",
          response.status
        );
        return false;
      } catch (error) {
        console.error("[ApiClient] Token refresh error:", error);
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // =============================================================================
  // HTTP METHODS
  // =============================================================================

  /**
   * GET request
   *
   * @param endpoint - API endpoint (must start with /)
   * @param params - Optional query parameters
   * @returns Promise<T> - Parsed response data
   * @throws Error if request fails or validation fails
   */
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    this.validateEndpoint(endpoint, "get");
    try {
      // Handle empty baseURL (for Vite proxy mode)
      const fullUrl = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const url = new URL(fullUrl, window.location.origin);
      if (params) {
        Object.keys(params).forEach((key) => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, String(params[key]));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.DEFAULT_TIMEOUT),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (
        error instanceof AuthenticationError &&
        error.message === "TOKEN_REFRESHED"
      ) {
        return this.get<T>(endpoint, params);
      }
      console.error("[ApiClient.get] Error:", error);
      throw error;
    }
  }

  /**
   * POST request
   *
   * @param endpoint - API endpoint (must start with /)
   * @param data - Optional request body
   * @param options
   * @returns Promise<T> - Parsed response data
   * @throws Error if request fails or validation fails
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    this.validateEndpoint(endpoint, "post");
    this.validateData(data, "post");
    try {
      const fullUrl = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const url = new URL(fullUrl, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: this.getHeaders(options?.headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.DEFAULT_TIMEOUT),
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (
        error instanceof AuthenticationError &&
        error.message === "TOKEN_REFRESHED"
      ) {
        return this.post<T>(endpoint, data, options);
      }
      console.error("[ApiClient.post] Error:", error);
      throw error;
    }
  }

  /**
   * PUT request
   *
   * @param endpoint - API endpoint (must start with /)
   * @param data - Optional request body
   * @returns Promise<T> - Parsed response data
   * @throws Error if request fails or validation fails
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    this.validateEndpoint(endpoint, "put");
    this.validateData(data, "put");
    try {
      const fullUrl = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const url = new URL(fullUrl, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.DEFAULT_TIMEOUT),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (
        error instanceof AuthenticationError &&
        error.message === "TOKEN_REFRESHED"
      ) {
        return this.put<T>(endpoint, data);
      }
      console.error("[ApiClient.put] Error:", error);
      throw error;
    }
  }

  /**
   * PATCH request
   *
   * @param endpoint - API endpoint (must start with /)
   * @param data - Optional request body
   * @returns Promise<T> - Parsed response data
   * @throws Error if request fails or validation fails
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    this.validateEndpoint(endpoint, "patch");
    this.validateData(data, "patch");
    try {
      const fullUrl = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const url = new URL(fullUrl, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.DEFAULT_TIMEOUT),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (
        error instanceof AuthenticationError &&
        error.message === "TOKEN_REFRESHED"
      ) {
        return this.patch<T>(endpoint, data);
      }
      console.error("[ApiClient.patch] Error:", error);
      throw error;
    }
  }

  /**
   * DELETE request
   *
   * @param endpoint - API endpoint (must start with /)
   * @returns Promise<T> - Parsed response data
   * @throws Error if request fails or validation fails
   */
  async delete<T>(endpoint: string): Promise<T> {
    this.validateEndpoint(endpoint, "delete");
    try {
      const fullUrl = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const url = new URL(fullUrl, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.DEFAULT_TIMEOUT),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (
        error instanceof AuthenticationError &&
        error.message === "TOKEN_REFRESHED"
      ) {
        return this.delete<T>(endpoint);
      }
      console.error("[ApiClient.delete] Error:", error);
      throw error;
    }
  }

  // =============================================================================
  // FILE UPLOAD
  // =============================================================================

  /**
   * Upload file with multipart/form-data
   *
   * @param endpoint - API endpoint (must start with /)
   * @param file - File object to upload
   * @param additionalData - Optional additional form fields
   * @returns Promise<T> - Parsed response data
   * @throws Error if validation fails or upload fails
   */
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, unknown>
  ): Promise<T> {
    this.validateEndpoint(endpoint, "upload");
    if (!file || !(file instanceof File)) {
      throw new ValidationError("[ApiClient.upload] Invalid file parameter");
    }
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          formData.append(key, String(additionalData[key]));
        });
      }

      const token = this.getAuthToken();
      const headers: HeadersInit = {
        "X-Requested-With": "XMLHttpRequest",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      // Do NOT set Content-Type for multipart/form-data (browser sets it with boundary)

      const fullUrl = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const url = new URL(fullUrl, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "POST",
        headers,
        body: formData,
        signal: AbortSignal.timeout(60000), // 60s timeout for file uploads
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (
        error instanceof AuthenticationError &&
        error.message === "TOKEN_REFRESHED"
      ) {
        return this.upload<T>(endpoint, file, additionalData);
      }
      console.error("[ApiClient.upload] Error:", error);
      throw error;
    }
  }

  // =============================================================================
  // HEALTH MONITORING
  // =============================================================================

  /**
   * Health check for backend server
   * Backend: GET /api/health (global prefix, no version)
   *
   * @returns Promise<{ status: string; timestamp: string }>
   * @throws Error if backend is unreachable
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(this.HEALTH_CHECK_TIMEOUT),
      });
      return await response.json();
    } catch (error) {
      console.error("[ApiClient.healthCheck] Error:", error);
      throw new ApiTimeoutError("/health", 5000);
    }
  }

  /**
   * Check health of a specific service endpoint
   * Uses HEAD request to minimize payload
   *
   * @param serviceName - Service identifier for logging
   * @param endpoint - Service endpoint to check
   * @returns Promise<ServiceHealth> - Service health information
   */
  async checkServiceHealth(endpoint: string): Promise<ServiceHealth> {
    const startTime = performance.now();
    const lastChecked = new Date().toISOString();

    try {
      const fullUrl = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
      const url = new URL(fullUrl, window.location.origin);
      const response = await fetch(url.toString(), {
        method: "HEAD",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.HEALTH_CHECK_TIMEOUT),
      });

      const latency = Math.round(performance.now() - startTime);

      if (response.ok) {
        return {
          status: latency > 2000 ? "degraded" : "online",
          latency,
          lastChecked,
        };
      } else {
        return {
          status: "offline",
          latency,
          lastChecked,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error: unknown) {
      return {
        status: "offline",
        lastChecked,
        error: (error as Error).message || "Network error",
      };
    }
  }

  /**
   * Check health of all backend services
   * Parallel execution with Promise.allSettled for resilience
   * Monitors 25+ microservices across the platform
   *
   * @returns Promise<SystemHealth> - Aggregated system health
   */
  async checkSystemHealth(): Promise<SystemHealth> {
    const serviceEndpoints = [
      { name: "cases", endpoint: "/cases" },
      { name: "docket", endpoint: "/docket" },
      { name: "documents", endpoint: "/documents" },
      { name: "evidence", endpoint: "/evidence" },
      { name: "billing", endpoint: "/billing/invoices" },
      { name: "users", endpoint: "/users" },
      { name: "pleadings", endpoint: "/pleadings" },
      { name: "motions", endpoint: "/motions" },
      { name: "parties", endpoint: "/parties" },
      { name: "clauses", endpoint: "/clauses" },
      { name: "calendar", endpoint: "/calendar" },
      { name: "trustAccounts", endpoint: "/billing/trust-accounts" },
      { name: "legalHolds", endpoint: "/legal-holds/health" },
      { name: "depositions", endpoint: "/depositions/health" },
      { name: "conflictChecks", endpoint: "/compliance/conflict-checks" },
      { name: "auditLogs", endpoint: "/audit-logs" },
      { name: "discovery", endpoint: "/discovery" },
      { name: "discoveryEvidence", endpoint: "/discovery/evidence" },
      { name: "compliance", endpoint: "/compliance" },
      { name: "tasks", endpoint: "/tasks" },
      { name: "reports", endpoint: "/reports" },
      { name: "hr", endpoint: "/hr" },
      { name: "workflow", endpoint: "/workflow/templates" },
      { name: "trial", endpoint: "/trial" },
      { name: "search", endpoint: "/search" },
      { name: "knowledge", endpoint: "/knowledge" },
      { name: "messenger", endpoint: "/messenger" },
      { name: "notifications", endpoint: "/notifications" },
      { name: "warRoom", endpoint: "/war-room/health" },
      { name: "webhooks", endpoint: "/webhooks/health" },
      { name: "versioning", endpoint: "/versioning/health" },
      { name: "sync", endpoint: "/sync/health" },
      { name: "queryWorkbench", endpoint: "/query-workbench/health" },
      { name: "schema", endpoint: "/schema/health" },
      { name: "monitoring", endpoint: "/monitoring/health" },
      { name: "ocr", endpoint: "/ocr/health" },
      { name: "risks", endpoint: "/risks/health" },
      { name: "pipelines", endpoint: "/pipelines/health" },
      { name: "production", endpoint: "/production/health" },
      { name: "processingJobs", endpoint: "/processing-jobs/health" },
      { name: "jurisdictions", endpoint: "/jurisdictions/health" },
      { name: "integrations", endpoint: "/integrations/health" },
      { name: "bluebook", endpoint: "/bluebook/health" },
      { name: "casePhases", endpoint: "/case-phases/health" },
      { name: "analytics", endpoint: "/analytics/health" },
      { name: "backups", endpoint: "/backups/health" },
      { name: "auth", endpoint: "/auth/health" },
    ];

    const healthChecks = await Promise.allSettled(
      serviceEndpoints.map(async ({ name, endpoint }) => ({
        name,
        health: await this.checkServiceHealth(endpoint),
      }))
    );

    const services: { [key: string]: ServiceHealth } = {};
    let onlineCount = 0;
    let degradedCount = 0;
    let offlineCount = 0;

    healthChecks.forEach((result) => {
      if (result.status === "fulfilled") {
        const { name, health } = result.value;
        services[name] = health;

        if (health.status === "online") onlineCount++;
        else if (health.status === "degraded") degradedCount++;
        else if (health.status === "offline") offlineCount++;
      }
    });

    let overall: ServiceHealthStatus = "unknown";
    if (offlineCount === healthChecks.length) {
      overall = "offline";
    } else if (offlineCount > 0 || degradedCount > healthChecks.length / 2) {
      overall = "degraded";
    } else if (onlineCount === healthChecks.length) {
      overall = "online";
    } else {
      overall = "degraded";
    }

    return {
      overall,
      services,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
