/**
 * Core API types and interfaces
 * Shared across all API client modules
 */

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
  latency?: number;
  lastChecked: string;
  error?: string;
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

/**
 * Export type alias for convenience
 */
export type { PaginatedResponse as PaginatedApiResponse };
