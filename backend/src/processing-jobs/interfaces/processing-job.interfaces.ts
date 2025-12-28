import { JobStatus } from '../dto/job-status.dto';

/**
 * Job queue data structure for Bull jobs
 */
export interface JobQueueData {
  jobId: string;
  documentId: string;
  parameters?: JobParameters;
}

/**
 * Job parameters for various job types
 */
export interface JobParameters {
  languages?: string[];
  [key: string]: unknown;
}

/**
 * Base interface for all processing results
 */
export interface ProcessingResult {
  [key: string]: unknown;
}

/**
 * OCR processing result
 */
export interface OcrProcessingResult extends ProcessingResult {
  text: string;
  confidence: number;
  wordCount: number;
}

/**
 * Metadata extraction result
 */
export interface MetadataExtractionResult extends ProcessingResult {
  message: string;
  metadata?: DocumentMetadata;
}

/**
 * Redaction result
 */
export interface RedactionResult extends ProcessingResult {
  message: string;
  redactedCount?: number;
}

/**
 * Document metadata structure
 */
export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  fileSize?: number;
  pageCount?: number;
  format?: string;
  [key: string]: unknown;
}

/**
 * Job statistics by status
 */
export interface JobStatusStatistic {
  status: JobStatus;
  count: number;
}

/**
 * Complete job statistics
 */
export interface JobStatistics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  byStatus: JobStatusStatistic[];
}
