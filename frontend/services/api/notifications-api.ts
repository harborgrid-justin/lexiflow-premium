/**
 * NotificationsApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

export class NotificationsApiService {
  async getAll(filters?: { read?: boolean; type?: string }): Promise<Notification[]> {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', filters);
    return response.data;
  }

  async getById(id: string): Promise<Notification> {
    return apiClient.get<Notification>(`/notifications/${id}`);
  }

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${id}/read`, { read: true });
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/mark-all-read', {});
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  }
}
