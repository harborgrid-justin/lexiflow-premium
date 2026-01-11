/**
 * API Client - Main Composition
 * Enterprise-grade HTTP client with authentication and health monitoring
 */

import { buildBaseURL } from "./config";
import * as AuthManager from "./auth-manager";
import * as HttpMethods from "./http-methods";
import * as BlobHandler from "./blob-handler";
import * as FileUpload from "./file-upload";
import * as HealthCheck from "./health-check";

/**
 * ApiClient Class
 * Aggregates all API client functionality
 */
export class ApiClient {
  private get baseURL(): string {
    return buildBaseURL();
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
  public isAuthenticated = AuthManager.isAuthenticated;

  // HTTP methods
  public get = HttpMethods.get;
  public post = HttpMethods.post;
  public put = HttpMethods.put;
  public patch = HttpMethods.patch;
  public delete = HttpMethods.deleteFn;

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
}

// Export singleton instance
export const apiClient = new ApiClient();
