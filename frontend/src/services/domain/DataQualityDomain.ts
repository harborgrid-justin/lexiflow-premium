import { STORES, db } from "@/services/data/db";
import {
  Case,
  CleansingRule,
  DataAnomaly,
  DataProfile,
  DedupeCluster,
  QualityMetricHistory,
} from "@/types";
import { delay, yieldToMain } from "@/utils/async";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { isBackendApiEnabled } from "@/api";
import { apiClient } from "@/services/infrastructure/apiClient";

export class DataQualityService {
  async getAnomalies(): Promise<DataAnomaly[]> {
    if (isBackendApiEnabled()) {
      return apiClient.get<DataAnomaly[]>("/data-quality/anomalies");
    }
    return [];
  }

  async getDedupeClusters(): Promise<DedupeCluster[]> {
    if (isBackendApiEnabled()) {
      return apiClient.get<DedupeCluster[]>("/data-quality/dedupe-clusters");
    }
    return [];
  }
  async getHistory(): Promise<QualityMetricHistory[]> {
    if (isBackendApiEnabled()) {
      return apiClient.get<QualityMetricHistory[]>("/data-quality/history");
    }
    return [];
  }
  async runCleansingJob(): Promise<{ processed: number; fixed: number }> {
    if (isBackendApiEnabled()) {
      return apiClient.post<{ processed: number; fixed: number }>(
        "/data-quality/cleansing-job",
        {}
      );
    }
    throw new Error("Backend API required");
  }
  async mergeCluster(clusterId: string): Promise<void> {
    if (isBackendApiEnabled()) {
      return apiClient.post(
        `/data-quality/dedupe-clusters/${clusterId}/merge`,
        {}
      );
    }
    throw new Error("Backend API required");
  }
  async ignoreCluster(clusterId: string): Promise<void> {
    if (isBackendApiEnabled()) {
      return apiClient.post(
        `/data-quality/dedupe-clusters/${clusterId}/ignore`,
        {}
      );
    }
    throw new Error("Backend API required");
  }
  async applyFix(anomalyId: string): Promise<void> {
    if (isBackendApiEnabled()) {
      return apiClient.post(`/data-quality/anomalies/${anomalyId}/fix`, {});
    }
    throw new Error("Backend API required");
  }

  // Optimized Profiler with single-pass aggregation and yielding
  async getProfiles(): Promise<DataProfile[]> {
    if (isBackendApiEnabled()) {
      return apiClient.get<DataProfile[]>("/data-quality/profiles");
    }
    const cases = await db.getAll<Case>(STORES.CASES);
    const total = cases.length;

    // Initialize accumulators
    const statusCounts: Record<string, number> = {};
    let valueNulls = 0;
    const valueDist = { "0-10k": 0, "10k-100k": 0, "100k+": 0 };
    const filingYears: Record<string, number> = {
      "2023": 0,
      "2024": 0,
      "2025": 0,
    };
    const uniqueValues = new Set<number>();
    const uniqueDates = new Set<string>();

    // Single pass loop
    for (let i = 0; i < total; i++) {
      const c = cases[i];
      if (!c) continue;

      // Status Profile
      if (c.status) {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      }

      // Value Profile
      if (c.value === undefined || c.value === null) {
        valueNulls++;
      } else {
        uniqueValues.add(c.value);
        if (c.value < 10000) valueDist["0-10k"]++;
        else if (c.value < 100000) valueDist["10k-100k"]++;
        else valueDist["100k+"]++;
      }

      // Date Profile
      if (c.filingDate) {
        uniqueDates.add(c.filingDate);
        const year = c.filingDate.split("-")[0];
        if (year && filingYears[year] !== undefined) {
          filingYears[year] = (filingYears[year] as number) + 1;
        }
      }

      // Yield every 500 items to keep UI responsive
      if (i % 500 === 0) await yieldToMain();
    }

    const statusDistArray = Object.keys(statusCounts).map((k) => ({
      name: k,
      value: statusCounts[k] || 0,
    }));

    return [
      {
        column: "status",
        type: "string",
        nulls: 0,
        unique: Object.keys(statusCounts).length,
        distribution: statusDistArray,
      },
      {
        column: "value",
        type: "numeric",
        nulls:
          total > 0 ? parseFloat(((valueNulls / total) * 100).toFixed(1)) : 0,
        unique: uniqueValues.size,
        distribution: [
          { name: "0-10k", value: valueDist["0-10k"] },
          { name: "10k-100k", value: valueDist["10k-100k"] },
          { name: "100k+", value: valueDist["100k+"] },
        ],
      },
      {
        column: "filing_date",
        type: "datetime",
        nulls: 0,
        unique: uniqueDates.size,
        distribution: [
          { name: "2023", value: filingYears["2023"] ?? 0 },
          { name: "2024", value: filingYears["2024"] ?? 0 },
          { name: "2025", value: filingYears["2025"] ?? 0 },
        ],
      },
    ];
  }

  async getStandardizationRules(): Promise<CleansingRule[]> {
    await delay(100);
    return [
      {
        id: "rule-phone",
        name: "Normalize Phone Numbers",
        targetField: "phone",
        operation: "FormatPhone",
        isActive: true,
        parameters: { format: "E.164" },
      },
      {
        id: "rule-email",
        name: "Lowercase Emails",
        targetField: "email",
        operation: "Lowercase",
        isActive: true,
      },
      {
        id: "rule-trim",
        name: "Trim Whitespace",
        targetField: "*",
        operation: "Trim",
        isActive: true,
      },
    ];
  }
}
