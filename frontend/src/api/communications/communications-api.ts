/**
 * Communications API Service
 * Manages communications (emails, calls, messages) related to cases
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface Communication {
  id: string;
  caseId?: string;
  matterId?: string;
  clientId?: string;
  type: 'email' | 'phone' | 'meeting' | 'letter' | 'sms' | 'video_call' | 'instant_message';
  direction: 'inbound' | 'outbound';
  subject?: string;
  body?: string;
  participants: {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }[];
  timestamp: string;
  duration?: number; // in minutes
  attachments?: string[];
  status?: 'sent' | 'received' | 'failed' | 'pending';
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunicationFilters {
  caseId?: string;
  matterId?: string;
  clientId?: string;
  type?: Communication['type'];
  direction?: Communication['direction'];
  startDate?: string;
  endDate?: string;
}

export class CommunicationsApiService {
  private readonly baseUrl = '/communications';

  async getAll(filters?: CommunicationFilters): Promise<Communication[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.matterId) params.append('matterId', filters.matterId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.direction) params.append('direction', filters.direction);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Communication[]>(url);
  }

  async getById(id: string): Promise<Communication> {
    return apiClient.get<Communication>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Communication>): Promise<Communication> {
    return apiClient.post<Communication>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Communication>): Promise<Communication> {
    return apiClient.put<Communication>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
