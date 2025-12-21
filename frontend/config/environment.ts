/**
 * Environment Configuration
 * 
 * Central configuration for data source and environment settings.
 * This replaces the deprecated IndexedDB mode.
 */

export const ENV_CONFIG = {
  /**
   * Data source mode
   * - 'backend': Use PostgreSQL backend API (production/default)
   * - 'mock': Use mock data for development (deprecated)
   */
  dataSource: 'backend' as 'backend' | 'mock',
  
  /**
   * API base URL
   */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  /**
   * Feature flags
   */
  features: {
    useBackendApi: true,
    enableIndexedDB: false, // Deprecated - keeping for legacy compatibility only
    enableMockData: false,
  },
} as const;

/**
 * Check if backend API should be used
 */
export const isBackendMode = () => {
  return ENV_CONFIG.dataSource === 'backend' && ENV_CONFIG.features.useBackendApi;
};

/**
 * Check if mock data should be used (deprecated)
 */
export const isMockMode = () => {
  return ENV_CONFIG.dataSource === 'mock' || ENV_CONFIG.features.enableMockData;
};

/**
 * Get deprecation warning for IndexedDB usage
 */
export const getIndexedDBWarning = () => {
  if (ENV_CONFIG.features.enableIndexedDB) {
    console.warn(
      '[DEPRECATED] IndexedDB mode is deprecated and will be removed. ' +
      'Please use backend API mode. Set localStorage.VITE_USE_INDEXEDDB to false.'
    );
  }
};
