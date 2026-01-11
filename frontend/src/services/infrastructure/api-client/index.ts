/**
 * API Client Module - Barrel Export
 * Provides clean import paths for all API client functionality
 */

// Export main client
export { ApiClient, apiClient } from "./api-client";

// Export types
export type {
  ApiError,
  PaginatedResponse,
  PaginatedApiResponse,
  ServiceHealth,
  ServiceHealthStatus,
  SystemHealth,
} from "./types";

// Export config utilities (for advanced use cases)
export { buildBaseURL, getOrigin } from "./config";

// Export auth utilities (for direct use if needed)
export {
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated,
} from "./auth-manager";
