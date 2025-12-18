/**
 * Audit Logs API Service
 * Tracks all system activities and changes
 */

import { apiClient } from '../infrastructure/apiClient';

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AuditLogFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export class AuditLogsApiService {
  private readonly baseUrl = '/audit-logs';

  async getAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.entityId) params.append('entityId', filters.entityId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<AuditLog[]>(url);
  }

  async getById(id: string): Promise<AuditLog> {
    return apiClient.get<AuditLog>(`${this.baseUrl}/${id}`);
  }

  async getByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.getAll({ entityType, entityId });
  }

  async getByUser(userId: string): Promise<AuditLog[]> {
    return this.getAll({ userId });
  }
}
