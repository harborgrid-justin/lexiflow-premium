// =============================================================================
// API CONFIGURATION
// =============================================================================
// Backend API connection and request settings

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';
export const API_TIMEOUT_MS = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY_MS = 1000;

// API Request Settings
export const API_MAX_CONCURRENT_REQUESTS = 6;
export const API_REQUEST_QUEUE_ENABLED = true;
export const API_ENABLE_REQUEST_CANCELLATION = true;

// Export as object
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  prefix: API_PREFIX,
  timeoutMs: API_TIMEOUT_MS,
  retryAttempts: API_RETRY_ATTEMPTS,
  retryDelayMs: API_RETRY_DELAY_MS,
  maxConcurrentRequests: API_MAX_CONCURRENT_REQUESTS,
  requestQueueEnabled: API_REQUEST_QUEUE_ENABLED,
  enableRequestCancellation: API_ENABLE_REQUEST_CANCELLATION,
} as const;
