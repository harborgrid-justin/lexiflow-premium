/**
 * @module services/api/data-platform-api
 * @description Data Platform API Services - Backwards Compatible Barrel Export
 * 
 * **REFACTORED**: This file now re-exports from focused, single-responsibility modules
 * All implementations moved to services/api/data-platform/*
 * 
 * Architecture:
 * - schema-management-api.ts - Database schema operations
 * - query-workbench-api.ts - SQL query execution
 * - pipelines-api.ts - ETL/ELT pipeline management
 * - sync-api.ts - Data synchronization
 * - backups-api.ts - Backup and restore
 * - monitoring-api.ts - System monitoring and alerts
 * - ai-ops-api.ts - AI/ML operations and embeddings
 * - versioning-api.ts - Data version control
 * 
 * @deprecated Import from ''services/api/data-platform'' directly for better tree-shaking
 * 
 * @example Backwards Compatible
 * ```ts
 * import { dataPlatformApi } from ''services/api/data-platform-api'';
 * const tables = await dataPlatformApi.schemaManagement.getTables();
 * ```
 * 
 * @example Recommended - Direct Imports
 * ```ts
 * import { SchemaManagementApiService } from ''services/api/data-platform/schema-management-api'';
 * const service = new SchemaManagementApiService();
 * const tables = await service.getTables();
 * ```
 */

export * from './data-platform/index';
