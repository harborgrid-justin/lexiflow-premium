/**
 * Analytics and Reporting Service
 * Handles all billing analytics and reporting operations
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";
import type { FinancialPerformanceData } from "./types";
import {
  getDefaultOverviewStats,
  getDefaultRealizationStats,
  validateId,
} from "./utils";

export class AnalyticsService {
  /**
   * Get WIP (Work In Progress) statistics
   */
  async getWIPStats(): Promise<unknown[]> {
    try {
      return await apiClient.get<unknown[]>("/billing/wip-stats");
    } catch {
      console.warn(
        "[AnalyticsService.getWIPStats] WIP stats endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Get realization statistics
   */
  async getRealizationStats(): Promise<unknown> {
    try {
      return await apiClient.get<unknown>("/billing/realization-stats");
    } catch {
      console.warn(
        "[AnalyticsService.getRealizationStats] Realization stats endpoint not available, returning default"
      );
      return getDefaultRealizationStats();
    }
  }

  /**
   * Get rates for a timekeeper
   */
  async getRates(timekeeperId: string): Promise<unknown[]> {
    validateId(timekeeperId, "getRates");

    try {
      return await apiClient.get<unknown[]>(`/billing/rates/${timekeeperId}`);
    } catch {
      console.warn(
        "[AnalyticsService.getRates] Rates endpoint not available, returning empty array"
      );
      return [];
    }
  }

  /**
   * Get billing overview statistics
   */
  async getOverviewStats(): Promise<{
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
    } catch {
      console.warn(
        "[AnalyticsService.getOverviewStats] Overview stats endpoint not available, returning default"
      );
      return getDefaultOverviewStats();
    }
  }

  /**
   * Get financial performance data
   */
  async getFinancialPerformance(): Promise<FinancialPerformanceData> {
    try {
      return await apiClient.get<FinancialPerformanceData>(
        "/billing/financial-performance"
      );
    } catch {
      return { revenue: [], expenses: [] };
    }
  }

  /**
   * Get top billing accounts
   */
  async getTopAccounts(): Promise<unknown[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<unknown>>(
        "/clients",
        { sortBy: "totalBilled", sortOrder: "desc", limit: 4 }
      );
      return response.data;
    } catch {
      console.warn(
        "[AnalyticsService.getTopAccounts] Top accounts endpoint not available, returning empty array"
      );
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
