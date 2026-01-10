/**
 * AssetDomain - Asset and equipment management service
 * Provides asset tracking, assignment, and maintenance scheduling
 * ? Migrated to backend API (2025-12-21)
 */

import { apiClient } from "@/services/infrastructure/apiClient";

interface Asset {
  id: string;
  name: string;
  type:
    | "laptop"
    | "phone"
    | "tablet"
    | "vehicle"
    | "equipment"
    | "software"
    | "other";
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  assignedTo?: string;
  status: "available" | "in-use" | "maintenance" | "retired";
  location?: string;
  metadata?: unknown;
}

interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: "repair" | "upgrade" | "inspection" | "cleaning";
  description: string;
  performedBy?: string;
  performedAt: string;
  cost?: number;
  nextMaintenanceDate?: string;
}

export const AssetService = {
  getAll: async () => {
    return apiClient.get<Asset[]>("/assets");
  },
  getById: async (id: string) => {
    return apiClient.get<Asset>(`/assets/${id}`);
  },
  add: async (item: unknown) => {
    return apiClient.post<Asset>("/assets", item);
  },
  update: async (id: string, updates: unknown) => {
    return apiClient.patch<Asset>(`/assets/${id}`, updates);
  },
  delete: async (id: string) => {
    return apiClient.delete(`/assets/${id}`);
  },

  // Asset specific methods
  getAssets: async (filters?: {
    type?: string;
    status?: string;
    assignedTo?: string;
  }): Promise<Asset[]> => {
    return apiClient.get<Asset[]>("/assets", filters);
  },

  assignAsset: async (assetId: string, userId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/assets/${assetId}/assign`, { userId });
      return true;
    } catch (error) {
      console.error("[AssetService] Failed to assign asset:", error);
      return false;
    }
  },

  unassignAsset: async (assetId: string): Promise<boolean> => {
    try {
      await apiClient.post(`/assets/${assetId}/unassign`, {});
      return true;
    } catch (error) {
      console.error("[AssetService] Failed to unassign asset:", error);
      return false;
    }
  },

  getMaintenanceHistory: async (
    assetId: string
  ): Promise<MaintenanceRecord[]> => {
    return apiClient.get<MaintenanceRecord[]>(`/assets/${assetId}/maintenance`);
  },

  scheduleMaintenance: async (
    assetId: string,
    schedule: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> => {
    return apiClient.post<MaintenanceRecord>(
      `/assets/${assetId}/maintenance`,
      schedule
    );
  },
};
