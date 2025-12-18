/**
 * War Room API Service
 * Trial war room collaboration
 */

import { apiClient } from '../apiClient';

export interface WarRoom {
  id: string;
  caseId: string;
  trialId?: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  members?: string[];
  notes?: {
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }[];
  documents?: string[];
  tasks?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class WarRoomApiService {
  private readonly baseUrl = '/war-room';

  async getAll(filters?: { caseId?: string; status?: WarRoom['status'] }): Promise<WarRoom[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<WarRoom[]>(url);
  }

  async getById(id: string): Promise<WarRoom> {
    return apiClient.get<WarRoom>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<WarRoom>): Promise<WarRoom> {
    return apiClient.post<WarRoom>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<WarRoom>): Promise<WarRoom> {
    return apiClient.put<WarRoom>(`${this.baseUrl}/${id}`, data);
  }

  async addNote(id: string, note: { content: string }): Promise<WarRoom> {
    return apiClient.post<WarRoom>(`${this.baseUrl}/${id}/notes`, note);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
