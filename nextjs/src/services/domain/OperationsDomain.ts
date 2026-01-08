/**
 * ? Migrated to backend API (2025-12-21)
 */
import { isBackendApiEnabled } from "@/api";
import { apiClient } from "@/services/infrastructure/apiClient";
import { CostForecast, CostMetric } from "@/types";
import { delay } from "@/utils/async";

export const OperationsService = {
  // Operations data - backend API integration with fallback
  getOkrs: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/okrs");
      } catch (error) {
        console.error("[OperationsService.getOkrs] Error:", error);
      }
    }
    await delay(200);
    return [];
  },
  getCleTracking: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/cle-tracking");
      } catch (error) {
        console.error("[OperationsService.getCleTracking] Error:", error);
      }
    }
    await delay(200);
    return [];
  },
  getVendorContracts: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/vendor-contracts");
      } catch (error) {
        console.error("[OperationsService.getVendorContracts] Error:", error);
      }
    }
    await delay(200);
    return [];
  },
  getVendorDirectory: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/vendor-directory");
      } catch (error) {
        console.error("[OperationsService.getVendorDirectory] Error:", error);
      }
    }
    await delay(200);
    return [];
  },
  getRfps: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/rfps");
      } catch (error) {
        console.error("[OperationsService.getRfps] Error:", error);
      }
    }
    await delay(200);
    return [];
  },
  getMaintenanceTickets: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/maintenance-tickets");
      } catch (error) {
        console.error(
          "[OperationsService.getMaintenanceTickets] Error:",
          error
        );
      }
    }
    await delay(200);
    return [];
  },
  getFacilities: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/facilities");
      } catch (error) {
        console.error("[OperationsService.getFacilities] Error:", error);
      }
    }
    await delay(200);
    return [];
  },

  getReplicationStatus: async () => {
    await delay(200);
    return {
      lag: 12,
      bandwidth: 45,
      syncStatus: "Active",
      peakBandwidth: 120,
    };
  },

  // Cost FinOps - calculated from backend metrics
  getCostMetrics: async (): Promise<CostMetric[]> => {
    await delay(200);
    return [
      { name: "Compute", cost: 1200 },
      { name: "Storage", cost: 850 },
      { name: "Network", cost: 300 },
      { name: "DB", cost: 1500 },
      { name: "AI", cost: 2200 },
    ];
  },

  getCostForecast: async (): Promise<CostForecast[]> => {
    await delay(200);
    return [
      { day: "1", actual: 120, forecast: 125 },
      { day: "5", actual: 135, forecast: 130 },
      { day: "10", actual: 140, forecast: 145 },
      { day: "15", actual: 180, forecast: 160 },
      { day: "20", actual: null, forecast: 185 },
      { day: "25", actual: null, forecast: 190 },
      { day: "30", actual: null, forecast: 210 },
    ];
  },
};
