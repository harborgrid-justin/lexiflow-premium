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
    maxConnectionsPerUser: parseInt(process.env.WS_MAX_CONNECTIONS_PER_USER || String(require('./master.config').WS_MAX_CONNECTIONS_PER_USER), 10),
    maxGlobalConnections: parseInt(process.env.WS_MAX_GLOBAL_CONNECTIONS || String(require('./master.config').WS_MAX_GLOBAL_CONNECTIONS), 10),
    maxRoomsPerUser: parseInt(process.env.WS_MAX_ROOMS_PER_USER || String(require('./master.config').WS_MAX_ROOMS_PER_USER), 10),
    rateLimit: {
      maxEventsPerMinute: parseInt(process.env.WS_RATE_LIMIT_EVENTS_PER_MINUTE || String(require('./master.config').WS_RATE_LIMIT_EVENTS_PER_MINUTE), 10),
      windowMs: require('./master.config').WS_RATE_LIMIT_WINDOW_MS,
    },
  },

  fileStorage: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || String(require('./master.config').FILE_MAX_SIZE), 10),
    minDiskSpace: parseInt(process.env.MIN_DISK_SPACE || String(require('./master.config').FILE_MIN_DISK_SPACE), 10),
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || require('./master.config').FILE_ALLOWED_MIME_TYPES,
  },

  ocr: {
    maxFileSize: parseInt(process.env.OCR_MAX_FILE_SIZE || String(require('./master.config').OCR_MAX_FILE_SIZE), 10),
    timeout: parseInt(process.env.OCR_TIMEOUT_MS || String(require('./master.config').OCR_TIMEOUT_MS), 10),
    chunkSize: parseInt(process.env.OCR_CHUNK_SIZE || String(require('./master.config').OCR_CHUNK_SIZE), 10),
  },

  documentVersions: {
    maxVersionsPerDocument: parseInt(process.env.MAX_VERSIONS_PER_DOCUMENT || String(require('./master.config').MAX_VERSIONS_PER_DOCUMENT), 10),
    autoCleanupEnabled: process.env.VERSION_AUTO_CLEANUP_ENABLED === 'true' || require('./master.config').VERSION_AUTO_CLEANUP_ENABLED,
    retentionPeriodDays: parseInt(process.env.VERSION_RETENTION_DAYS || String(require('./master.config').VERSION_RETENTION_DAYS), 10),
  },

  queue: {
    defaultTimeout: parseInt(process.env.QUEUE_JOB_TIMEOUT_MS || String(require('./master.config').QUEUE_JOB_TIMEOUT_MS), 10),
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || String(require('./master.config').QUEUE_MAX_ATTEMPTS), 10),
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY_MS || String(require('./master.config').QUEUE_BACKOFF_DELAY_MS), 10),
    removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || String(require('./master.config').QUEUE_REMOVE_ON_COMPLETE), 10),
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || String(require('./master.config').QUEUE_REMOVE_ON_FAIL), 10),
  },
}));
