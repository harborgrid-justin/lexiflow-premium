/**
 * Task Statistics Service
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { TaskFilters } from "./types";
import type { TaskStatistics } from "@/types";

export class TaskStatisticsService {
  private readonly baseUrl = "/tasks";

  async getStatistics(filters?: TaskFilters): Promise<TaskStatistics> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append("caseId", filters.caseId);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
      const queryString = params.toString();
      const url = queryString
        ? `${this.baseUrl}/statistics?${queryString}`
        : `${this.baseUrl}/statistics`;
      return await apiClient.get<TaskStatistics>(url);
    } catch (error) {
      console.error("[TaskStatisticsService.getStatistics] Error:", error);
      throw new Error("Failed to fetch task statistics");
    }
  }
}

export const taskStatisticsService = new TaskStatisticsService();
