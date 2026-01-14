/**
 * Admin Frontend API
 * Enterprise-grade API layer for system administration and monitoring
 *
 * @module lib/frontend-api/admin
 * @description Domain-level contract for admin operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 */

import {
  normalizeAuditLogs,
  normalizeSystemMetrics,
} from "../normalization/admin";
import {
  client,
  failure,
  type PaginatedResult,
  type Result,
  success,
  ValidationError,
} from "./index";

/**
 * Audit log filters
 */
export interface AuditLogFilters {
  userId?: string;
  action?: string;
  actionType?: "create" | "read" | "update" | "delete";
  dateFrom?: string;
  dateTo?: string;
  status?: "success" | "failure";
  page?: number;
  limit?: number;
  sortBy?: "timestamp" | "action" | "user";
  sortOrder?: "asc" | "desc";
}

/**
 * System metrics result
 */
export interface SystemMetricsResult {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  timestamp: string;
}

/**
 * System health result
 */
export interface SystemHealthResult {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  database: "connected" | "disconnected";
  cache: "connected" | "disconnected";
  externalServices: Record<string, boolean>;
  lastChecked: string;
}

/**
 * Audit log item
 */
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  actionType: string;
  resource: string;
  status: "success" | "failure";
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  duration: number;
}

/**
 * Get paginated audit logs with filters
 */
export async function getAuditLogs(
  filters?: AuditLogFilters
): Promise<Result<PaginatedResult<AuditLog>>> {
  // Validation
  if (filters?.page !== undefined && filters.page < 1) {
    return failure(new ValidationError("Page must be greater than 0"));
  }
  if (filters?.limit !== undefined && filters.limit < 1) {
    return failure(new ValidationError("Limit must be greater than 0"));
  }

  const params: Record<string, string | number> = {};

  if (
    filters?.userId &&
    typeof filters.userId === "string" &&
    filters.userId.trim()
  ) {
    params.userId = filters.userId.trim();
  }
  if (
    filters?.action &&
    typeof filters.action === "string" &&
    filters.action.trim()
  ) {
    params.action = filters.action.trim();
  }
  if (filters?.actionType) params.actionType = filters.actionType;
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;
  if (filters?.status) params.status = filters.status;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/admin/audit-logs", { params });

  if (!result.ok) {
    return result;
  }

  const data = result.data as Record<string, unknown>;
  const items = Array.isArray(data.data) ? data.data : [];
  const total = typeof data.total === "number" ? data.total : 0;
  const page = typeof data.page === "number" ? data.page : 1;
  const limit = typeof data.limit === "number" ? data.limit : 50;

  const normalized = normalizeAuditLogs(items);
  return success({
    data: normalized as AuditLog[],
    total,
    page,
    pageSize: limit,
    hasMore: page * limit < total,
  });
}

/**
 * Get current system metrics
 */
export async function getSystemMetrics(): Promise<Result<SystemMetricsResult>> {
  const result = await client.get<unknown>("/admin/metrics");

  if (!result.ok) {
    return result;
  }

  const normalized = normalizeSystemMetrics(result.data);
  return success(normalized as SystemMetricsResult);
}

/**
 * Get system health status
 */
export async function getSystemHealth(): Promise<Result<SystemHealthResult>> {
  const result = await client.get<unknown>("/admin/health");

  if (!result.ok) {
    return result;
  }

  const data = result.data as Record<string, unknown>;
  return success({
    status: (data.status as string) === "healthy" ? "healthy" : "degraded",
    uptime: typeof data.uptime === "number" ? data.uptime : 0,
    database:
      (data.database as string) === "connected" ? "connected" : "disconnected",
    cache:
      (data.cache as string) === "connected" ? "connected" : "disconnected",
    externalServices: (data.externalServices as Record<string, boolean>) || {},
    lastChecked: data.lastChecked as string,
  });
}

/**
 * Clear cache by type
 */
export async function clearCache(
  cacheType?: string
): Promise<Result<{ cleared: number }>> {
  if (cacheType && typeof cacheType === "string" && cacheType.length === 0) {
    return failure(
      new ValidationError("Cache type cannot be empty if provided")
    );
  }

  const params = cacheType ? { type: cacheType } : {};
  const result = await client.post<unknown>("/admin/cache/clear", null, {
    params,
  });

  if (!result.ok) {
    return result;
  }

  const data = result.data as Record<string, unknown>;
  return success({
    cleared: typeof data.cleared === "number" ? data.cleared : 0,
  });
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(id: string): Promise<Result<AuditLog>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Audit log ID is required"));
  }

  const result = await client.get<unknown>(`/admin/audit-logs/${id.trim()}`);

  if (!result.ok) {
    return result;
  }

  const normalized = normalizeAuditLogs([result.data]);
  return success((normalized[0] || { id }) as AuditLog);
}

export const adminApi = {
  getAuditLogs,
  getAuditLogById,
  getSystemMetrics,
  getSystemHealth,
  clearCache,
};
