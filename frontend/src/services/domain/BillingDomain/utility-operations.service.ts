/**
 * BillingDomain - Utility Operations
 * Sync and export operations
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import { OperationError } from "./types";

/**
 * Sync billing data with external systems
 */
export async function sync(): Promise<void> {
  try {
    await apiClient.post("/billing/sync");
  } catch (error) {
    console.error("[BillingRepository.sync] Error:", error);
    throw new OperationError("Failed to sync billing data");
  }
}

/**
 * Export billing data in specified format
 */
export async function exportBillingData(format: string): Promise<string> {
  if (!format || format.trim() === "") {
    throw new Error("[BillingRepository.export] Invalid format parameter");
  }

  const validFormats = ["pdf", "xlsx", "csv", "json"];
  if (!validFormats.includes(format.toLowerCase())) {
    throw new Error(
      `[BillingRepository.export] Unsupported format: ${format}. Valid formats: ${validFormats.join(", ")}`
    );
  }

  try {
    const response = await apiClient.post<{ url: string }>("/billing/export", {
      format,
    });
    return response.url;
  } catch (error) {
    console.error("[BillingRepository.export] Error:", error);
    throw new OperationError("Failed to export billing data");
  }
}
