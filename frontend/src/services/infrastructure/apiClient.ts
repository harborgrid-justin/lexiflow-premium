/**
 * API Client - Backward Compatibility Export
 *
 * This file provides backward compatibility for imports using 'apiClient' (capital C)
 * Re-exports from the main api-client module.
 */

export {
  ApiClient,
  apiClient,
  type ApiError,
  type PaginatedApiResponse,
  type PaginatedResponse,
  type ServiceHealth,
  type ServiceHealthStatus,
  type SystemHealth,
} from "./api-client";

// Default export for legacy compatibility
export { apiClient as default } from "./api-client";
