/**
 * Administration & System Domain API Services
 * Documents, processing jobs, OCR, monitoring, health, analytics
 */

import { DocumentsApiService } from '../documents-api';
import { DocumentVersionsApiService } from '../document-versions-api';
import { ProcessingJobsApiService } from '../admin/processing-jobs-api';
import { OCRApiService } from '../ocr-api';
import { MonitoringApiService } from '../monitoring-api';
import { HealthApiService } from '../health-api';
import { AnalyticsApiService } from '../analytics-api';
import { AuditLogsApiService } from '../audit-logs-api';
import { VersioningApiService } from '../versioning-api';
import { SyncApiService } from '../sync-api';
import { BackupsApiService } from '../backups-api';
import { ServiceJobsApiService } from '../service-jobs-api';
import { MetricsApiService } from '../metrics-api';

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
} as const;
