/**
 * Data Platform API Services
 * Real backend integration for all Data Platform features
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';

// ==================== SCHEMA MANAGEMENT ====================

export interface SchemaTable {
  name: string;
  columnCount: number;
  columns: {
    name: string;
    type: string;
    pk?: boolean;
    notNull?: boolean;
    unique?: boolean;
    fk?: string;
    defaultValue?: string;
  }[];
}

export interface Migration {
  id: string;
  name: string;
  description?: string;
  applied: boolean;
  createdAt: string;
  appliedAt?: string;
  appliedBy?: string;
}

export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  sizeBytes: number;
  createdAt: string;
  createdBy?: string;
}

export class SchemaManagementApiService {
  // Schema Inspection
  async getTables(): Promise<SchemaTable[]> {
    try {
      return await apiClient.get<SchemaTable[]>('/schema/tables');
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching tables:', error);
      return [];
    }
  }

  async getTableColumns(tableName: string): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`/schema/tables/${tableName}/columns`);
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching columns:', error);
      return [];
    }
  }

  // Migrations
  async getMigrations(): Promise<Migration[]> {
    try {
      return await apiClient.get<Migration[]>('/schema/migrations');
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching migrations:', error);
      return [];
    }
  }

  async createMigration(data: { name: string; up: string; down: string; description?: string }): Promise<Migration> {
    return await apiClient.post<Migration>('/schema/migrations', data);
  }

  async applyMigration(id: string): Promise<Migration> {
    return await apiClient.post<Migration>(`/schema/migrations/${id}/apply`, {});
  }

  async revertMigration(id: string): Promise<Migration> {
    return await apiClient.post<Migration>(`/schema/migrations/${id}/revert`, {});
  }

  // Snapshots
  async getSnapshots(): Promise<Snapshot[]> {
    try {
      return await apiClient.get<Snapshot[]>('/schema/snapshots');
    } catch (error) {
      console.error('[SchemaManagementApi] Error fetching snapshots:', error);
      return [];
    }
  }

  async getSnapshot(id: string): Promise<Snapshot> {
    return await apiClient.get<Snapshot>(`/schema/snapshots/${id}`);
  }

  async createSnapshot(data: { name: string; description?: string; tables?: string[] }): Promise<Snapshot> {
    return await apiClient.post<Snapshot>('/schema/snapshots', data);
  }

  async deleteSnapshot(id: string): Promise<void> {
    await apiClient.delete(`/schema/snapshots/${id}`);
  }

  // Table Operations
  async createTable(data: {
    name: string;
    columns: any[];
    description?: string;
  }): Promise<{ success: boolean; table: string }> {
    return await apiClient.post('/schema/tables', data);
  }

  async dropTable(tableName: string): Promise<{ success: boolean; table: string }> {
    return await apiClient.delete(`/schema/tables/${tableName}`);
  }
}

// ==================== QUERY WORKBENCH ====================

export interface QueryResult {
  success: boolean;
  data: any[];
  executionTimeMs: number;
  rowsAffected: number;
  error?: string;
  historyId: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  executionTimeMs?: number;
  rowsAffected?: number;
  successful: boolean;
  error?: string;
  executedAt: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  description?: string;
  tags?: string[];
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export class QueryWorkbenchApiService {
  async executeQuery(query: string): Promise<QueryResult> {
    try {
      return await apiClient.post<QueryResult>('/query-workbench/execute', { query });
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error executing query:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        data: [],
        executionTimeMs: 0,
        rowsAffected: 0,
        error: errorMessage,
        historyId: '',
      };
    }
  }

  async explainQuery(query: string): Promise<{ success: boolean; plan?: any; error?: string }> {
    try {
      return await apiClient.post('/query-workbench/explain', { query });
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error explaining query:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  async getHistory(limit = 100): Promise<QueryHistoryItem[]> {
    try {
      return await apiClient.get<QueryHistoryItem[]>('/query-workbench/history', { limit });
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error fetching history:', error);
      return [];
    }
  }

  async getSavedQueries(): Promise<SavedQuery[]> {
    try {
      return await apiClient.get<SavedQuery[]>('/query-workbench/saved');
    } catch (error) {
      console.error('[QueryWorkbenchApi] Error fetching saved queries:', error);
      return [];
    }
  }

  async saveQuery(data: {
    name: string;
    query: string;
    description?: string;
    tags?: string[];
    isShared?: boolean;
  }): Promise<SavedQuery> {
    return await apiClient.post<SavedQuery>('/query-workbench/saved', data);
  }

  async deleteSavedQuery(id: string): Promise<void> {
    await apiClient.delete(`/query-workbench/saved/${id}`);
  }
}

// ==================== ETL PIPELINES ====================

export interface Pipeline {
  id: string;
  name: string;
  type: 'ETL' | 'ELT' | 'Streaming' | 'Batch';
  sourceConnector: string;
  targetConnector: string;
  configuration: Record<string, any>;
  status: 'Running' | 'Active' | 'Paused' | 'Failed' | 'Draft' | 'Success';
  schedule?: string;
  recordsProcessed: number;
  lastRun?: string;
  lastRunStatus?: string;
  createdAt: string;
  // Additional fields for compatibility with PipelineJob
  duration?: number;
  volume?: number;
  logs?: Array<{ timestamp: string; level: string; message: string }>;
}

export class PipelinesApiService {
  async getAll(filters?: any): Promise<PaginatedResponse<Pipeline>> {
    try {
      return await apiClient.get<PaginatedResponse<Pipeline>>('/pipelines', filters);
    } catch (error) {
      console.error('[PipelinesApi] Error fetching pipelines:', error);
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async getById(id: string): Promise<Pipeline> {
    return await apiClient.get<Pipeline>(`/pipelines/${id}`);
  }

  async create(data: Partial<Pipeline>): Promise<Pipeline> {
    return await apiClient.post<Pipeline>('/pipelines', data);
  }

  async update(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    return await apiClient.put<Pipeline>(`/pipelines/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pipelines/${id}`);
  }

  async execute(id: string): Promise<{ jobId: string; status: string }> {
    return await apiClient.post(`/pipelines/${id}/execute`, {});
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    failed: number;
    paused: number;
    totalRecordsProcessed: number;
  }> {
    try {
      return await apiClient.get('/pipelines/stats');
    } catch (error) {
      return { total: 0, active: 0, failed: 0, paused: 0, totalRecordsProcessed: 0 };
    }
  }
}

// ==================== SYNC ENGINE ====================

export interface SyncStatus {
  pending: number;
  syncing: number;
  completed: number;
  failed: number;
  conflicts: number;
  lastSyncTime: string | null;
  isHealthy: boolean;
}

export interface SyncQueueItem {
  id: string;
  operation: string;
  entityType: string;
  entityId: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';
  retryCount: number;
  error?: string;
  createdAt: string;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: Record<string, any>;
  remoteVersion: Record<string, any>;
  conflictType: string;
  resolved: boolean;
  resolution?: string;
  createdAt: string;
}

export class SyncApiService {
  async getStatus(): Promise<SyncStatus> {
    try {
      return await apiClient.get<SyncStatus>('/sync/status');
    } catch (error) {
      return {
        pending: 0,
        syncing: 0,
        completed: 0,
        failed: 0,
        conflicts: 0,
        lastSyncTime: null,
        isHealthy: true,
      };
    }
  }

  async getQueue(filters?: any): Promise<PaginatedResponse<SyncQueueItem>> {
    try {
      return await apiClient.get<PaginatedResponse<SyncQueueItem>>('/sync/queue', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async getConflicts(filters?: any): Promise<PaginatedResponse<SyncConflict>> {
    try {
      return await apiClient.get<PaginatedResponse<SyncConflict>>('/sync/conflicts', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async resolveConflict(
    id: string,
    resolution: 'local' | 'remote' | 'merge',
    userId: string,
  ): Promise<SyncConflict> {
    return await apiClient.post<SyncConflict>(`/sync/conflicts/${id}/resolve`, { resolution, userId });
  }

  async retryFailed(ids: string[]): Promise<{ updated: number }> {
    return await apiClient.post('/sync/retry', { ids });
  }

  async clearCompleted(): Promise<{ deleted: number }> {
    return await apiClient.post('/sync/clear-completed', {});
  }
}

// ==================== BACKUPS ====================

export interface BackupSnapshot {
  id: string;
  name: string;
  description?: string;
  type: string;
  size: number;
  location: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

export interface BackupSchedule {
  id: string;
  name: string;
  cronExpression: string;
  type: string;
  databases?: string[];
  enabled: boolean;
  retentionDays: number;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
}

export class BackupsApiService {
  async getSnapshots(filters?: any): Promise<PaginatedResponse<BackupSnapshot>> {
    try {
      return await apiClient.get<PaginatedResponse<BackupSnapshot>>('/backups/snapshots', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async createSnapshot(data: {
    name: string;
    description?: string;
    type: string;
  }): Promise<BackupSnapshot> {
    return await apiClient.post<BackupSnapshot>('/backups/snapshots', data);
  }

  async deleteSnapshot(id: string): Promise<void> {
    await apiClient.delete(`/backups/snapshots/${id}`);
  }

  async restore(id: string, target: string): Promise<{ jobId: string; status: string }> {
    return await apiClient.post(`/backups/snapshots/${id}/restore`, { target });
  }

  async getSchedules(): Promise<BackupSchedule[]> {
    try {
      return await apiClient.get<BackupSchedule[]>('/backups/schedules');
    } catch (error) {
      return [];
    }
  }

  async createSchedule(data: Partial<BackupSchedule>): Promise<BackupSchedule> {
    return await apiClient.post<BackupSchedule>('/backups/schedules', data);
  }

  async updateSchedule(id: string, data: Partial<BackupSchedule>): Promise<BackupSchedule> {
    return await apiClient.put<BackupSchedule>(`/backups/schedules/${id}`, data);
  }

  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/backups/schedules/${id}`);
  }

  async getStats(): Promise<{
    totalSnapshots: number;
    totalSize: number;
    activeSchedules: number;
  }> {
    try {
      return await apiClient.get('/backups/stats');
    } catch (error) {
      return { totalSnapshots: 0, totalSize: 0, activeSchedules: 0 };
    }
  }
}

// ==================== MONITORING ====================

export interface PerformanceMetric {
  id: string;
  metricName: string;
  value: number;
  unit?: string;
  tags?: Record<string, any>;
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  acknowledged: boolean;
  resolved: boolean;
  createdAt: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded';
  cpuUsage: number;
  memoryUsage: number;
  activeAlerts: number;
  timestamp: string;
}

export class MonitoringApiService {
  async getHealth(): Promise<SystemHealth> {
    try {
      return await apiClient.get<SystemHealth>('/monitoring/health');
    } catch (error) {
      return {
        status: 'degraded',
        cpuUsage: 0,
        memoryUsage: 0,
        activeAlerts: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getMetrics(filters?: {
    metricName?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): Promise<{ data: PerformanceMetric[] }> {
    try {
      return await apiClient.get('/monitoring/metrics', filters);
    } catch (error) {
      return { data: [] };
    }
  }

  async recordMetric(data: {
    metricName: string;
    value: number;
    unit?: string;
    tags?: Record<string, any>;
  }): Promise<PerformanceMetric> {
    return await apiClient.post<PerformanceMetric>('/monitoring/metrics', data);
  }

  async getAlerts(filters?: any): Promise<PaginatedResponse<SystemAlert>> {
    try {
      return await apiClient.get<PaginatedResponse<SystemAlert>>('/monitoring/alerts', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async acknowledgeAlert(id: string, userId: string): Promise<SystemAlert> {
    return await apiClient.post<SystemAlert>(`/monitoring/alerts/${id}/acknowledge`, { userId });
  }

  async resolveAlert(id: string): Promise<SystemAlert> {
    return await apiClient.post<SystemAlert>(`/monitoring/alerts/${id}/resolve`, {});
  }
}

// ==================== AI DATA OPS ====================

export interface VectorEmbedding {
  id: string;
  entityType: string;
  entityId: string;
  embedding: number[];
  model: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AIModel {
  id: string;
  name: string;
  type: string;
  provider: string;
  version: string;
  configuration: Record<string, any>;
  active: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
}

export class AiOpsApiService {
  async getEmbeddings(filters?: any): Promise<PaginatedResponse<VectorEmbedding>> {
    try {
      return await apiClient.get<PaginatedResponse<VectorEmbedding>>('/ai-ops/embeddings', filters);
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async storeEmbedding(data: Partial<VectorEmbedding>): Promise<VectorEmbedding> {
    return await apiClient.post<VectorEmbedding>('/ai-ops/embeddings', data);
  }

  async searchSimilar(embedding: number[], limit = 10): Promise<{ results: any[] }> {
    try {
      return await apiClient.post('/ai-ops/embeddings/search', { embedding, limit });
    } catch (error) {
      return { results: [] };
    }
  }

  async getModels(): Promise<AIModel[]> {
    try {
      return await apiClient.get<AIModel[]>('/ai-ops/models');
    } catch (error) {
      return [];
    }
  }

  async registerModel(data: Partial<AIModel>): Promise<AIModel> {
    return await apiClient.post<AIModel>('/ai-ops/models', data);
  }

  async updateModel(id: string, data: Partial<AIModel>): Promise<AIModel> {
    return await apiClient.put<AIModel>(`/ai-ops/models/${id}`, data);
  }

  async deleteModel(id: string): Promise<void> {
    await apiClient.delete(`/ai-ops/models/${id}`);
  }

  async getStats(): Promise<{
    totalEmbeddings: number;
    totalModels: number;
    activeModels: number;
    totalUsage: number;
  }> {
    try {
      return await apiClient.get('/ai-ops/stats');
    } catch (error) {
      return { totalEmbeddings: 0, totalModels: 0, activeModels: 0, totalUsage: 0 };
    }
  }
}

// ==================== VERSION CONTROL ====================

export interface DataVersion {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  data: Record<string, any>;
  branch?: string;
  tag?: string;
  commitMessage?: string;
  createdBy?: string;
  createdAt: string;
}

export class VersioningApiService {
  async getHistory(
    entityType: string,
    entityId: string,
    filters?: any,
  ): Promise<PaginatedResponse<DataVersion>> {
    try {
      return await apiClient.get<PaginatedResponse<DataVersion>>(
        `/versioning/history/${entityType}/${entityId}`,
        filters,
      );
    } catch (error) {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  async createVersion(data: {
    entityType: string;
    entityId: string;
    data: Record<string, any>;
    branch?: string;
    tag?: string;
    commitMessage?: string;
    userId?: string;
  }): Promise<DataVersion> {
    return await apiClient.post<DataVersion>('/versioning', data);
  }

  async getBranches(entityType: string, entityId: string): Promise<string[]> {
    try {
      return await apiClient.get<string[]>(`/versioning/branches/${entityType}/${entityId}`);
    } catch (error) {
      return [];
    }
  }

  async getTags(entityType: string, entityId: string): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`/versioning/tags/${entityType}/${entityId}`);
    } catch (error) {
      return [];
    }
  }

  async tagVersion(id: string, tag: string): Promise<DataVersion> {
    return await apiClient.post<DataVersion>(`/versioning/${id}/tag`, { tag });
  }

  async compareVersions(id1: string, id2: string): Promise<{
    version1: any;
    version2: any;
  }> {
    return await apiClient.get(`/versioning/compare/${id1}/${id2}`);
  }
}

// ==================== EXPORT ====================

export const dataPlatformApi = {
  schemaManagement: new SchemaManagementApiService(),
  queryWorkbench: new QueryWorkbenchApiService(),
  pipelines: new PipelinesApiService(),
  sync: new SyncApiService(),
  backups: new BackupsApiService(),
  monitoring: new MonitoringApiService(),
  aiOps: new AiOpsApiService(),
  versioning: new VersioningApiService(),
};
