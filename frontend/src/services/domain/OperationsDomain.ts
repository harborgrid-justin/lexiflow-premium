/**
 * ? Migrated to backend API (2025-12-21)
 */
import { isBackendApiEnabled } from "@/api";
import { apiClient } from "@/services/infrastructure/apiClient";
import {
  CostForecast,
  InfrastructureCostMetric,
  ReplicationStatus,
} from "@/types";

export const OperationsService = {
  getOkrs: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/okrs");
      } catch (_error) {
        console.warn(
          "[OperationsService] OKRs endpoint not available, returning empty array"
        );
        return [];
      }
    }
    return [];
  },
  getCleTracking: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/cle");
      } catch (_error) {
        console.warn(
          "[OperationsService] CLE endpoint not available, returning empty array"
        );
        return [];
      }
    }
    return [];
  },
  getVendorContracts: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/vendors/contracts");
      } catch (_error) {
        console.warn(
          "[OperationsService] Vendor contracts endpoint not available, returning empty array"
        );
        return [];
      }
    }
    return [];
  },
  getVendorDirectory: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/vendors");
      } catch (_error) {
        console.warn(
          "[OperationsService] Vendor directory endpoint not available, returning empty array"
        );
        return [];
      }
    }
    return [];
  },
  getRfps: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/rfps");
      } catch (_error) {
        console.warn(
          "[OperationsService] RFPs endpoint not available, returning empty array"
        );
        return [];
      }
    }
    return [];
  },
  getMaintenanceTickets: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/maintenance");
      } catch (_error) {
        console.warn(
          "[OperationsService] Maintenance endpoint not available, returning empty array"
        );
        return [];
      }
    }
    return [];
  },
  getFacilities: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get("/operations/facilities");
      } catch (_error) {
        console.warn(
          "[OperationsService] Facilities endpoint not available, returning empty array"
        );
        return [];
      }
    }
    return [];
  },

  getReplicationStatus: async () => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<ReplicationStatus>(
          "/operations/replication-status"
        );
      } catch (_error) {
        console.warn(
          "[OperationsService] Replication status endpoint not available, returning defaults"
        );
        return {
          lag: 0,
          bandwidth: 0,
          syncStatus: "Unknown",
          peakBandwidth: 0,
        };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      lag: 0,
      bandwidth: 0,
      syncStatus: "Unknown",
      peakBandwidth: 0,
    };
  },

  // Cost FinOps - calculated from backend metrics
  getCostMetrics: async (): Promise<InfrastructureCostMetric[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<InfrastructureCostMetric[]>(
          "/operations/costs/metrics"
        );
      } catch (_error) {
        console.warn(
          "[OperationsService] Cost metrics endpoint not available, returning empty array"
        );
        return [];
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [];
  },

  getCostForecast: async (): Promise<CostForecast[]> => {
    if (isBackendApiEnabled()) {
      try {
        return await apiClient.get<CostForecast[]>(
          "/operations/costs/forecast"
        );
      } catch (_error) {
        console.warn(
          "[OperationsService] Cost forecast endpoint not available, returning empty array"
        );
        return [];
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [];
  },
};
