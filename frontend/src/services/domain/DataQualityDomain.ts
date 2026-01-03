import {
  Case,
  CleansingRule,
  DataAnomaly,
  DataProfile,
  DedupeCluster,
  QualityMetricHistory,
} from "@/types";
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { STORES, db } from "@/services/data/db";
import { yieldToMain } from "@/utils/apiUtils";
import { delay } from "@/utils/async";

export class DataQualityService {
  async getAnomalies(): Promise<DataAnomaly[]> {
    // In real app, scan DB. Here we return seeded anomalies.
    const anomalies = await db.getAll<DataAnomaly>("anomalies");
    if (anomalies.length === 0) {
      return [
        {
          id: 1,
          table: "clients",
          field: "email",
          issue: "Invalid Format",
          count: 12,
          sample: "john-doe@",
          status: "Detected",
          severity: "High",
        },
        {
          id: 2,
          table: "cases",
          field: "status",
          issue: "Inconsistent Casing",
          count: 5,
          sample: "closed",
          status: "Fixed",
          severity: "Low",
        },
      ];
    }
    return anomalies;
  }

  async getDedupeClusters(): Promise<DedupeCluster[]> {
    await delay(100);
    return [];
  }
  async getHistory(): Promise<QualityMetricHistory[]> {
    await delay(100);
    return [];
  }
  async runCleansingJob(): Promise<{ processed: number; fixed: number }> {
    await delay(800);
    return { processed: 1500, fixed: 42 };
  }
  async mergeCluster(): Promise<void> {
    await delay(100);
  }
  async ignoreCluster(): Promise<void> {
    await delay(100);
  }
  async applyFix(): Promise<void> {
    await delay(100);
  }

  // Optimized Profiler with single-pass aggregation and yielding
  async getProfiles(): Promise<DataProfile[]> {
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
        if (year && filingYears[year] !== undefined) filingYears[year]++;
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
