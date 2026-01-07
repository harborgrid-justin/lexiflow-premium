/**
 * Task Relations Service (subtasks, comments, attachments, history)
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type {
  TaskAttachment,
  TaskComment,
  TaskHistory,
  WorkflowTask,
} from "@/types";
import type { CreateTaskDto } from "./types";
import { validateContent, validateId, validateObject } from "./utils";

export class TaskRelationsService {
  private readonly baseUrl = "/tasks";

  // Subtasks
  async getSubtasks(parentId: string): Promise<WorkflowTask[]> {
    validateId(parentId, "getSubtasks");
    try {
      return await apiClient.get<WorkflowTask[]>(
        `${this.baseUrl}/${parentId}/subtasks`
      );
    } catch (error) {
      console.error("[TaskRelationsService.getSubtasks] Error:", error);
      throw new Error(`Failed to fetch subtasks for task: ${parentId}`);
    }
  }

  async addSubtask(
    parentId: string,
    subtaskData: CreateTaskDto
  ): Promise<WorkflowTask> {
    validateId(parentId, "addSubtask");
    validateObject(subtaskData, "subtaskData", "addSubtask");
    try {
      return await apiClient.post<WorkflowTask>(
        `${this.baseUrl}/${parentId}/subtasks`,
        subtaskData
      );
    } catch (error) {
      console.error("[TaskRelationsService.addSubtask] Error:", error);
      throw new Error(`Failed to add subtask to task: ${parentId}`);
    }
  }

  // Comments
  async getComments(taskId: string): Promise<TaskComment[]> {
    validateId(taskId, "getComments");
    try {
      return await apiClient.get<TaskComment[]>(
        `${this.baseUrl}/${taskId}/comments`
      );
    } catch (error) {
      console.error("[TaskRelationsService.getComments] Error:", error);
      throw new Error(`Failed to fetch comments for task: ${taskId}`);
    }
  }

  async addComment(taskId: string, content: string): Promise<TaskComment> {
    validateId(taskId, "addComment");
    validateContent(content, "addComment");
    try {
      return await apiClient.post<TaskComment>(
        `${this.baseUrl}/${taskId}/comments`,
        { content }
      );
    } catch (error) {
      console.error("[TaskRelationsService.addComment] Error:", error);
      throw new Error(`Failed to add comment to task: ${taskId}`);
    }
  }

  // Attachments
  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    validateId(taskId, "getAttachments");
    try {
      return await apiClient.get<TaskAttachment[]>(
        `${this.baseUrl}/${taskId}/attachments`
      );
    } catch (error) {
      console.error("[TaskRelationsService.getAttachments] Error:", error);
      throw new Error(`Failed to fetch attachments for task: ${taskId}`);
    }
  }

  async uploadAttachment(taskId: string, file: File): Promise<TaskAttachment> {
    validateId(taskId, "uploadAttachment");
    if (!file || !(file instanceof File)) {
      throw new Error(
        "[TaskRelationsService.uploadAttachment] file is required"
      );
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      return await apiClient.post<TaskAttachment>(
        `${this.baseUrl}/${taskId}/attachments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    } catch (error) {
      console.error("[TaskRelationsService.uploadAttachment] Error:", error);
      throw new Error(`Failed to upload attachment to task: ${taskId}`);
    }
  }

  // History
  async getHistory(taskId: string): Promise<TaskHistory[]> {
    validateId(taskId, "getHistory");
    try {
      return await apiClient.get<TaskHistory[]>(
        `${this.baseUrl}/${taskId}/history`
      );
    } catch (error) {
      console.error("[TaskRelationsService.getHistory] Error:", error);
      throw new Error(`Failed to fetch history for task: ${taskId}`);
    }
  }
}

export const taskRelationsService = new TaskRelationsService();
