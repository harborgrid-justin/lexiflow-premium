/**
 * Task CRUD Service
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { CreateTaskDto, UpdateTaskDto, WorkflowTask } from "./types";

export class TaskCrudService {
  /**
   * Get all tasks with optional filters
   */
  async getTasks(filters?: Record<string, unknown>): Promise<WorkflowTask[]> {
    try {
      return await apiClient.get<WorkflowTask[]>("/tasks", filters);
    } catch (error) {
      console.error("[TaskCrudService.getTasks] Error:", error);
      throw new Error("Failed to fetch tasks");
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<WorkflowTask> {
    if (!id) {
      throw new Error("[TaskCrudService.getTaskById] Invalid id parameter");
    }

    try {
      return await apiClient.get<WorkflowTask>(`/tasks/${id}`);
    } catch (error) {
      console.error("[TaskCrudService.getTaskById] Error:", error);
      throw new Error(`Failed to fetch task with id: ${id}`);
    }
  }

  /**
   * Create a new task
   */
  async createTask(dto: CreateTaskDto): Promise<WorkflowTask> {
    if (!dto.title) {
      throw new Error("[TaskCrudService.createTask] Title is required");
    }

    try {
      return await apiClient.post<WorkflowTask>("/tasks", dto);
    } catch (error) {
      console.error("[TaskCrudService.createTask] Error:", error);
      throw new Error("Failed to create task");
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, dto: UpdateTaskDto): Promise<WorkflowTask> {
    if (!id) {
      throw new Error("[TaskCrudService.updateTask] Invalid id parameter");
    }

    try {
      return await apiClient.put<WorkflowTask>(`/tasks/${id}`, dto);
    } catch (error) {
      console.error("[TaskCrudService.updateTask] Error:", error);
      throw new Error(`Failed to update task with id: ${id}`);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    if (!id) {
      throw new Error("[TaskCrudService.deleteTask] Invalid id parameter");
    }

    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch (error) {
      console.error("[TaskCrudService.deleteTask] Error:", error);
      throw new Error(`Failed to delete task with id: ${id}`);
    }
  }

  /**
   * Complete a task
   */
  async completeTask(id: string): Promise<WorkflowTask> {
    if (!id) {
      throw new Error("[TaskCrudService.completeTask] Invalid id parameter");
    }

    try {
      return await apiClient.post<WorkflowTask>(`/tasks/${id}/complete`, {});
    } catch (error) {
      console.error("[TaskCrudService.completeTask] Error:", error);
      throw new Error(`Failed to complete task with id: ${id}`);
    }
  }
}

export const taskCrudService = new TaskCrudService();
