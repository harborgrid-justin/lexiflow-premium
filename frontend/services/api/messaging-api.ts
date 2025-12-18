/**
 * Messaging API Service
 * Internal messaging system
 */

import { apiClient } from '../infrastructure/apiClient';

export interface Message {
  id: string;
  from: string;
  to: string[];
  subject?: string;
  body: string;
  threadId?: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: string[];
  sentAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface MessageFilters {
  threadId?: string;
  read?: boolean;
  priority?: Message['priority'];
}

export class MessagingApiService {
  private readonly baseUrl = '/messaging';

  async getAll(filters?: MessageFilters): Promise<Message[]> {
    const params = new URLSearchParams();
    if (filters?.threadId) params.append('threadId', filters.threadId);
    if (filters?.read !== undefined) params.append('read', String(filters.read));
    if (filters?.priority) params.append('priority', filters.priority);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Message[]>(url);
  }

  async getById(id: string): Promise<Message> {
    return apiClient.get<Message>(`${this.baseUrl}/${id}`);
  }

  async send(data: Partial<Message>): Promise<Message> {
    return apiClient.post<Message>(this.baseUrl, data);
  }

  async markAsRead(id: string): Promise<Message> {
    return apiClient.patch<Message>(`${this.baseUrl}/${id}/read`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
