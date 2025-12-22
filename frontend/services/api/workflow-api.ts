/**
 * Workflow API Service
 * Manages workflow templates and automation
 */

import { apiClient } from '../infrastructure/apiClient';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  trigger?: {
    type: 'manual' | 'event' | 'scheduled';
    event?: string;
    schedule?: string;
  };
  steps: {
    id: string;
    name: string;
    type: 'task' | 'approval' | 'notification' | 'automation';
    order: number;
    config?: Record<string, any>;
    assignee?: string;
    dependencies?: string[];
  }[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  caseId?: string;
  matterId?: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  startedAt: string;
  completedAt?: string;
  progress?: number;
  variables?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WorkflowFilters {
  status?: WorkflowTemplate['status'];
  category?: string;
}

export class WorkflowApiService {
  private readonly baseUrl = '/workflow';

  async getTemplates(filters?: WorkflowFilters): Promise<WorkflowTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/templates?${queryString}` : `${this.baseUrl}/templates`;
    return apiClient.get<WorkflowTemplate[]>(url);
  }

  async getTemplateById(id: string): Promise<WorkflowTemplate> {
    return apiClient.get<WorkflowTemplate>(`${this.baseUrl}/templates/${id}`);
  }

  async createTemplate(data: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    return apiClient.post<WorkflowTemplate>(`${this.baseUrl}/templates`, data);
  }

  async updateTemplate(id: string, data: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    return apiClient.put<WorkflowTemplate>(`${this.baseUrl}/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/templates/${id}`);
  }

  async getInstances(filters?: { status?: WorkflowInstance['status']; caseId?: string }): Promise<WorkflowInstance[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.caseId) params.append('caseId', filters.caseId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/instances?${queryString}` : `${this.baseUrl}/instances`;
    return apiClient.get<WorkflowInstance[]>(url);
  }

  async getInstanceById(id: string): Promise<WorkflowInstance> {
    return apiClient.get<WorkflowInstance>(`${this.baseUrl}/instances/${id}`);
  }

  async startWorkflow(templateId: string, context: Record<string, any>): Promise<WorkflowInstance> {
    return apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances`, { templateId, ...context });
  }

  async pauseWorkflow(id: string): Promise<WorkflowInstance> {
    return apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances/${id}/pause`, {});
  }

  async resumeWorkflow(id: string): Promise<WorkflowInstance> {
    return apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances/${id}/resume`, {});
  }

  async cancelWorkflow(id: string): Promise<WorkflowInstance> {
    return apiClient.post<WorkflowInstance>(`${this.baseUrl}/instances/${id}/cancel`, {});
  }

  async syncEngine(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/sync`, {});
  }
}
