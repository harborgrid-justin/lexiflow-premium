/**
 * Tasks API Service
 * ALIGNED WITH BACKEND: backend/src/tasks/tasks.controller.ts
 * Manages workflow tasks
 */

import { apiClient } from '../infrastructure/apiClient';
import type { WorkflowTask, TaskStatusBackend, TaskPriorityBackend } from '../../types';

// DTOs matching backend tasks/dto/create-task.dto.ts
export interface CreateTaskDto {
  title: string;
  description?: string;
  status: TaskStatusBackend;
  priority: TaskPriorityBackend;
  dueDate?: string;
  caseId?: string;
  assignedTo?: string;
  parentTaskId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
  createdBy?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatusBackend;
  priority?: TaskPriorityBackend;
  dueDate?: string;
  caseId?: string;
  assignedTo?: string;
  parentTaskId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
}

export interface TaskFilters {
  caseId?: string;
  status?: TaskStatusBackend;
  priority?: TaskPriorityBackend;
  assignedTo?: string;
}

export class TasksApiService {
  private readonly baseUrl = '/tasks';

  // Backend: GET /tasks with query params
  async getAll(filters?: TaskFilters): Promise<WorkflowTask[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<WorkflowTask[]>(url);
  }

  // Backend: GET /tasks/:id
  async getById(id: string): Promise<WorkflowTask> {
    return apiClient.get<WorkflowTask>(`${this.baseUrl}/${id}`);
  }

  // Backend: POST /tasks
  async create(data: CreateTaskDto): Promise<WorkflowTask> {
    return apiClient.post<WorkflowTask>(this.baseUrl, data);
  }

  // Backend: PUT /tasks/:id
  async update(id: string, data: UpdateTaskDto): Promise<WorkflowTask> {
    return apiClient.put<WorkflowTask>(`${this.baseUrl}/${id}`, data);
  }

  // Backend: PATCH /tasks/:id (partial update)
  async patch(id: string, data: Partial<UpdateTaskDto>): Promise<WorkflowTask> {
    return apiClient.patch<WorkflowTask>(`${this.baseUrl}/${id}`, data);
  }

  // Backend: DELETE /tasks/:id
  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Convenience methods
  async updateStatus(id: string, status: TaskStatusBackend): Promise<WorkflowTask> {
    return this.patch(id, { status });
  }

  async updateProgress(id: string, completionPercentage: number, actualHours?: number): Promise<WorkflowTask> {
    return this.patch(id, { completionPercentage, actualHours });
  }
}
