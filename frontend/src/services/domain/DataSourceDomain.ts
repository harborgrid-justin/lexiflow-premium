/**
 * DataSourceDomain - External data source integration service
 * Provides connection management, synchronization, and data source testing
 * ? Migrated to backend API (2025-12-21)
 */

import { api, isBackendApiEnabled } from "@/api";
import { db } from "@/services/data/db";
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

const DATA_SOURCES_STORE = "data_sources";

export const DataSourceService = {
  getAll: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get<DataSource[]>("/data-sources");
    }
    return db.getAll(DATA_SOURCES_STORE);
  },
  getById: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.get<DataSource>(`/data-sources/${id}`);
    }
    return db.get(DATA_SOURCES_STORE, id);
  },
  add: async (item: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.post<DataSource>("/data-sources", item);
    }
    return db.put(DATA_SOURCES_STORE, {
      ...(item && typeof item === "object" ? item : {}),
      connected: false,
      createdAt: new Date().toISOString(),
    });
  },
  update: async (id: string, updates: unknown) => {
    if (isBackendApiEnabled()) {
      return apiClient.patch<DataSource>(`/data-sources/${id}`, updates);
    }
    const existing = await db.get(DATA_SOURCES_STORE, id);
    return db.put(DATA_SOURCES_STORE, {
      ...(existing && typeof existing === "object" ? existing : {}),
      ...(updates && typeof updates === "object" ? updates : {}),
    });
  },
  delete: async (id: string) => {
    if (isBackendApiEnabled()) {
      return apiClient.delete(`/data-sources/${id}`);
    }
    return db.delete(DATA_SOURCES_STORE, id);
  },

  // Data source specific methods
  getDataSources: async (filters?: {
    type?: string;
    connected?: boolean;
  }): Promise<DataSource[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<DataSource[]>("/data-sources", filters);
    }
    let sources = await db.getAll<DataSource>(DATA_SOURCES_STORE);

    if (filters?.type) {
      sources = sources.filter((s: DataSource) => s.type === filters.type);
    }

    if (filters?.connected !== undefined) {
      sources = sources.filter(
        (s: DataSource) => s.connected === filters.connected
      );
    }

    return sources;
  },

  connect: async (sourceId: string): Promise<boolean> => {
    if (isBackendApiEnabled()) {
      try {
        await apiClient.post(`/data-sources/${sourceId}/connect`);
        return true;
      } catch (e) {
        console.error("Connection failed", e);
        return false;
      }
    }
    console.warn("[DataSourceService] Backend API disabled");
    return false;
  },

  disconnect: async (sourceId: string): Promise<boolean> => {
    if (isBackendApiEnabled()) {
      try {
        await apiClient.post(`/data-sources/${sourceId}/disconnect`);
        return true;
      } catch (e) {
        console.error("Disconnect failed", e);
        return false;
      }
    }
    console.warn("[DataSourceService] Backend API disabled");
    return false;
  },

  sync: async (
    sourceId: string,
    options?: { fullSync?: boolean }
  ): Promise<boolean> => {
    if (isBackendApiEnabled()) {
      try {
        await apiClient.post(`/data-sources/${sourceId}/sync`, options);
        return true;
      } catch (e) {
        console.error("Sync failed", e);
        return false;
      }
    }
    console.warn("[DataSourceService] Backend API disabled");
    return false;
  },

  testConnection: async (sourceId: string): Promise<ConnectionStatus> => {
    if (isBackendApiEnabled()) {
      try {
        const result = await api.dataPlatform.dataSources.test(sourceId);
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
    }
    return { connected: false, error: "Backend API disabled" };
  },
};
