import { registerAs } from '@nestjs/config';

/**
 * Resource Limits Configuration
 *
 * Defines limits for memory, connections, and other resources
 * to prevent DoS attacks and resource exhaustion.
 */
export default registerAs('resourceLimits', () => ({
  // Import from master.config.ts for centralized configuration
  websocket: {
    maxConnectionsPerUser: parseInt(process.env.WS_MAX_CONNECTIONS_PER_USER, 10) || require('./master.config').WS_MAX_CONNECTIONS_PER_USER,
    maxGlobalConnections: parseInt(process.env.WS_MAX_GLOBAL_CONNECTIONS, 10) || require('./master.config').WS_MAX_GLOBAL_CONNECTIONS,
    maxRoomsPerUser: parseInt(process.env.WS_MAX_ROOMS_PER_USER, 10) || require('./master.config').WS_MAX_ROOMS_PER_USER,
    rateLimit: {
      maxEventsPerMinute: parseInt(process.env.WS_RATE_LIMIT_EVENTS_PER_MINUTE, 10) || require('./master.config').WS_RATE_LIMIT_EVENTS_PER_MINUTE,
      windowMs: require('./master.config').WS_RATE_LIMIT_WINDOW_MS,
    },
  },

  fileStorage: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || require('./master.config').FILE_MAX_SIZE,
    minDiskSpace: parseInt(process.env.MIN_DISK_SPACE, 10) || require('./master.config').FILE_MIN_DISK_SPACE,
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || require('./master.config').FILE_ALLOWED_MIME_TYPES,
  },

  ocr: {
    maxFileSize: parseInt(process.env.OCR_MAX_FILE_SIZE, 10) || require('./master.config').OCR_MAX_FILE_SIZE,
    timeout: parseInt(process.env.OCR_TIMEOUT_MS, 10) || require('./master.config').OCR_TIMEOUT_MS,
    chunkSize: parseInt(process.env.OCR_CHUNK_SIZE, 10) || require('./master.config').OCR_CHUNK_SIZE,
  },

  documentVersions: {
    maxVersionsPerDocument: parseInt(process.env.MAX_VERSIONS_PER_DOCUMENT, 10) || require('./master.config').MAX_VERSIONS_PER_DOCUMENT,
    autoCleanupEnabled: process.env.VERSION_AUTO_CLEANUP_ENABLED === 'true' || require('./master.config').VERSION_AUTO_CLEANUP_ENABLED,
    retentionPeriodDays: parseInt(process.env.VERSION_RETENTION_DAYS, 10) || require('./master.config').VERSION_RETENTION_DAYS,
  },

  queue: {
    defaultTimeout: parseInt(process.env.QUEUE_JOB_TIMEOUT_MS, 10) || require('./master.config').QUEUE_JOB_TIMEOUT_MS,
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS, 10) || require('./master.config').QUEUE_MAX_ATTEMPTS,
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY_MS, 10) || require('./master.config').QUEUE_BACKOFF_DELAY_MS,
    removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE, 10) || require('./master.config').QUEUE_REMOVE_ON_COMPLETE,
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL, 10) || require('./master.config').QUEUE_REMOVE_ON_FAIL,
  },
}));
