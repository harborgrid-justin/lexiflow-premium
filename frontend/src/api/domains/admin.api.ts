/**
 * Administration & System Domain API Services
 * Documents, processing jobs, OCR, monitoring, health, analytics
 */

import { DocumentsApiService } from '@/api';
import { DocumentVersionsApiService } from '@/api';
import { ProcessingJobsApiService } from '@/api';
import { OCRApiService } from '@/api';
import { MonitoringApiService } from '@/api';
import { HealthApiService } from '@/api';
import { AnalyticsApiService } from '@/api';
import { AuditLogsApiService } from '@/api';
import { VersioningApiService } from '@/api';
import { SyncApiService } from '@/api';
import { BackupsApiService } from '@/api';
import { ServiceJobsApiService } from '@/api';
import { MetricsApiService } from '@/api';

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
