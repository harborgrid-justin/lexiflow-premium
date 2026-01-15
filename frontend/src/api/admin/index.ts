/**
 * System Administration API Services
 * Documents, processing jobs, OCR, monitoring, health, and system operations
 */

export {
  AuditLogsApiService,
  type AuditLog,
  type AuditLogFilters,
} from "./audit-logs-api";
export { BackupsApiService, type Backup } from "./backups-api";
export {
  DocumentVersionsApiService,
  type DocumentVersion,
} from "./document-versions-api";
export { DOCUMENTS_QUERY_KEYS, DocumentsApiService } from "./documents-api";
export { HealthApiService, type HealthCheck } from "./health-api";
export * from "./metrics-api";
export { MetricsApiService, type SystemMetrics } from "./metrics-api";
export {
  MonitoringApiService,
  type AdminPerformanceMetric,
  type AdminSystemHealth,
} from "./monitoring-api";
export { OCRApiService, type OCRJob, type OCRRequest } from "./ocr-api";
export {
  ProcessingJobsApiService,
  type JobFilters,
  type ProcessingJob,
} from "./processing-jobs-api";
export * from "./service-jobs-api";
export {
  ServiceJobsApiService,
  type ServiceJob,
  type ServiceJobFilters,
} from "./service-jobs-api";
export {
  SyncApiService,
  type AdminSyncConflict,
  type AdminSyncStatus,
  type SyncQueueItem,
  type SyncResult,
} from "./sync-api";
export {
  VersioningApiService,
  type Version,
  type VersionFilters,
} from "./versioning-api";
