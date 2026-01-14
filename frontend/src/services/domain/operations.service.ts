// ================================================================================
// OPERATIONS DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → OperationsService → Frontend API → Backend
//
// PURPOSE:
//   - Operational workflow management and tracking
//   - Process automation and task orchestration
//   - Operations metrics and performance monitoring
//
// USAGE:
//   Called by OperationsContext and route loaders.
//   Never called directly from view components.
//
// MIGRATION NOTES:
//   ✅ Migrated to backend API (2025-12-21)
//
// ================================================================================

import { apiClient } from "@/services/infrastructure/api-client.service";
import {
  CostForecast,
  InfrastructureCostMetric,
  ReplicationStatus,
} from "@/types";

export const OperationsService = {
  getOkrs: async () => {
    try {
      return await apiClient.get("/operations/okrs");
    } catch {
      console.warn(
        "[OperationsService] OKRs endpoint not available, returning empty array"
      );
      return [];
    }
  },
  getCleTracking: async () => {
    try {
      return await apiClient.get("/operations/cle");
    } catch {
      console.warn(
        "[OperationsService] CLE endpoint not available, returning empty array"
      );
      return [];
    }
  },
  getVendorContracts: async () => {
    try {
      return await apiClient.get("/operations/vendors/contracts");
    } catch {
      console.warn(
        "[OperationsService] Vendor contracts endpoint not available, returning empty array"
      );
      return [];
    }
  },
  getVendorDirectory: async () => {
    try {
      return await apiClient.get("/operations/vendors");
    } catch {
      console.warn(
        "[OperationsService] Vendor directory endpoint not available, returning empty array"
      );
      return [];
    }
  },
  getRfps: async () => {
    try {
      return await apiClient.get("/operations/rfps");
    } catch {
      console.warn(
        "[OperationsService] RFPs endpoint not available, returning empty array"
      );
      return [];
    }
  },
  getMaintenanceTickets: async () => {
    try {
      return await apiClient.get("/operations/maintenance");
    } catch {
      console.warn(
        "[OperationsService] Maintenance endpoint not available, returning empty array"
      );
      return [];
    }
  },
  getFacilities: async () => {
    try {
      return await apiClient.get("/operations/facilities");
    } catch {
      console.warn(
        "[OperationsService] Facilities endpoint not available, returning empty array"
      );
      return [];
    }
  },

  getLeaseMetrics: async () => {
    try {
      return await apiClient.get("/operations/leases/metrics");
    } catch {
      console.warn(
        "[OperationsService] Lease Metrics endpoint not available, returning defaults"
      );
      return { totalSqFt: 0, monthlyRent: 0, expiringLeases: 0 };
    }
  },

  getReplicationStatus: async () => {
    try {
      return await apiClient.get<ReplicationStatus>(
        "/operations/replication-status"
      );
    } catch {
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
  },

  // Cost FinOps - calculated from backend metrics
  getCostMetrics: async (): Promise<InfrastructureCostMetric[]> => {
    try {
      return await apiClient.get<InfrastructureCostMetric[]>(
        "/operations/costs/metrics"
      );
    } catch {
      console.warn(
        "[OperationsService] Cost metrics endpoint not available, returning empty array"
      );
      return [];
    }
  },

  getCostForecast: async (): Promise<CostForecast[]> => {
    try {
      return await apiClient.get<CostForecast[]>("/operations/costs/forecast");
    } catch {
      console.warn(
        "[OperationsService] Cost forecast endpoint not available, returning empty array"
      );
      return [];
    }
  },
};
