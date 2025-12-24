// =============================================================================
// CACHE CONFIGURATION
// =============================================================================
// Caching strategies for query, sync, and repository layers

// Query Cache Settings
export const QUERY_CACHE_MAX_SIZE = 100; // Maximum number of cached queries
export const QUERY_CACHE_STALE_TIME_MS = 60000; // 1 minute
export const QUERY_CACHE_GC_TIME_MS = 300000; // 5 minutes

// Sync Engine Cache
export const SYNC_CACHE_MAX_SIZE = 10000; // Maximum cached sync operations
export const SYNC_CACHE_FLUSH_INTERVAL_MS = 5000; // 5 seconds

// Repository Cache (LRU)
export const REPOSITORY_CACHE_MAX_SIZE = 1000; // LRU cache size per repository
export const REPOSITORY_CACHE_TTL_MS = 300000; // 5 minutes

// Export as object
export const CACHE_CONFIG = {
  query: {
    maxSize: QUERY_CACHE_MAX_SIZE,
    staleTimeMs: QUERY_CACHE_STALE_TIME_MS,
    gcTimeMs: QUERY_CACHE_GC_TIME_MS,
  },
  sync: {
    maxSize: SYNC_CACHE_MAX_SIZE,
    flushIntervalMs: SYNC_CACHE_FLUSH_INTERVAL_MS,
  },
  repository: {
    maxSize: REPOSITORY_CACHE_MAX_SIZE,
    ttlMs: REPOSITORY_CACHE_TTL_MS,
  },
} as const;
