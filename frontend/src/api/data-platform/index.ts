/**
 * @module services/api/data-platform/index
 * @description Data Platform API barrel export
 * Consolidates all data platform API services
 * 
 * **ARCHITECTURE**: Each service is now in a focused, single-responsibility module
 * 
 * Service Modules:
 * - schema-management-api.ts - Database schema operations
 * - query-workbench-api.ts - SQL query execution
 * - pipelines-api.ts - ETL/ELT pipeline management
 * - sync-api.ts - Data synchronization
 * - backups-api.ts - Backup and restore
 * - monitoring-api.ts - System monitoring and alerts
 * - ai-ops-api.ts - AI/ML operations and embeddings
 * - versioning-api.ts - Data version control
 */

// Schema Management
export type { SchemaTable, Migration, Snapshot } from './schema-management-api';
export { SchemaManagementApiService } from './schema-management-api';

// Query Workbench
export type { QueryResult, QueryHistoryItem, SavedQuery } from './query-workbench-api';
export { QueryWorkbenchApiService } from './query-workbench-api';

// Pipelines
export type { Pipeline } from './pipelines-api';
export { PipelinesApiService } from './pipelines-api';

// Sync Engine
export type { SyncStatus, SyncQueueItem, SyncConflict } from './sync-api';
export { SyncApiService } from './sync-api';

// Backups
export type { BackupSnapshot, BackupSchedule } from './backups-api';
export { BackupsApiService } from './backups-api';

// Monitoring
export type { PerformanceMetric, SystemAlert, SystemHealth } from './monitoring-api';
export { MonitoringApiService } from './monitoring-api';

// AI Operations
export type { VectorEmbedding, AIModel } from './ai-ops-api';
export { AiOpsApiService } from './ai-ops-api';

// Versioning
export type { DataVersion } from './versioning-api';
export { VersioningApiService } from './versioning-api';

// Import service classes for the unified API instance
import { SchemaManagementApiService } from '@/api';
import { QueryWorkbenchApiService } from '@/api';
import { PipelinesApiService } from './pipelines-api';
import { SyncApiService } from './sync-api';
import { BackupsApiService } from './backups-api';
import { MonitoringApiService } from './monitoring-api';
import { AiOpsApiService } from './ai-ops-api';
import { VersioningApiService } from './versioning-api';

/**
 * Unified data platform API instance
 * Provides access to all data platform services
 * 
 * @example
 * ```ts
 * import { dataPlatformApi } from 'services/api/data-platform';
 * 
 * // Schema management
 * const tables = await dataPlatformApi.schemaManagement.getTables();
 * 
 * // Query execution
 * const result = await dataPlatformApi.queryWorkbench.executeQuery('SELECT * FROM cases');
 * 
 * // Pipeline management
 * const pipelines = await dataPlatformApi.pipelines.getAll();
 * ```
 */
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
