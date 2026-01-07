/**
 * Task Statistics and Analytics Service
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { TaskStatistics, WorkflowTask } from "./types";

export class TaskAnalyticsService {
  /**
   * Get task statistics
   */
  async getStatistics(): Promise<TaskStatistics> {
    try {
      return await apiClient.get<TaskStatistics>("/tasks/statistics");
    } catch (error) {
      console.error("[TaskAnalyticsService.getStatistics] Error:", error);
      return {
        total: 0,
        byStatus: {
          "To Do": 0,
          "In Progress": 0,
          Blocked: 0,
          Completed: 0,
          Cancelled: 0,
        },
        byPriority: {
          Low: 0,
          Medium: 0,
          High: 0,
          Critical: 0,
        },
        overdue: 0,
        completedThisWeek: 0,
        completedThisMonth: 0,
        averageCompletionTime: 0,
        averageEstimateAccuracy: 0,
      };
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<WorkflowTask[]> {
    try {
      return await apiClient.get<WorkflowTask[]>("/tasks/overdue");
    } catch (error) {
      console.error("[TaskAnalyticsService.getOverdueTasks] Error:", error);
      return [];
    }
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(days: number = 7): Promise<WorkflowTask[]> {
    try {
      return await apiClient.get<WorkflowTask[]>("/tasks/upcoming", { days });
    } catch (error) {
      console.error("[TaskAnalyticsService.getUpcomingTasks] Error:", error);
      return [];
    }
  }

  /**
   * Get tasks by case
   */
  async getTasksByCase(caseId: string): Promise<WorkflowTask[]> {
    if (!caseId) {
      throw new Error(
        "[TaskAnalyticsService.getTasksByCase] Invalid caseId parameter"
      );
    }

    try {
      return await apiClient.get<WorkflowTask[]>(`/tasks/case/${caseId}`);
    } catch (error) {
      console.error("[TaskAnalyticsService.getTasksByCase] Error:", error);
      return [];
    }
  }

  /**
   * Get tasks by assignee
   */
  async getTasksByAssignee(userId: string): Promise<WorkflowTask[]> {
    if (!userId) {
      throw new Error(
        "[TaskAnalyticsService.getTasksByAssignee] Invalid userId parameter"
      );
    }

    try {
      return await apiClient.get<WorkflowTask[]>(`/tasks/assignee/${userId}`);
    } catch (error) {
      console.error("[TaskAnalyticsService.getTasksByAssignee] Error:", error);
      return [];
    }
  }
}

export const taskAnalyticsService = new TaskAnalyticsService();
