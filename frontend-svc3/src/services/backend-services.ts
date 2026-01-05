/**
 * Backend Integration Services Barrel Export
 *
 * Backend API, health checks, and configuration.
 * Import from '@/services/backend' for better tree-shaking.
 */

// API Client
export * from './infrastructure/apiClient';

// API Configuration & Mode Detection
export {
  isBackendApiEnabled,
  isIndexedDBMode,
  getDataMode,
  forceBackendMode,
  enableLegacyIndexedDB,
  isProduction,
  getBackendUrl,
  logApiConfig
} from '@/config/network/api.config';

// Backend Discovery
export * from './integration/backendDiscovery';

// Consolidated API Object
export { api } from '@/api';
