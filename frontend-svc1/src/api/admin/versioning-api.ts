/**
 * Versioning API Service
 * Document and entity version control
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface Version {
  id: string;
  entityId: string;
  entityType: string;
  versionNumber: number;
  changes?: Record<string, unknown>;
  changesSummary?: string;
  createdBy?: string;
  createdAt: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface VersionFilters {
  entityId?: string;
  entityType?: string;
}

export class VersioningApiService {
  private readonly baseUrl = "/versioning";

  async getVersions(filters: VersionFilters): Promise<Version[]> {
    const params = new URLSearchParams();
    if (filters.entityId) params.append("entityId", filters.entityId);
    if (filters.entityType) params.append("entityType", filters.entityType);
    const queryString = params.toString();
    return apiClient.get<Version[]>(`${this.baseUrl}?${queryString}`);
  }

  async getVersion(id: string): Promise<Version> {
    return apiClient.get<Version>(`${this.baseUrl}/${id}`);
  }

  async createVersion(data: {
    entityId: string;
    entityType: string;
    changes: Record<string, unknown>;
  }): Promise<Version> {
    return apiClient.post<Version>(this.baseUrl, data);
  }

  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/compare?v1=${version1Id}&v2=${version2Id}`
    );
  }

  async revertToVersion(versionId: string): Promise<unknown> {
    return apiClient.post(`${this.baseUrl}/${versionId}/revert`, {});
  }

  async getHistory(): Promise<unknown[]> {
    return apiClient.get<unknown[]>(`${this.baseUrl}/history`);
  }

  async getBranches(): Promise<unknown[]> {
    return apiClient.get<unknown[]>(`${this.baseUrl}/branches`);
  }

  async getTags(): Promise<unknown[]> {
    return apiClient.get<unknown[]>(`${this.baseUrl}/tags`);
  }
}
