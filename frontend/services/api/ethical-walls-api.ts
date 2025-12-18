/**
 * Ethical Walls API Service
 * Ethical wall and information barrier management
 */

import { apiClient } from '../apiClient';

export interface EthicalWall {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending_approval';
  reason: string;
  affectedUsers: string[];
  affectedCases: string[];
  restrictedResources: {
    type: 'case' | 'document' | 'client' | 'matter';
    id: string;
  }[];
  startDate: string;
  endDate?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EthicalWallFilters {
  status?: EthicalWall['status'];
  userId?: string;
  caseId?: string;
}

export class EthicalWallsApiService {
  private readonly baseUrl = '/ethical-walls';

  async getAll(filters?: EthicalWallFilters): Promise<EthicalWall[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.caseId) params.append('caseId', filters.caseId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<EthicalWall[]>(url);
  }

  async getById(id: string): Promise<EthicalWall> {
    return apiClient.get<EthicalWall>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<EthicalWall>): Promise<EthicalWall> {
    return apiClient.post<EthicalWall>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<EthicalWall>): Promise<EthicalWall> {
    return apiClient.put<EthicalWall>(`${this.baseUrl}/${id}`, data);
  }

  async approve(id: string): Promise<EthicalWall> {
    return apiClient.post<EthicalWall>(`${this.baseUrl}/${id}/approve`, {});
  }

  async checkAccess(userId: string, resourceType: string, resourceId: string): Promise<{ allowed: boolean; reason?: string }> {
    return apiClient.post(`${this.baseUrl}/check-access`, { userId, resourceType, resourceId });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
