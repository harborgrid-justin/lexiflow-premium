// =============================================================================
// SEARCH CONFIGURATION
// =============================================================================
// Full-text search and filtering settings

export const SEARCH_MIN_QUERY_LENGTH = 2;
export const SEARCH_MAX_RESULTS = 100;
export const SEARCH_PREVIEW_RESULTS = 10; // Per entity type
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_ENABLE_FUZZY = true;
export const SEARCH_FUZZY_THRESHOLD = 0.7;
export const SEARCH_HIGHLIGHT_ENABLED = true;

// Web Worker Search
export const SEARCH_USE_WORKER = true;
export const SEARCH_WORKER_TIMEOUT_MS = 5000;
export const SEARCH_INDEX_BATCH_SIZE = 500;

// Export as object
export const SEARCH_CONFIG = {
  minQueryLength: SEARCH_MIN_QUERY_LENGTH,
  maxResults: SEARCH_MAX_RESULTS,
  previewResults: SEARCH_PREVIEW_RESULTS,
  debounceMs: SEARCH_DEBOUNCE_MS,
  fuzzy: {
    enabled: SEARCH_ENABLE_FUZZY,
    threshold: SEARCH_FUZZY_THRESHOLD,
  },
  highlightEnabled: SEARCH_HIGHLIGHT_ENABLED,
  worker: {
    enabled: SEARCH_USE_WORKER,
    timeoutMs: SEARCH_WORKER_TIMEOUT_MS,
    indexBatchSize: SEARCH_INDEX_BATCH_SIZE,
  },
} as const;
