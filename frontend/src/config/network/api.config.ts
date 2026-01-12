// =============================================================================
// API CONFIGURATION
// =============================================================================
// Backend API connection and request settings

import { isBrowser } from "@rendering/utils";
import { URLS, HOSTS, PORTS } from "../ports.config";

// Lazy getters to avoid accessing import.meta.env before Vite initialization
export const getApiBaseUrl = () => {
  // SSR Support: Node.js fetch requires absolute URL
  if (!isBrowser()) {
    return (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      URLS.backend(HOSTS.LOCAL_IPV4).replace(`:${PORTS.BACKEND}`, `:${PORTS.BACKEND_ALT}`) // Alt port for SSR
    );
  }

  // In development, use relative path to leverage Vite proxy (fixes CORS in Codespaces)
  // Also check for github.dev hostname to ensure we use proxy in Codespaces even if mode is somehow different
  if (
    import.meta.env.DEV ||
    (isBrowser() && window.location.hostname.includes("github.dev"))
  ) {
    return "";
  }
  return import.meta.env.VITE_API_URL || "";
};
export const getApiPrefix = () => import.meta.env.VITE_API_PREFIX || "/api";

// Export constants for backward compatibility
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";

// Note: Don't access import.meta.env at module load
// Import centralized timeout configuration
import { TIMEOUTS } from '../ports.config';
export const API_TIMEOUT_MS = TIMEOUTS.API_REQUEST;
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY_MS = 1000;

// =============================================================================
// FEATURE FLAGS & MODE DETECTION
// =============================================================================

/**
 * Check if backend API mode is enabled
 * Respects localStorage VITE_USE_INDEXEDDB override for legacy mode
 */
export const isBackendApiEnabled = () => {
  return true;
};

/**
 * Check if IndexedDB fallback mode is enabled
 * Returns true if VITE_USE_INDEXEDDB is set
 */
export const isIndexedDBMode = () => !isBackendApiEnabled();

/**
 * Get current data persistence mode
 */
export const getDataMode = () => "backend";

/**
 * No-op: Backend mode is always enabled
 */
export const forceBackendMode = () => {};

/**
 * No-op: Legacy mode is removed
 */
export const enableLegacyIndexedDB = () => {};

/**
 * Check if running in production mode
 */
export const isProduction = () => import.meta.env.PROD;

/**
 * Get the backend URL (alias for getApiBaseUrl)
 */
export const getBackendUrl = getApiBaseUrl;

/**
 * Log API configuration (no-op)
 */
export const logApiConfig = () => {};

// API Request Settings
export const API_MAX_CONCURRENT_REQUESTS = 6;
export const API_REQUEST_QUEUE_ENABLED = true;
export const API_ENABLE_REQUEST_CANCELLATION = true;

// Export as object with lazy evaluation
export const API_CONFIG = {
  get baseUrl() {
    return getApiBaseUrl();
  },
  get prefix() {
    return getApiPrefix();
  },
  timeoutMs: API_TIMEOUT_MS,
  retryAttempts: API_RETRY_ATTEMPTS,
  retryDelayMs: API_RETRY_DELAY_MS,
  maxConcurrentRequests: API_MAX_CONCURRENT_REQUESTS,
  requestQueueEnabled: API_REQUEST_QUEUE_ENABLED,
  enableRequestCancellation: API_ENABLE_REQUEST_CANCELLATION,
} as const;
