import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * ResourceLimitsConfigService
 *
 * Provides globally injectable access to resource limits configuration.
 * Consolidates WebSocket, file storage, OCR, and queue limits.
 */
@Injectable()
export class ResourceLimitsConfigService {

  // WebSocket Limits
  get wsMaxConnectionsPerUser(): number {
    return MasterConfig.WS_MAX_CONNECTIONS_PER_USER;
  }

  get wsMaxGlobalConnections(): number {
    return MasterConfig.WS_MAX_GLOBAL_CONNECTIONS;
  }

  get wsMaxRoomsPerUser(): number {
    return MasterConfig.WS_MAX_ROOMS_PER_USER;
  }

  get wsRateLimitEventsPerMinute(): number {
    return MasterConfig.WS_RATE_LIMIT_EVENTS_PER_MINUTE;
  }

  get wsMessageMaxSize(): number {
    return MasterConfig.WS_MESSAGE_MAX_SIZE;
  }

  // File Storage Limits
  get fileMaxSize(): number {
    return MasterConfig.FILE_MAX_SIZE;
  }

  get fileMinDiskSpace(): number {
    return MasterConfig.FILE_MIN_DISK_SPACE;
  }

  get maxFileSize(): number {
    return MasterConfig.MAX_FILE_SIZE;
  }

  get fileChunkSize(): number {
    return MasterConfig.FILE_CHUNK_SIZE;
  }

  get fileUploadTimeoutMs(): number {
    return MasterConfig.FILE_UPLOAD_TIMEOUT_MS;
  }

  // OCR Limits
  get ocrMaxFileSize(): number {
    return MasterConfig.OCR_MAX_FILE_SIZE;
  }

  get ocrTimeoutMs(): number {
    return MasterConfig.OCR_TIMEOUT_MS;
  }

  get ocrChunkSize(): number {
    return MasterConfig.OCR_CHUNK_SIZE;
  }

  get ocrMaxConcurrentJobs(): number {
    return MasterConfig.OCR_MAX_CONCURRENT_JOBS;
  }

  // Document Version Limits
  get maxVersionsPerDocument(): number {
    return MasterConfig.MAX_VERSIONS_PER_DOCUMENT;
  }

  get versionRetentionDays(): number {
    return MasterConfig.VERSION_RETENTION_DAYS;
  }

  // Queue Limits
  get queueJobTimeoutMs(): number {
    return MasterConfig.QUEUE_JOB_TIMEOUT_MS;
  }

  get queueMaxAttempts(): number {
    return MasterConfig.QUEUE_MAX_ATTEMPTS;
  }

  // Bulk Operations
  get bulkOperationBatchSize(): number {
    return MasterConfig.BULK_OPERATION_BATCH_SIZE;
  }

  get bulkOperationTimeoutMs(): number {
    return MasterConfig.BULK_OPERATION_TIMEOUT_MS;
  }

  // Search Limits
  get searchMaxResults(): number {
    return MasterConfig.SEARCH_MAX_RESULTS;
  }

  get searchPreviewLimit(): number {
    return MasterConfig.SEARCH_PREVIEW_LIMIT;
  }

  get searchTimeoutMs(): number {
    return MasterConfig.SEARCH_TIMEOUT_MS;
  }

  /**
   * Get WebSocket limits
   */
  getWebSocketLimits(): Record<string, number> {
    return {
      maxConnectionsPerUser: this.wsMaxConnectionsPerUser,
      maxGlobalConnections: this.wsMaxGlobalConnections,
      maxRoomsPerUser: this.wsMaxRoomsPerUser,
      rateLimitEventsPerMinute: this.wsRateLimitEventsPerMinute,
      messageMaxSize: this.wsMessageMaxSize,
    };
  }

  /**
   * Get file storage limits
   */
  getFileStorageLimits(): Record<string, number> {
    return {
      maxSize: this.fileMaxSize,
      minDiskSpace: this.fileMinDiskSpace,
      chunkSize: this.fileChunkSize,
      uploadTimeoutMs: this.fileUploadTimeoutMs,
    };
  }

  /**
   * Get OCR limits
   */
  getOcrLimits(): Record<string, number> {
    return {
      maxFileSize: this.ocrMaxFileSize,
      timeoutMs: this.ocrTimeoutMs,
      chunkSize: this.ocrChunkSize,
      maxConcurrentJobs: this.ocrMaxConcurrentJobs,
    };
  }

  /**
   * Get summary of all resource limits
   */
  getSummary(): Record<string, unknown> {
    return {
      websocket: this.getWebSocketLimits(),
      fileStorage: this.getFileStorageLimits(),
      ocr: this.getOcrLimits(),
      queue: {
        jobTimeoutMs: this.queueJobTimeoutMs,
        maxAttempts: this.queueMaxAttempts,
      },
      bulk: {
        batchSize: this.bulkOperationBatchSize,
        timeoutMs: this.bulkOperationTimeoutMs,
      },
      search: {
        maxResults: this.searchMaxResults,
        timeoutMs: this.searchTimeoutMs,
      },
    };
  }
}
