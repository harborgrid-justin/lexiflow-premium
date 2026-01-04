/**
 * ? Migrated to backend API (2025-12-21)
 */
import { isBackendApiEnabled } from "@/api";
import { apiClient } from "@/services/infrastructure/apiClient";
import { CostForecast, CostMetric } from "@/types";

export const OperationsService = {
  getOkrs: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/operations/okrs");
    }
    return [];
  },
  getCleTracking: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/operations/cle");
    }
    return [];
  },
  getVendorContracts: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/operations/vendors/contracts");
    }
    return [];
  },
  getVendorDirectory: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/operations/vendors");
    }
    return [];
  },
  getRfps: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/operations/rfps");
    }
    return [];
  },
  getMaintenanceTickets: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/operations/maintenance");
    }
    return [];
  },
  getFacilities: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get("/operations/facilities");
    }
    return [];
  },

  getReplicationStatus: async () => {
    if (isBackendApiEnabled()) {
      return apiClient.get<any>("/operations/replication-status");
    }
    await delay(200);
    return {
      lag: 0,
      bandwidth: 0,
      syncStatus: "Unknown",
      peakBandwidth: 0,
    };
  },

  // Cost FinOps - calculated from backend metrics
  getCostMetrics: async (): Promise<CostMetric[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<CostMetric[]>("/operations/costs/metrics");
    }
    await delay(200);
    return [];
  },

  getCostForecast: async (): Promise<CostForecast[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<CostForecast[]>("/operations/costs/forecast");
    }
    await delay(200);
    return [];
  },
};
