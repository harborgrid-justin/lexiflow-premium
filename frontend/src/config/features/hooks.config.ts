// =============================================================================
// HOOKS CONFIGURATION
// =============================================================================
// Configuration values for custom React hooks

// Time Tracker Hook
export const TIME_TRACKER_MIN_BILLABLE_SECONDS = 60; // 1 minute
export const TIME_TRACKER_DEFAULT_RATE = 450; // Default hourly rate in USD
export const TIME_TRACKER_INTERVAL_MS = 1000; // 1 second

// Code Splitting Hook
export const CODE_SPLIT_TIMEOUT_MS = 10000; // 10 seconds
export const CODE_SPLIT_MAX_RETRIES = 3;
export const CODE_SPLIT_BASE_DELAY_MS = 1000;
export const CODE_SPLIT_RETRY_DELAY_MS = 1000;

// Nexus Graph Physics Hook
export const NEXUS_GRAPH_REPULSION = 1000;
export const NEXUS_GRAPH_SPRING_LENGTH = 180;
export const NEXUS_GRAPH_SPRING_STRENGTH = 0.05;
export const NEXUS_GRAPH_DAMPING = 0.85;
export const NEXUS_GRAPH_CENTER_PULL = 0.02;
export const NEXUS_GRAPH_ALPHA_DECAY = 0.01;

// Memoization Hook
export const MEMOIZATION_MAX_CACHE_SIZE = 100;
export const MEMOIZATION_WARN_THRESHOLD_MS = 10; // Warn if computation takes > 10ms

// Image Optimization Hook
export const IMAGE_OPTIMIZATION_DEFAULT_WIDTH = 32;
export const IMAGE_OPTIMIZATION_DEFAULT_HEIGHT = 32;

// Data Service Cleanup Hook
export const DATA_SERVICE_MEMORY_REFRESH_INTERVAL_MS = 5000; // 5 seconds

// Wizard Hook
export const WIZARD_DEFAULT_INITIAL_STEP = 1;

// Export as object
export const HOOKS_CONFIG = {
  timeTracker: {
    minBillableSeconds: TIME_TRACKER_MIN_BILLABLE_SECONDS,
    defaultRate: TIME_TRACKER_DEFAULT_RATE,
    intervalMs: TIME_TRACKER_INTERVAL_MS,
  },
  codeSplitting: {
    timeoutMs: CODE_SPLIT_TIMEOUT_MS,
    maxRetries: CODE_SPLIT_MAX_RETRIES,
    baseDelayMs: CODE_SPLIT_BASE_DELAY_MS,
    retryDelayMs: CODE_SPLIT_RETRY_DELAY_MS,
  },
  nexusGraph: {
    repulsion: NEXUS_GRAPH_REPULSION,
    springLength: NEXUS_GRAPH_SPRING_LENGTH,
    springStrength: NEXUS_GRAPH_SPRING_STRENGTH,
    damping: NEXUS_GRAPH_DAMPING,
    centerPull: NEXUS_GRAPH_CENTER_PULL,
    alphaDecay: NEXUS_GRAPH_ALPHA_DECAY,
  },
  memoization: {
    maxCacheSize: MEMOIZATION_MAX_CACHE_SIZE,
    warnThresholdMs: MEMOIZATION_WARN_THRESHOLD_MS,
  },
  imageOptimization: {
    defaultWidth: IMAGE_OPTIMIZATION_DEFAULT_WIDTH,
    defaultHeight: IMAGE_OPTIMIZATION_DEFAULT_HEIGHT,
  },
  dataService: {
    memoryRefreshIntervalMs: DATA_SERVICE_MEMORY_REFRESH_INTERVAL_MS,
  },
  wizard: {
    defaultInitialStep: WIZARD_DEFAULT_INITIAL_STEP,
  },
} as const;
