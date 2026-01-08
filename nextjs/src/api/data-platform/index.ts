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
export { SchemaManagementApiService } from "./schema-management-api";
export type { Migration, SchemaTable, Snapshot } from "./schema-management-api";

// Query Workbench
export { QueryWorkbenchApiService } from "./query-workbench-api";
export type {
  QueryHistoryItem,
  QueryResult,
  SavedQuery,
} from "./query-workbench-api";

// Pipelines
export { PipelinesApiService } from "./pipelines-api";
export type { Pipeline } from "./pipelines-api";

// Sync Engine
export { SyncApiService } from "./sync-api";
export type { SyncConflict, SyncQueueItem, SyncStatus } from "./sync-api";

// Backups
export { BackupsApiService } from "./backups-api";
export type { BackupSchedule, BackupSnapshot } from "./backups-api";

// Monitoring
export { MonitoringApiService } from "./monitoring-api";
export type {
  PerformanceMetric,
  SystemAlert,
  SystemHealth,
} from "./monitoring-api";

// AI Operations
export { AiOpsApiService } from "./ai-ops-api";
export type { AIModel, VectorEmbedding } from "./ai-ops-api";

// Versioning
export { VersioningApiService } from "./versioning-api";
export type { DataVersion } from "./versioning-api";

// Import service classes for the unified API instance
import { AiOpsApiService } from "./ai-ops-api";
import { BackupsApiService } from "./backups-api";
import { DataCatalogApiService } from "./data-catalog-api"; // Import DataCatalogApiService
import { MonitoringApiService } from "./monitoring-api";
import { PipelinesApiService } from "./pipelines-api";
import { QueryWorkbenchApiService } from "./query-workbench-api";
import { SchemaManagementApiService } from "./schema-management-api";
import { SyncApiService } from "./sync-api";
import { VersioningApiService } from "./versioning-api";

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
  dataCatalog: new DataCatalogApiService(),
};

// Export newly organized services
export * from "./data-catalog-api";
export * from "./data-sources-api";
export * from "./rls-policies-api";
