/**
 * Task Bulk Operations Service
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { TaskBulkOperationResult } from "@/types";
import { validateArray, validateId } from "./utils";

export class TaskBulkService {
  private readonly baseUrl = "/tasks";

  async bulkUpdateStatus(
    taskIds: string[],
    status: string
  ): Promise<TaskBulkOperationResult> {
    validateArray(taskIds, "bulkUpdateStatus");
    if (!status) {
      throw new Error("[TaskBulkService.bulkUpdateStatus] status is required");
    }
    try {
      return await apiClient.post<TaskBulkOperationResult>(
        `${this.baseUrl}/bulk/status`,
        { taskIds, status }
      );
    } catch (error) {
      console.error("[TaskBulkService.bulkUpdateStatus] Error:", error);
      throw new Error("Failed to bulk update task status");
    }
  }

  async bulkAssign(
    taskIds: string[],
    assignedTo: string
  ): Promise<TaskBulkOperationResult> {
    validateArray(taskIds, "bulkAssign");
    validateId(assignedTo, "bulkAssign");
    try {
      return await apiClient.post<TaskBulkOperationResult>(
        `${this.baseUrl}/bulk/assign`,
        { taskIds, assignedTo }
      );
    } catch (error) {
      console.error("[TaskBulkService.bulkAssign] Error:", error);
      throw new Error("Failed to bulk assign tasks");
    }
  }

  async bulkDelete(taskIds: string[]): Promise<TaskBulkOperationResult> {
    validateArray(taskIds, "bulkDelete");
    try {
      return await apiClient.post<TaskBulkOperationResult>(
        `${this.baseUrl}/bulk/delete`,
        { taskIds }
      );
    } catch (error) {
      console.error("[TaskBulkService.bulkDelete] Error:", error);
      throw new Error("Failed to bulk delete tasks");
    }
  }
}

export const taskBulkService = new TaskBulkService();
