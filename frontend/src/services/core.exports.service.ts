/**
 * Services Core Exports
 *
 * This file exports ONLY the core infrastructure services to prevent circular dependencies.
 * Do NOT import domain services or integration handlers here.
 */

// ====================
CORE INFRASTRUCTURE ====================
export * from "./core/errors";
export * from "./core/microORM";
export * from "./core/Repository";
export * from "./core/RepositoryFactory";

// ====================
INFRASTRUCTURE ADAPTERS ====================
export * from "./infrastructure/adapters/StorageAdapter";
export * from "./infrastructure/adapters/WindowAdapter";
export * from "./infrastructure/api-client.service";

// ====================
DATA LAYER (BASE ONLY) ====================
export * from "./data/db";

// ====================
QUERY CLIENT ====================
export * from "./infrastructure/query-client.service";
export * from "./infrastructure/query-keys.service";

// ====================
BACKEND API CONFIG ====================
export {
  enableLegacyIndexedDB,
  forceBackendMode,
  getBackendUrl,
  getDataMode,
  isBackendApiEnabled,
  isIndexedDBMode,
  isProduction,
  logApiConfig,
} from "@/config/network/api.config";

// Export API object
export { api } from '@/lib/frontend-api';
