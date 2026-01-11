/**
 * BillingDomain - Rate Operations
 * Rate table management
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { RateTable } from "./types";
import { OperationError } from "./types";

/**
 * Get rate tables for a specific timekeeper
 *
 * @param timekeeperId - Timekeeper ID
 * @returns Promise<RateTable[]> Array of rate tables
 * @throws Error if timekeeperId is invalid or fetch fails
 *
 * @example
 * const rates = await getRates('tk-123');
 */
export async function getRates(timekeeperId: string): Promise<RateTable[]> {
  if (!timekeeperId || timekeeperId.trim() === "") {
    throw new Error("[BillingRepository.getRates] Invalid timekeeperId parameter");
  }

  try {
    return await apiClient.get<RateTable[]>(`/billing/rates/${timekeeperId}`);
  } catch (error) {
    console.error("[BillingRepository.getRates] Error:", error);
    throw new OperationError("Failed to fetch rate tables");
  }
}
