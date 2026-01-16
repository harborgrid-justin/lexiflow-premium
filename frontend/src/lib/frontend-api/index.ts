/**
 * Frontend API Module
 * Enterprise-grade API layer per architectural standard
 *
 * @module lib/frontend-api
 * @description Central exports for frontend API architecture:
 * - Result<T> type system
 * - Domain error model
 * - HTTP client
 * - Validation schemas
 * - Normalization helpers
 *
 * ARCHITECTURE POSITION:
 * Backend API → Frontend API → Loaders/Actions → Context → Views
 *
 * KEY PRINCIPLES:
 * 1. Frontend APIs are domain contracts, not transport wrappers
 * 2. UI components NEVER call backend directly
 * 3. All APIs return Result<T>, never throw
 * 4. Domain errors, not HTTP codes
 * 5. Pure functions, no React/UI dependencies
 * 6. Validation at API boundary
 * 7. Normalization centralizes backend drift handling
 *
 * @example Basic API implementation
 * ```typescript
 * import { client, type Result, success, failure } from '@/lib/frontend-api';
 * import { normalizeReport } from '@/lib/normalization/report';
 *
 * export async function getReport(id: string): Promise<Result<Report>> {
 *   const result = await client.get<BackendReport>(`/reports/${id}`);
 *
 *   if (!result.ok) {
 *     return result; // Propagate error
 *   }
 *
 *   return success(normalizeReport(result.data));
 * }
 * ```
 *
 * @example Loader consumption
 * ```typescript
 * // routes/reports/loader.ts
 * export async function reportLoader({ params }) {
 *   const result = await getReport(params.id);
 *
 *   if (!result.ok) {
 *     throw result.error.toResponse(); // Convert to HTTP response
 *   }
 *
 *   return result.data; // Return normalized data
 * }
 * ```
 *
 * @example Component usage (via loader)
 * ```typescript
 * // components/ReportView.tsx
 * export function ReportView() {
 *   const report = useLoaderData<Report>(); // Typed, normalized data
 *   return <div>{report.title}</div>;
 * }
 * ```
 */

// Core type system
export type {
  ErrorType,
  Failure,
  FieldError,
  DomainError as IDomainError,
  PaginatedResult,
  ResponseMetadata,
  Result,
  Success,
} from "./types";

export {
  ErrorType,
  combineResults,
  failure,
  isFailure,
  isSuccess,
  mapResult,
  success,
  unwrap,
} from "./types";

// Domain errors
export {
  AuthError,
  BusinessLogicError,
  CancelledError,
  ConflictError,
  DomainError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  UnknownError,
  ValidationError,
  extractFieldErrors,
  mapFetchError,
  mapHttpStatusToError,
} from "./errors";

// HTTP client
export { client, createClient } from "./client";
export type { ClientConfig, RequestOptions } from "./client";

// Validation
export { schemas, validate, validators } from "./schemas";
export type { FieldValidator, Schema, Validator } from "./schemas";

// Re-export normalization (for convenience)
export * from "@/lib/normalization";

// Re-export backend mode detection from config
export { isBackendApiEnabled } from "@/config/network/api.config";

export { AuthApiService } from "@/api/auth/auth-api";

// Note: dataPlatformApi not re-exported here to avoid circular dependencies.
// Import directly from '@/lib/frontend-api/data-platform' if needed.

// Domain API modules - export only the API objects to avoid name conflicts
export type { ApiNotification } from "@/api/communications/notifications-api";
export { adminApi } from "./admin";
export { analyticsApi } from "./analytics";
export { authApi } from "./auth";
export { billingApi } from "./billing";
export { casesApi } from "./cases";
export { communicationsApi } from "./communications";
export { complianceApi } from "./compliance";
export { discoveryApi } from "./discovery";
export { docketApi } from "./docket";
export { documentsApi } from "./documents";
export { hrApi } from "./hr";
export { integrationsApi } from "./integrations";
export { intelligenceApi } from "./intelligence";
export { trialApi } from "./trial";
export { workflowApi } from "./workflow";

// Export types from domain modules
export type { DashboardMetrics } from "./analytics";
export type { AuthResponse, LoginInput } from "./auth";
export type {
  CaseFilters,
  CaseStats,
  CreateCaseInput,
  UpdateCaseInput,
} from "./cases";

export { DOCUMENTS_QUERY_KEYS } from "@/api/admin/documents-api";
export { catalogApi } from "./catalog";
export { knowledgeApi } from "./knowledge";
