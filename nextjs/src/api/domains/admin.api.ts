/**
 * Administration & System Domain API Services
 * Documents, processing jobs, OCR, monitoring, health, analytics
 */

import { AuditLogsApiService } from "../admin/audit-logs-api";
import { BackupsApiService } from "../admin/backups-api";
import { DocumentVersionsApiService } from "../admin/document-versions-api";
import { DocumentsApiService } from "../admin/documents-api";
import { HealthApiService } from "../admin/health-api";
import { MetricsApiService } from "../admin/metrics-api";
import { MonitoringApiService } from "../admin/monitoring-api";
import { OCRApiService } from "../admin/ocr-api";
import { ProcessingJobsApiService } from "../admin/processing-jobs-api";
import { ServiceJobsApiService } from "../admin/service-jobs-api";
import { SyncApiService } from "../admin/sync-api";
import { SystemSettingsApiService } from "../admin/system-settings-api";
import { VersioningApiService } from "../admin/versioning-api";
import { AnalyticsApiService } from "../intelligence/analytics-api";

// Export singleton instances
export const adminApi = {
  documents: new DocumentsApiService(),
  documentVersions: new DocumentVersionsApiService(),
  processingJobs: new ProcessingJobsApiService(),
  ocr: new OCRApiService(),
  monitoring: new MonitoringApiService(),
  health: new HealthApiService(),
  analytics: new AnalyticsApiService(),
  auditLogs: new AuditLogsApiService(),
  versioning: new VersioningApiService(),
  sync: new SyncApiService(),
  backups: new BackupsApiService(),
  serviceJobs: new ServiceJobsApiService(),
  metrics: new MetricsApiService(),
  settings: new SystemSettingsApiService(),
} as const;
