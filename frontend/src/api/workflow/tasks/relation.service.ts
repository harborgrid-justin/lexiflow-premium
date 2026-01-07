/**
 * Task Assignment and Relationship Service
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type {
  TaskAssignmentDto,
  TaskRelationshipDto,
  WorkflowTask,
} from "./types";

export class TaskRelationService {
  /**
   * Assign task to user
   */
  async assignTask(id: string, dto: TaskAssignmentDto): Promise<WorkflowTask> {
    if (!id) {
      throw new Error("[TaskRelationService.assignTask] Invalid id parameter");
    }

    try {
      return await apiClient.post<WorkflowTask>(`/tasks/${id}/assign`, dto);
    } catch (error) {
      console.error("[TaskRelationService.assignTask] Error:", error);
      throw new Error(`Failed to assign task with id: ${id}`);
    }
  }

  /**
   * Get subtasks
   */
  async getSubtasks(parentId: string): Promise<WorkflowTask[]> {
    if (!parentId) {
      throw new Error(
        "[TaskRelationService.getSubtasks] Invalid parentId parameter"
      );
    }

    try {
      return await apiClient.get<WorkflowTask[]>(`/tasks/${parentId}/subtasks`);
    } catch (error) {
      console.error("[TaskRelationService.getSubtasks] Error:", error);
      return [];
    }
  }

  /**
   * Create task relationship
   */
  async createRelationship(
    id: string,
    dto: TaskRelationshipDto
  ): Promise<void> {
    if (!id) {
      throw new Error(
        "[TaskRelationService.createRelationship] Invalid id parameter"
      );
    }

    try {
      await apiClient.post(`/tasks/${id}/relationships`, dto);
    } catch (error) {
      console.error("[TaskRelationService.createRelationship] Error:", error);
      throw new Error("Failed to create task relationship");
    }
  }
}

export const taskRelationService = new TaskRelationService();
