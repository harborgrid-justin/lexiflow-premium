/**
 * Admin Frontend API
 * System administration and monitoring operations
 */

import {
  normalizeAuditLogs,
  normalizeSystemMetrics,
} from "../normalization/admin";
import { client, type Result, success } from "./index";

export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}): Promise<Result<any[]>> {
  const params: Record<string, string | number> = {};

  if (filters?.userId) params.userId = filters.userId;
  if (filters?.action) params.action = filters.action;
  if (filters?.startDate) params.startDate = filters.startDate.toISOString();
  if (filters?.endDate) params.endDate = filters.endDate.toISOString();
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;

  const result = await client.get<unknown>("/admin/audit-logs", { params });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeAuditLogs(items));
}

export async function getSystemMetrics(): Promise<Result<any>> {
  const result = await client.get<unknown>("/admin/metrics");

  if (!result.ok) {
    return result;
  }

  return success(normalizeSystemMetrics(result.data));
}

export async function getSystemHealth(): Promise<Result<any>> {
  const result = await client.get<unknown>("/admin/health");

  if (!result.ok) {
    return result;
  }

  return success(result.data);
}

export async function clearCache(cacheType?: string): Promise<Result<void>> {
  const params = cacheType ? { type: cacheType } : {};
  const result = await client.post<void>("/admin/cache/clear", null, {
    params,
  });

  return result;
}

export const adminApi = {
  getAuditLogs,
  getSystemMetrics,
  getSystemHealth,
  clearCache,
};
