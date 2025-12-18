// =============================================================================
// SYNC ENGINE CONFIGURATION
// =============================================================================
// Data synchronization settings for offline-first functionality

export const SYNC_ENABLED = true;
export const SYNC_BATCH_SIZE = 50; // Operations per batch
export const SYNC_RETRY_ATTEMPTS = 3;
export const SYNC_RETRY_DELAY_MS = 1000; // Initial delay
export const SYNC_RETRY_BACKOFF_MULTIPLIER = 2; // Exponential backoff
export const SYNC_MAX_RETRY_DELAY_MS = 30000; // Max 30 seconds
export const SYNC_CONFLICT_RESOLUTION: 'client-wins' | 'server-wins' | 'manual' = 'server-wins';
export const SYNC_ENABLE_COMPRESSION = true;
export const SYNC_COMPRESSION_THRESHOLD_BYTES = 1024; // Compress if > 1KB

// JSON Patch Optimization
export const SYNC_USE_JSON_PATCH = true;
export const SYNC_PATCH_MAX_DEPTH = 10;

// Export as object
export const SYNC_CONFIG = {
  enabled: SYNC_ENABLED,
  batchSize: SYNC_BATCH_SIZE,
  retryAttempts: SYNC_RETRY_ATTEMPTS,
  retryDelayMs: SYNC_RETRY_DELAY_MS,
  retryBackoffMultiplier: SYNC_RETRY_BACKOFF_MULTIPLIER,
  maxRetryDelayMs: SYNC_MAX_RETRY_DELAY_MS,
  conflictResolution: SYNC_CONFLICT_RESOLUTION,
  enableCompression: SYNC_ENABLE_COMPRESSION,
  compressionThresholdBytes: SYNC_COMPRESSION_THRESHOLD_BYTES,
  jsonPatch: {
    enabled: SYNC_USE_JSON_PATCH,
    maxDepth: SYNC_PATCH_MAX_DEPTH,
  },
} as const;
