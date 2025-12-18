/**
 * Tasks API Service
 * Manages workflow tasks
 */

import { apiClient } from '../apiClient';

export interface Task {
  id: string;
  caseId?: string;
  matterId?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedBy?: string;
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFilters {
  caseId?: string;
  matterId?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
}

export class TasksApiService {
  private readonly baseUrl = '/tasks';

  async getAll(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.matterId) params.append('matterId', filters.matterId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Task[]>(url);
  }

  async getById(id: string): Promise<Task> {
    return apiClient.get<Task>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Task>): Promise<Task> {
    return apiClient.post<Task>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    return apiClient.put<Task>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    return apiClient.patch<Task>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
