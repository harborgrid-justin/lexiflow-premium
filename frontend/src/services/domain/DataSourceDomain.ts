/**
 * DataSourceDomain - External data source integration service
 * Provides connection management, synchronization, and data source testing
 * ? Migrated to backend API (2025-12-21)
 */

import { dataPlatformApi } from "@/api/domains/data-platform.api";
import { apiClient } from "@/services/infrastructure/apiClient";

interface DataSource {
  id: string;
  name: string;
  type:
    | "postgresql"
    | "mysql"
    | "mongodb"
    | "salesforce"
    | "google-drive"
    | "sharepoint";
  host?: string;
  port?: number;
  database?: string;
  connected: boolean;
  lastSync?: string;
  syncInterval?: number;
  metadata?: unknown;
}

interface ConnectionStatus {
  connected: boolean;
  latency?: number;
  error?: string;
  version?: string;
}

export const DataSourceService = {
  getAll: async () => {
    try {
      return await apiClient.get<DataSource[]>("/data-sources");
    } catch {
      console.warn(
        "[DataSourceService] Backend endpoint not available, returning empty array"
      );
      return [];
    }
  },
  getById: async (id: string) => {
    return apiClient.get<DataSource>(`/data-sources/${id}`);
  },
  add: async (item: unknown) => {
    return apiClient.post<DataSource>("/data-sources", item);
  },
  update: async (id: string, updates: unknown) => {
    return apiClient.patch<DataSource>(`/data-sources/${id}`, updates);
  },
  delete: async (id: string) => {
    return apiClient.delete(`/data-sources/${id}`);
  },

  // Data source specific methods
  getDataSources: async (filters?: {
    type?: string;
    connected?: boolean;
  }): Promise<DataSource[]> => {
    return apiClient.get<DataSource[]>("/data-sources", filters);
  },

  connect: async (sourceId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/data-sources/${sourceId}/connect`);
      return true;
    } catch (e) {
      console.error("Connection failed", e);
      return false;
    }
  },

  disconnect: async (sourceId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/data-sources/${sourceId}/disconnect`);
      return true;
    } catch (e) {
      console.error("Disconnect failed", e);
      return false;
    }
  },

  sync: async (
    sourceId: string,
    options?: { fullSync?: boolean }
  ): Promise<boolean> => {
    try {
      await apiClient.post(`/data-sources/${sourceId}/sync`, options);
      return true;
    } catch (e) {
      console.error("Sync failed", e);
      return false;
    }
  },

  testConnection: async (sourceId: string): Promise<ConnectionStatus> => {
    try {
      const result = await dataPlatformApi.dataSources.test(sourceId);
      return {
        connected: result.success,
        latency: 0,
        version: "Unknown",
        error: result.message,
      };
    } catch (e) {
      return {
        connected: false,
        error: e instanceof Error ? e.message : "Connection failed",
      };
    }
  },
};
