import { registerAs } from "@nestjs/config";
import * as MasterConfig from "./master.config";

/**
 * Resource Limits Configuration
 *
 * Defines limits for memory, connections, and other resources
 * to prevent DoS attacks and resource exhaustion.
 */
export default registerAs("resourceLimits", () => ({
  // Import from master.config.ts for centralized configuration
  websocket: {
    maxConnectionsPerUser: parseInt(
      process.env.WS_MAX_CONNECTIONS_PER_USER ||
        String(MasterConfig.WS_MAX_CONNECTIONS_PER_USER),
      10
    ),
    maxGlobalConnections: parseInt(
      process.env.WS_MAX_GLOBAL_CONNECTIONS ||
        String(MasterConfig.WS_MAX_GLOBAL_CONNECTIONS),
      10
    ),
    maxRoomsPerUser: parseInt(
      process.env.WS_MAX_ROOMS_PER_USER ||
        String(MasterConfig.WS_MAX_ROOMS_PER_USER),
      10
    ),
    rateLimit: {
      maxEventsPerMinute: parseInt(
        process.env.WS_RATE_LIMIT_EVENTS_PER_MINUTE ||
          String(MasterConfig.WS_RATE_LIMIT_EVENTS_PER_MINUTE),
        10
      ),
      windowMs: MasterConfig.WS_RATE_LIMIT_WINDOW_MS,
    },
  },

  fileStorage: {
    maxFileSize: parseInt(
      process.env.MAX_FILE_SIZE || String(MasterConfig.FILE_MAX_SIZE),
      10
    ),
    minDiskSpace: parseInt(
      process.env.MIN_DISK_SPACE || String(MasterConfig.FILE_MIN_DISK_SPACE),
      10
    ),
    allowedMimeTypes:
      process.env.ALLOWED_MIME_TYPES?.split(",") ||
      MasterConfig.FILE_ALLOWED_MIME_TYPES,
  },

  ocr: {
    maxFileSize: parseInt(
      process.env.OCR_MAX_FILE_SIZE || String(MasterConfig.OCR_MAX_FILE_SIZE),
      10
    ),
    timeout: parseInt(
      process.env.OCR_TIMEOUT_MS || String(MasterConfig.OCR_TIMEOUT_MS),
      10
    ),
    chunkSize: parseInt(
      process.env.OCR_CHUNK_SIZE || String(MasterConfig.OCR_CHUNK_SIZE),
      10
    ),
  },

  documentVersions: {
    maxVersionsPerDocument: parseInt(
      process.env.MAX_VERSIONS_PER_DOCUMENT ||
        String(MasterConfig.MAX_VERSIONS_PER_DOCUMENT),
      10
    ),
    autoCleanupEnabled:
      process.env.VERSION_AUTO_CLEANUP_ENABLED === "true" ||
      MasterConfig.VERSION_AUTO_CLEANUP_ENABLED,
    retentionPeriodDays: parseInt(
      process.env.VERSION_RETENTION_DAYS ||
        String(MasterConfig.VERSION_RETENTION_DAYS),
      10
    ),
  },

  queue: {
    defaultTimeout: parseInt(
      process.env.QUEUE_JOB_TIMEOUT_MS ||
        String(MasterConfig.QUEUE_JOB_TIMEOUT_MS),
      10
    ),
    maxAttempts: parseInt(
      process.env.QUEUE_MAX_ATTEMPTS || String(MasterConfig.QUEUE_MAX_ATTEMPTS),
      10
    ),
    backoffDelay: parseInt(
      process.env.QUEUE_BACKOFF_DELAY_MS ||
        String(MasterConfig.QUEUE_BACKOFF_DELAY_MS),
      10
    ),
    removeOnComplete: parseInt(
      process.env.QUEUE_REMOVE_ON_COMPLETE ||
        String(MasterConfig.QUEUE_REMOVE_ON_COMPLETE),
      10
    ),
    removeOnFail: parseInt(
      process.env.QUEUE_REMOVE_ON_FAIL ||
        String(MasterConfig.QUEUE_REMOVE_ON_FAIL),
      10
    ),
  },
}));
