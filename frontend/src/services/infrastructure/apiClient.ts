/**
 * API Client for Backend Communication
 *
 * NOTE: This file has been refactored into modular components.
 * All exports are now re-exported from the api-client/ directory for backward compatibility.
 *
 * New imports should use:
 * import { apiClient, ApiClient } from '@/services/infrastructure/api-client';
 *
 * This file maintains backward compatibility for existing imports.
 */

export {
  ApiClient,
  apiClient,
  type ApiError,
  type PaginatedResponse,
  type PaginatedApiResponse,
  type ServiceHealth,
  type ServiceHealthStatus,
  type SystemHealth,
} from "./api-client";
