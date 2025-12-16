import { registerAs } from '@nestjs/config';

/**
 * Resource Limits Configuration
 *
 * Defines limits for memory, connections, and other resources
 * to prevent DoS attacks and resource exhaustion.
 */
export default registerAs('resourceLimits', () => ({
  // WebSocket Connection Limits
  websocket: {
    maxConnectionsPerUser: parseInt(process.env.WS_MAX_CONNECTIONS_PER_USER, 10) || 5,
    maxGlobalConnections: parseInt(process.env.WS_MAX_GLOBAL_CONNECTIONS, 10) || 10000,
    maxRoomsPerUser: parseInt(process.env.WS_MAX_ROOMS_PER_USER, 10) || 50,
    rateLimit: {
      maxEventsPerMinute: parseInt(process.env.WS_RATE_LIMIT_EVENTS_PER_MINUTE, 10) || 100,
      windowMs: 60000, // 1 minute
    },
  },

  // File Storage Limits
  fileStorage: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 524288000, // 500MB default
    minDiskSpace: parseInt(process.env.MIN_DISK_SPACE, 10) || 1073741824, // 1GB default
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'text/plain',
    ],
  },

  // OCR Processing Limits
  ocr: {
    maxFileSize: parseInt(process.env.OCR_MAX_FILE_SIZE, 10) || 104857600, // 100MB default
    timeout: parseInt(process.env.OCR_TIMEOUT_MS, 10) || 300000, // 5 minutes default
    chunkSize: parseInt(process.env.OCR_CHUNK_SIZE, 10) || 10485760, // 10MB chunks default
  },

  // Document Version Limits
  documentVersions: {
    maxVersionsPerDocument: parseInt(process.env.MAX_VERSIONS_PER_DOCUMENT, 10) || 100,
    autoCleanupEnabled: process.env.VERSION_AUTO_CLEANUP_ENABLED === 'true',
    retentionPeriodDays: parseInt(process.env.VERSION_RETENTION_DAYS, 10) || 365,
  },

  // Queue Limits
  queue: {
    defaultTimeout: parseInt(process.env.QUEUE_JOB_TIMEOUT_MS, 10) || 600000, // 10 minutes
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS, 10) || 3,
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY_MS, 10) || 2000,
    removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE, 10) || 100,
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL, 10) || 50,
  },
}));
