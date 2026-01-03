/**
 * @module services/api/data-platform/versioning-api
 * @description Data versioning API service
 * Handles entity versioning, branching, and version comparison
 * 
 * @responsibility Manage data version control
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';

/**
 * Data version interface
 */
export interface DataVersion {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  branch?: string;
  tag?: string;
  commitMessage?: string;
  createdBy?: string;
  createdAt: string;
}

/**
 * Versioning API service class
 * Provides methods for data version control
 */
export class VersioningApiService {
  /**
   * Get version history for an entity
   */
  async getHistory(
    entityType: string,
    entityId: string,
    filters?: Record<string, unknown>,
  ): Promise<PaginatedResponse<DataVersion>> {
    try {
      return await apiClient.get<PaginatedResponse<DataVersion>>(
        `/versioning/history/${entityType}/${entityId}`,
        filters,
      );
    } catch {
      return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
  }

  /**
   * Create a new version of an entity
   */
  async createVersion(data: {
    entityType: string;
    entityId: string;
    data: Record<string, unknown>;
    branch?: string;
    tag?: string;
    commitMessage?: string;
    userId?: string;
  }): Promise<DataVersion> {
    return await apiClient.post<DataVersion>('/versioning', data);
  }

  /**
   * Get all branches for an entity
   */
  async getBranches(entityType: string, entityId: string): Promise<string[]> {
    try {
      return await apiClient.get<string[]>(`/versioning/branches/${entityType}/${entityId}`);
    } catch {
      return [];
    }
  }

  /**
   * Get all tags for an entity
   */
  async getTags(entityType: string, entityId: string): Promise<unknown[]> {
    try {
      return await apiClient.get<unknown[]>(`/versioning/tags/${entityType}/${entityId}`);
    } catch {
      return [];
    }
  }

  /**
   * Tag a specific version
   */
  async tagVersion(id: string, tag: string): Promise<DataVersion> {
    return await apiClient.post<DataVersion>(`/versioning/${id}/tag`, { tag });
  }

  /**
   * Compare two versions
   */
  async compareVersions(id1: string, id2: string): Promise<{
    version1: unknown;
    version2: unknown;
  }> {
    return await apiClient.get(`/versioning/compare/${id1}/${id2}`);
  }
}
