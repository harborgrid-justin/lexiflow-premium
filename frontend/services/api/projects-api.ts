/**
 * Projects API Service
 * Manages legal projects and matters
 */

import { apiClient } from '../apiClient';

export interface Project {
  id: string;
  name: string;
  description?: string;
  projectType: 'litigation' | 'transaction' | 'advisory' | 'compliance' | 'research';
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  clientId?: string;
  leadAttorney?: string;
  teamMembers?: string[];
  startDate?: string;
  endDate?: string;
  estimatedBudget?: number;
  actualCost?: number;
  milestones?: {
    id: string;
    name: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed';
    progress?: number;
  }[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFilters {
  status?: Project['status'];
  projectType?: Project['projectType'];
  clientId?: string;
  leadAttorney?: string;
}

export class ProjectsApiService {
  private readonly baseUrl = '/projects';

  async getAll(filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.projectType) params.append('projectType', filters.projectType);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.leadAttorney) params.append('leadAttorney', filters.leadAttorney);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Project[]>(url);
  }

  async getById(id: string): Promise<Project> {
    return apiClient.get<Project>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Project>): Promise<Project> {
    return apiClient.post<Project>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    return apiClient.put<Project>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Project['status']): Promise<Project> {
    return apiClient.patch<Project>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
