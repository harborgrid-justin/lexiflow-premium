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

/**
 * Data Sources sub-module (stub implementation)
 */
const dataSources = {
  async getAll() {
    return await client.get<unknown[]>("/platform/data-sources");
  },
  async getById(id: string) {
    return await client.get<unknown>(`/platform/data-sources/${id}`);
  },
  async create(data: unknown) {
    return await client.post<unknown>("/platform/data-sources", data);
  },
  async update(id: string, data: unknown) {
    return await client.put<unknown>(`/platform/data-sources/${id}`, data);
  },
  async delete(id: string) {
    return await client.delete<void>(`/platform/data-sources/${id}`);
  },
};

/**
 * RLS Policies sub-module (stub implementation)
 */
const rlsPolicies = {
  async getAll() {
    return await client.get<unknown[]>("/platform/rls-policies");
  },
  async getById(id: string) {
    return await client.get<unknown>(`/platform/rls-policies/${id}`);
  },
  async create(data: unknown) {
    return await client.post<unknown>("/platform/rls-policies", data);
  },
  async update(id: string, data: unknown) {
    return await client.put<unknown>(`/platform/rls-policies/${id}`, data);
  },
  async delete(id: string) {
    return await client.delete<void>(`/platform/rls-policies/${id}`);
  },
};

/**
 * Schema Management sub-module (stub implementation)
 */
const schemaManagement = {
  async getSchemas() {
    return await client.get<unknown[]>("/platform/schemas");
  },
  async getSchema(schemaName: string) {
    return await client.get<unknown>(`/platform/schemas/${schemaName}`);
  },
  async createSchema(data: unknown) {
    return await client.post<unknown>("/platform/schemas", data);
  },
};

/**
 * Query Workbench sub-module (stub implementation)
 */
const queryWorkbench = {
  async executeQuery(query: string) {
    return await client.post<unknown>("/platform/query", { query });
  },
  async getSavedQueries() {
    return await client.get<unknown[]>("/platform/queries");
  },
  async saveQuery(data: unknown) {
    return await client.post<unknown>("/platform/queries", data);
  },
};

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
  // Sub-modules for descriptor compatibility
  dataSources,
  rlsPolicies,
  schemaManagement,
  queryWorkbench,
};
