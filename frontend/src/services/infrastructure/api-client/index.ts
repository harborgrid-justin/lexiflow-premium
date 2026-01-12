/**
 * API Client Module - Barrel Export
 * Provides clean import paths for all API client functionality
 */

// Export main client
export { ApiClient, apiClient } from "./api-client";

// Export types
export type {
  ApiError,
  PaginatedApiResponse,
  PaginatedResponse,
  ServiceHealth,
  ServiceHealthStatus,
  SystemHealth,
} from "./types";

// Export config utilities (for advanced use cases)
export { buildBaseURL, getOrigin } from "./config";

// Export auth utilities (for direct use if needed)
export {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  isAuthenticated,
  isTokenExpiringSoon,
  setAuthTokens,
} from "./auth-manager";
