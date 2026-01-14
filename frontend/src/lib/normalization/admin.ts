/**
 * Admin Domain Normalizers
 * Transform backend admin/system data to frontend format
 */

import {
  normalizeArray,
  normalizeDate,
  normalizeId,
  normalizeNumber,
  normalizeString,
  type Normalizer,
} from "./index";

interface BackendAuditLog {
  id: string | number;
  user_id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  timestamp?: string;
  ip_address?: string;
}

export const normalizeAuditLog: Normalizer<BackendAuditLog, any> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    userId: normalizeString(backend.user_id),
    action: normalizeString(backend.action),
    resourceType: normalizeString(backend.resource_type),
    resourceId: normalizeString(backend.resource_id),
    timestamp: normalizeDate(backend.timestamp) || new Date(),
    ipAddress: normalizeString(backend.ip_address),
  };
};

export function normalizeAuditLogs(backendLogs: unknown): any[] {
  return normalizeArray(backendLogs, normalizeAuditLog);
}

interface BackendSystemMetrics {
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  active_users?: number;
  timestamp?: string;
}

export const normalizeSystemMetrics: Normalizer<BackendSystemMetrics, any> = (
  backend
) => {
  return {
    cpuUsage: normalizeNumber(backend.cpu_usage),
    memoryUsage: normalizeNumber(backend.memory_usage),
    diskUsage: normalizeNumber(backend.disk_usage),
    activeUsers: normalizeNumber(backend.active_users),
    timestamp: normalizeDate(backend.timestamp) || new Date(),
  };
};
