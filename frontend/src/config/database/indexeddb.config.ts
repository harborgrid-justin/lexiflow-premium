// =============================================================================
// INDEXEDDB CONFIGURATION
// =============================================================================
// Database-specific settings for IndexedDB operations

export const DB_NAME = 'LexiFlowDB';
export const DB_VERSION = 31; // Incremented for MATTERS store (Matter Management)
export const DB_MODE: 'IndexedDB' | 'LocalStorage' = 'IndexedDB';

// Transaction Coalescing
export const DB_MAX_BUFFER_SIZE = 1000; // Maximum pending operations
export const DB_FORCE_FLUSH_THRESHOLD = 500; // Force flush at this size
export const DB_FLUSH_DELAY_MS = 50; // Debounce delay for batch writes

// B-Tree Index Configuration
export const DB_BTREE_ORDER = 5; // B-Tree order for sorted indexes

// Export as object
export const INDEXEDDB_CONFIG = {
  name: DB_NAME,
  version: DB_VERSION,
  mode: DB_MODE,
  transaction: {
    maxBufferSize: DB_MAX_BUFFER_SIZE,
    forceFlushThreshold: DB_FORCE_FLUSH_THRESHOLD,
    flushDelayMs: DB_FLUSH_DELAY_MS,
  },
  btree: {
    order: DB_BTREE_ORDER,
  },
} as const;
