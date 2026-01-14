// ================================================================================
// DATA QUALITY DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → DataQualityService → Frontend API → Backend
//
// PURPOSE:
//   - Data quality monitoring and validation
//   - Anomaly detection and cleansing rules
//   - Data quality metrics and reporting
//
// USAGE:
//   Called by DataQualityContext and route loaders for data quality operations.
//   Never called directly from view components.
//
// ================================================================================

import {
  CleansingRule,
  DataAnomaly,
  DataProfile,
  DedupeCluster,
  QualityMetricHistory,
} from "@/types";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { apiClient } from "@/services/infrastructure/apiClient";

export class DataQualityService {
  async getAnomalies(): Promise<DataAnomaly[]> {
    return apiClient.get<DataAnomaly[]>("/data-quality/anomalies");
  }

  async getDedupeClusters(): Promise<DedupeCluster[]> {
    return apiClient.get<DedupeCluster[]>("/data-quality/dedupe-clusters");
  }
  async getHistory(): Promise<QualityMetricHistory[]> {
    return apiClient.get<QualityMetricHistory[]>("/data-quality/history");
  }
  async runCleansingJob(): Promise<{ processed: number; fixed: number }> {
    return apiClient.post<{ processed: number; fixed: number }>(
      "/data-quality/cleansing-job",
      {}
    );
  }
  async mergeCluster(clusterId: string): Promise<void> {
    return apiClient.post(
      `/data-quality/dedupe-clusters/${clusterId}/merge`,
      {}
    );
  }
  async ignoreCluster(clusterId: string): Promise<void> {
    return apiClient.post(
      `/data-quality/dedupe-clusters/${clusterId}/ignore`,
      {}
    );
  }
  async applyFix(anomalyId: string): Promise<void> {
    return apiClient.post(`/data-quality/anomalies/${anomalyId}/fix`, {});
  }

  // Optimized Profiler with single-pass aggregation and yielding
  async getProfiles(): Promise<DataProfile[]> {
    return apiClient.get<DataProfile[]>("/data-quality/profiles");
  }

  async getStandardizationRules(): Promise<CleansingRule[]> {
    try {
      return await apiClient.get<CleansingRule[]>("/data-quality/rules");
    } catch (error) {
      console.warn("Failed to fetch data quality rules", error);
      return [];
    }
  }
}
