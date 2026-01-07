// =============================================================================
// API CONFIGURATION
// =============================================================================
// Backend API connection and request settings

import { isBrowser } from "@rendering/utils";

// Lazy getters for Next.js environment
export const getApiBaseUrl = () => {
  // In development, use relative path to leverage Next.js proxy (fixes CORS in Codespaces)
  // Also check for github.dev hostname to ensure we use proxy in Codespaces even if mode is somehow different
  if (
    process.env.NODE_ENV === "development" ||
    (isBrowser() && window.location.hostname.includes("github.dev"))
  ) {
    return "";
  }
  return process.env.NEXT_PUBLIC_API_URL || "";
};
export const getApiPrefix = () => process.env.NEXT_PUBLIC_API_PREFIX || "/api";

// Export constants for backward compatibility
export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api";

// Note: Don't access import.meta.env at module load
export const API_TIMEOUT_MS = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY_MS = 1000;

// =============================================================================
// FEATURE FLAGS & MODE DETECTION
// =============================================================================

/**
 * Check if backend API mode is enabled
 * Always returns true as IndexedDB mode is deprecated/removed
 */
export const isBackendApiEnabled = () => true;

/**
 * Check if IndexedDB fallback mode is enabled
 * Always returns false
 */
export const isIndexedDBMode = () => false;

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
export const isProduction = () => {
  // Support both Vite (import.meta) and Jest (process.env) environments
  // In Vite/browser environment, import.meta exists
  // In Jest/Node environment, use process.env
  if (typeof process !== "undefined" && process.env) {
    return process.env.NODE_ENV === "production";
  }
  // Fallback for Vite environment
  try {
    return (import.meta as any).env.PROD;
  } catch {
    return false;
  }
};

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
