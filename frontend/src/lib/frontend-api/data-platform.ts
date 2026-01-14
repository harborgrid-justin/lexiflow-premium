/**
 * Data Platform Frontend API
 * Domain contract for data platform and infrastructure operations
 *
 * @module lib/frontend-api/data-platform
 * @description Handles data platform operations, caching, and infrastructure
 * management per enterprise API standard
 *
 * Result Type Guarantee:
 * All functions return Promise<Result<T>> - never throw
 */

import { client, failure, type Result, ValidationError } from "./index";

/**
 * Get platform configuration and status
 */
export async function getPlatformConfig(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/config");
}

/**
 * Get platform health and system status
 */
export async function getPlatformHealth(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/health");
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/cache/stats");
}

/**
 * Clear platform cache
 */
export async function clearCache(pattern?: string): Promise<Result<void>> {
  if (pattern === "") {
    return failure(new ValidationError("Cache pattern cannot be empty string"));
  }
  const params = pattern ? { pattern } : undefined;
  return client.post<void>("/platform/cache/clear", {}, { params });
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/database/stats");
}

/**
 * Run database optimization
 */
export async function optimizeDatabase(): Promise<
  Result<Record<string, unknown>>
> {
  return client.post<Record<string, unknown>>(
    "/platform/database/optimize",
    {}
  );
}

/**
 * Get storage information
 */
export async function getStorageInfo(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/storage/info");
}

/**
 * Get replication status
 */
export async function getReplicationStatus(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/replication/status");
}

/**
 * Get indexing progress
 */
export async function getIndexingProgress(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/indexing/progress");
}

/**
 * Trigger reindex operation
 */
export async function triggerReindex(): Promise<
  Result<Record<string, unknown>>
> {
  return client.post<Record<string, unknown>>("/platform/indexing/reindex", {});
}

/**
 * Get system metrics
 */
export async function getSystemMetrics(): Promise<
  Result<Record<string, unknown>>
> {
  return client.get<Record<string, unknown>>("/platform/metrics");
}

export const dataPlatformApi = {
  getPlatformConfig,
  getPlatformHealth,
  getCacheStats,
  clearCache,
  getDatabaseStats,
  optimizeDatabase,
  getStorageInfo,
  getReplicationStatus,
  getIndexingProgress,
  triggerReindex,
  getSystemMetrics,
};
