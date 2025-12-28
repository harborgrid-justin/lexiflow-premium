import { ReportType, ReportFormat, ReportStatus } from '../dto/reports.dto';

/**
 * Stored Report Record Interface
 * Represents a report stored in memory or database
 */
export interface ReportRecord {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  status: string;
  format: ReportFormat;
  generatedBy: string;
  generatedByName?: string;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  startDate?: Date;
  endDate?: Date;
  filters?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  fileSize?: number;
  fileUrl?: string;
  filePath?: string;
  name?: string;
  userId?: string;
  scheduledAt?: Date;
  errorMessage?: string;
}

/**
 * Report Template Interface
 * Represents a report template configuration
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType | string;
  category?: string;
  defaultFormat?: ReportFormat;
  sections?: TemplateSection[];
  parameters?: TemplateParameters;
  scheduling?: TemplateScheduling;
  isSystem?: boolean;
  createdBy?: string;
  createdAt?: Date;
}

/**
 * Template Section Interface
 */
export interface TemplateSection {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

/**
 * Template Parameters Interface
 */
export interface TemplateParameters {
  startDate?: ParameterConfig;
  endDate?: ParameterConfig;
  caseType?: ParameterConfig;
  status?: ParameterConfig;
  [key: string]: ParameterConfig | undefined;
}

/**
 * Parameter Configuration Interface
 */
export interface ParameterConfig {
  type: string;
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{ value: string; label: string }>;
  label?: string;
  description?: string;
}

/**
 * Template Scheduling Interface
 */
export interface TemplateScheduling {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  nextRun?: Date;
}

/**
 * Report Generation Options Interface
 */
export interface ReportGenerationOptions {
  templateId: string;
  parameters: Record<string, unknown>;
  format?: 'PDF' | 'Excel' | 'CSV';
  userId?: string;
  emailRecipients?: string[];
}

/**
 * Report Generation Request Interface
 */
export interface ReportGenerationRequest {
  type: ReportType;
  title: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  format?: ReportFormat;
  filters?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  emailRecipients?: string[];
}

/**
 * Scheduled Report Interface
 */
export interface ScheduledReport {
  scheduleId: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  parameters: Record<string, unknown>;
  recipients: string[];
  enabled: boolean;
  lastRun: Date | null;
  nextRun: Date;
  createdAt: Date;
  createdBy?: string;
  userId?: string;
}

/**
 * Report Status Response Interface
 */
export interface ReportStatusResponse {
  id: string;
  status: ReportStatus | string;
  progress: number;
  message?: string;
  completedAt?: Date;
  errorMessage?: string;
}

/**
 * Export Report Result Interface
 */
export interface ExportReportResult {
  id: string;
  format: string;
  filePath: string;
  url: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * Download Report Result Interface
 */
export interface DownloadReportResult {
  id: string;
  filePath: string;
  fileName: string;
  fileSize?: number;
  contentType?: string;
}

/**
 * Report Cancellation Result Interface
 */
export interface ReportCancellationResult {
  id: string;
  status: string;
  success: boolean;
  message?: string;
}

/**
 * Cache Entry Interface
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Stream Report Chunk Interface
 */
export interface StreamReportChunk {
  type: 'header' | 'data' | 'summary';
  offset?: number;
  count?: number;
  data?: unknown[];
  progress?: string;
  template?: string;
  parameters?: Record<string, unknown>;
  totalRecords?: number;
  estimatedSize?: string;
  processingTime?: number;
  format?: string;
}

/**
 * Report Data Record Interface
 * Generic structure for report data records
 */
export interface ReportDataRecord {
  id: string;
  case: string;
  status: string;
  amount: number;
  date: Date;
  [key: string]: unknown;
}

/**
 * Generated Report Summary Interface
 */
export interface GeneratedReportSummary {
  totalRecords: number;
  totalAmount?: number;
  byStatus?: Record<string, number>;
  [key: string]: unknown;
}

/**
 * Generated Report Interface
 */
export interface GeneratedReport {
  reportId: string;
  template: string;
  parameters: Record<string, unknown>;
  generatedAt: Date;
  format: string;
  data: ReportDataRecord[];
  summary: GeneratedReportSummary;
}

/**
 * Export Options Interface
 */
export interface ExportOptions {
  format: 'PDF' | 'Excel' | 'CSV';
  reportId: string;
  fileName?: string;
}

/**
 * Memory Statistics Interface
 */
export interface MemoryStatistics {
  templatesCached: number;
  generatedCached: number;
  schedulesCached: number;
  activeStreams: number;
  memoryUsage: {
    heapUsedMB: string;
    heapTotalMB: string;
  };
}

/**
 * Schedule Report Options Interface
 */
export interface ScheduleReportOptions {
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  parameters: Record<string, unknown>;
  recipients: string[];
  userId?: string;
}

/**
 * Batch Report Request Interface
 */
export interface BatchReportRequest {
  templateId: string;
  parameters: Record<string, unknown>;
}
