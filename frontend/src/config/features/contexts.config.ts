// =============================================================================
// CONTEXTS CONFIGURATION
// =============================================================================
// Configuration values for React Context providers

// Window Context
export const WINDOW_MAX_INSTANCES = 20;
export const WINDOW_BASE_Z_INDEX = 1000;
export const WINDOW_DEFAULT_WIDTH = 900;
export const WINDOW_DEFAULT_HEIGHT = 600;

// Sync Context
export const SYNC_MAX_RETRIES = 3;
export const SYNC_BASE_DELAY_MS = 1000;
export const SYNC_RETRY_MULTIPLIER = 2; // For exponential backoff

// Toast Context
export const TOAST_MAX_VISIBLE = 3;
export const TOAST_MAX_QUEUE = 50;

// Export as object
export const CONTEXTS_CONFIG = {
  window: {
    maxInstances: WINDOW_MAX_INSTANCES,
    baseZIndex: WINDOW_BASE_Z_INDEX,
    defaultWidth: WINDOW_DEFAULT_WIDTH,
    defaultHeight: WINDOW_DEFAULT_HEIGHT,
  },
  sync: {
    maxRetries: SYNC_MAX_RETRIES,
    baseDelayMs: SYNC_BASE_DELAY_MS,
    retryMultiplier: SYNC_RETRY_MULTIPLIER,
  },
  toast: {
    maxVisible: TOAST_MAX_VISIBLE,
    maxQueue: TOAST_MAX_QUEUE,
  },
} as const;
