// =============================================================================
// SERVICES CONFIGURATION
// =============================================================================
// Configuration values for service layer components

// Collaboration Service
export const COLLABORATION_MAX_PENDING_EDITS = 1000;
export const COLLABORATION_IDLE_TIMEOUT_MS = 60000; // 1 minute
export const COLLABORATION_AWAY_TIMEOUT_MS = 300000; // 5 minutes
export const COLLABORATION_LOCK_TIMEOUT_MS = 600000; // 10 minutes

// API Client
export const API_CLIENT_DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
export const API_CLIENT_MAX_RETRIES = 3;
export const API_CLIENT_INITIAL_RETRY_DELAY_MS = 1000;
export const API_CLIENT_MAX_RETRY_DELAY_MS = 30000;
export const API_CLIENT_BACKOFF_MULTIPLIER = 2;
export const API_CLIENT_RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Backend Discovery
export const BACKEND_DISCOVERY_CHECK_INTERVAL_MS = 60000; // 1 minute
export const BACKEND_DISCOVERY_NOTIFY_DEBOUNCE_MS = 1000;

// Blob Manager
export const BLOB_MANAGER_TEMP_TTL_MS = 5000; // 5 seconds

// Repository
export const REPOSITORY_MAX_LISTENERS = 1000;

// Search History
export const SEARCH_MAX_HISTORY_SIZE = 10;
export const SEARCH_MAX_RECENT_SEARCHES = 10;

// Notification Service
export const NOTIFICATION_SERVICE_MAX_DISPLAY = 50;

// Calendar
export const CALENDAR_SLOT_INTERVAL_MINUTES = 30;

// Export as object
export const SERVICES_CONFIG = {
  collaboration: {
    maxPendingEdits: COLLABORATION_MAX_PENDING_EDITS,
    idleTimeoutMs: COLLABORATION_IDLE_TIMEOUT_MS,
    awayTimeoutMs: COLLABORATION_AWAY_TIMEOUT_MS,
    lockTimeoutMs: COLLABORATION_LOCK_TIMEOUT_MS,
  },
  apiClient: {
    defaultTimeoutMs: API_CLIENT_DEFAULT_TIMEOUT_MS,
    maxRetries: API_CLIENT_MAX_RETRIES,
    initialRetryDelayMs: API_CLIENT_INITIAL_RETRY_DELAY_MS,
    maxRetryDelayMs: API_CLIENT_MAX_RETRY_DELAY_MS,
    backoffMultiplier: API_CLIENT_BACKOFF_MULTIPLIER,
    retryableStatusCodes: API_CLIENT_RETRYABLE_STATUS_CODES,
  },
  backendDiscovery: {
    checkIntervalMs: BACKEND_DISCOVERY_CHECK_INTERVAL_MS,
    notifyDebounceMs: BACKEND_DISCOVERY_NOTIFY_DEBOUNCE_MS,
  },
  blobManager: {
    tempTtlMs: BLOB_MANAGER_TEMP_TTL_MS,
  },
  repository: {
    maxListeners: REPOSITORY_MAX_LISTENERS,
  },
  search: {
    maxHistorySize: SEARCH_MAX_HISTORY_SIZE,
    maxRecentSearches: SEARCH_MAX_RECENT_SEARCHES,
  },
  notification: {
    maxDisplay: NOTIFICATION_SERVICE_MAX_DISPLAY,
  },
  calendar: {
    slotIntervalMinutes: CALENDAR_SLOT_INTERVAL_MINUTES,
  },
} as const;
