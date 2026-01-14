/**
 * BillingDomain - Analytics Operations
 * WIP stats, realization, financial performance, and reporting
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type {
  Client,
  FinancialPerformanceData,
  OperatingSummary,
  WIPStat,
} from "./types";
import { OperationError } from "./types";

/**
 * Get work-in-progress statistics
 */
export async function getWIPStats(): Promise<WIPStat[]> {
  try {
    return await apiClient.get<WIPStat[]>("/billing/wip-stats");
  } catch (error) {
    console.error("[BillingRepository.getWIPStats] Error:", error);
    throw new OperationError("Failed to fetch WIP statistics");
  }
}

/**
 * Get realization statistics
 */
export async function getRealizationStats(): Promise<unknown> {
  try {
    return await apiClient.get<unknown>("/billing/realization-stats");
  } catch (error) {
    console.error("[BillingRepository.getRealizationStats] Error:", error);
    throw new OperationError("Failed to fetch realization statistics");
  }
}

/**
 * Get top client accounts by billing
 */
export async function getTopAccounts(): Promise<Client[]> {
  try {
    return await apiClient.get<Client[]>("/billing/top-accounts");
  } catch (error) {
    console.error("[BillingRepository.getTopAccounts] Error:", error);
    throw new OperationError("Failed to fetch top accounts");
  }
}

/**
 * Get billing overview statistics
 */
export async function getOverviewStats(): Promise<{
  realization: number;
  totalBilled: number;
  month: string;
}> {
  try {
    return await apiClient.get<{
      realization: number;
      totalBilled: number;
      month: string;
    }>("/billing/overview-stats");
  } catch (error) {
    console.error("[BillingRepository.getOverviewStats] Error:", error);
    throw new OperationError("Failed to fetch overview statistics");
  }
}

/**
 * Get operating summary
 */
export async function getOperatingSummary(): Promise<OperatingSummary> {
  try {
    return await apiClient.get<OperatingSummary>("/billing/operating-summary");
  } catch (error) {
    console.error("[BillingRepository.getOperatingSummary] Error:", error);
    throw new OperationError("Failed to fetch operating summary");
  }
}

/**
 * Get financial performance data
 */
export async function getFinancialPerformance(): Promise<FinancialPerformanceData> {
  try {
    return await apiClient.get<FinancialPerformanceData>(
      "/billing/financial-performance"
    );
  } catch (error) {
    console.error("[BillingRepository.getFinancialPerformance] Error:", error);
    throw new OperationError("Failed to fetch financial performance data");
  }
}
