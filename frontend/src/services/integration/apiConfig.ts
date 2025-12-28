/**
 * Backend API Configuration & Feature Flags
 * 
 * DEPRECATION NOTICE (2025-12-18):
 * IndexedDB mode is deprecated for production use. The application now defaults
 * to backend API mode in all environments. Local storage fallback is only available
 * for development debugging purposes.
 * 
 * To enable legacy IndexedDB mode (not recommended):
 * - Set VITE_USE_INDEXEDDB=true in .env
 * - Or localStorage.setItem('VITE_USE_INDEXEDDB', 'true')
 * 
 * ARCHITECTURAL COMPLIANCE (2025-12-28):
 * - Uses StorageAdapter interface for framework-agnostic storage access
 * - No direct localStorage references (injected via defaultStorage)
 * - Portable across SSR, workers, and test environments
 */

import { API_BASE_URL, API_PREFIX } from '@/config/network/api.config';
import { type IStorageAdapter, defaultStorage } from '@/services/infrastructure/adapters/StorageAdapter';

const DEPRECATION_WARNING = `
ЩЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЛ
К                    ??  DEPRECATION NOTICE                         К
К                                                                   К
К  IndexedDB mode is deprecated and will be removed in v2.0.0     К
К  Please migrate to backend API mode for production use.          К
К                                                                   К
К  Backend API provides:                                           К
К   PostgreSQL data persistence                                   К
К   Multi-user synchronization                                    К
К   Enterprise-grade security                                     К
К   Automatic backups & audit trails                              К
К                                                                   К
К  To disable this warning, remove VITE_USE_INDEXEDDB flag         К
ШЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭЭM
`;

/**
 * Check if backend API mode is enabled (default: TRUE for production)
 * 
 * Precedence order:
 * 1. Environment variable: VITE_USE_BACKEND_API (if explicitly set to false)
 * 2. Development override: storage.VITE_USE_INDEXEDDB (dev only)
 * 3. Default: TRUE (backend mode)
 * 
 * @param storage - Storage adapter interface (injected for testing)
 * @returns true if backend API should be used (DEFAULT)
 */
export function isBackendApiEnabled(storage: IStorageAdapter = defaultStorage): boolean {
  // Check if explicitly disabled via environment variable
  const envDisabled = import.meta.env.VITE_USE_BACKEND_API === 'false' || 
                      import.meta.env.VITE_USE_BACKEND_API === false;

  // Check for storage override
  const localDisabled = storage.getItem('VITE_USE_BACKEND_API') === 'false';

  if (envDisabled || localDisabled) {
    console.warn('[API Config] Backend API explicitly disabled via VITE_USE_BACKEND_API=false');
  }
  
  // Check for development override (IndexedDB mode)
  const useIndexedDB = storage.getItem('VITE_USE_INDEXEDDB') === 'true';
  if (useIndexedDB) {
    console.warn(DEPRECATION_WARNING);
    console.warn('[API Config] Using deprecated IndexedDB mode. This will be removed in v2.0.0');
    return false;
  }
  
  // Force enable backend if not explicitly disabled
  // Clear any legacy disabled flags if we want to force enable
  if (storage.getItem('VITE_USE_BACKEND_API') === 'false') {
    console.log('[API Config] Clearing legacy VITE_USE_BACKEND_API=false flag');
    storage.removeItem('VITE_USE_BACKEND_API');
    return true;
  }

  // Default to backend API (production mode)
  return !(envDisabled || localDisabled);
}

/**
 * Check if IndexedDB fallback mode is enabled (DEPRECATED)
 * @deprecated Use isBackendApiEnabled() instead. Will be removed in v2.0.0
 */
export function isIndexedDBMode(): boolean {
  const enabled = !isBackendApiEnabled();
  if (enabled) {
    console.warn('[API Config] isIndexedDBMode() is deprecated. Use isBackendApiEnabled() instead.');
  }
  return enabled;
}

/**
 * Get current data persistence mode
 */
export function getDataMode(): 'backend' | 'indexeddb-deprecated' {
  return isBackendApiEnabled() ? 'backend' : 'indexeddb-deprecated';
}

/**
 * Force backend API mode (disable IndexedDB fallback)
 * Useful for testing or forcing production behavior
 * 
 * @param storage - Storage adapter interface (injected for testing)
 */
export function forceBackendMode(storage: IStorageAdapter = defaultStorage): void {
  storage.removeItem('VITE_USE_INDEXEDDB');
  storage.setItem('VITE_FORCE_BACKEND', 'true');
  console.log('[API Config] Forced backend API mode. Reload page to apply changes.');
}

/**
 * Enable legacy IndexedDB mode for development only
 * Shows deprecation warning
 * 
 * @param storage - Storage adapter interface (injected for testing)
 */
export function enableLegacyIndexedDB(storage: IStorageAdapter = defaultStorage): void {
  if (import.meta.env.PROD) {
    console.error('[API Config] Cannot enable IndexedDB mode in production build');
    return;
  }
  
  storage.setItem('VITE_USE_INDEXEDDB', 'true');
  storage.removeItem('VITE_FORCE_BACKEND');
  
  console.warn(DEPRECATION_WARNING);
  console.log('[API Config] Enabled legacy IndexedDB mode. Reload page to apply changes.');
}

/**
 * Check if running in production build
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Get backend API base URL
 */
export function getBackendUrl(): string {
  return `${API_BASE_URL}${API_PREFIX}`;
}

/**
 * Display current configuration in console
 */
export function logApiConfig(): void {
  console.group('[LexiFlow API Configuration]');
  console.log('Environment:', import.meta.env.MODE);
  console.log('Production Build:', isProduction());
  console.log('Data Mode:', getDataMode());
  console.log('Backend API:', isBackendApiEnabled() ? '✅ Enabled' : '❌ Disabled');
  console.log('Backend URL:', getBackendUrl());
  if (!isBackendApiEnabled()) {
    console.warn('⚠️  IndexedDB mode is DEPRECATED');
  }
  console.groupEnd();
}

// Log configuration on module load (development only)
if (import.meta.env.DEV) {
  logApiConfig();
}






