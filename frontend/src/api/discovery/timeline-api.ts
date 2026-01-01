/**
 * Timeline API Service
 * Manages discovery timeline events and deadlines
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { DiscoveryTimelineEvent } from '@/types/discovery-enhanced';

export class TimelineApiService {
  private readonly baseUrl = '/discovery/timeline';

  async getEvents(caseId?: string): Promise<DiscoveryTimelineEvent[]> {
    const params = new URLSearchParams();
    if (caseId) params.append('caseId', caseId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: DiscoveryTimelineEvent[] }>(url);
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<DiscoveryTimelineEvent> {
    return apiClient.get<DiscoveryTimelineEvent>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<DiscoveryTimelineEvent>): Promise<DiscoveryTimelineEvent> {
    return apiClient.post<DiscoveryTimelineEvent>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<DiscoveryTimelineEvent>): Promise<DiscoveryTimelineEvent> {
    return apiClient.put<DiscoveryTimelineEvent>(`${this.baseUrl}/${id}`, data);
  }

  async complete(id: string): Promise<DiscoveryTimelineEvent> {
    return apiClient.post<DiscoveryTimelineEvent>(`${this.baseUrl}/${id}/complete`, {});
  }

  async cancel(id: string): Promise<DiscoveryTimelineEvent> {
    return apiClient.post<DiscoveryTimelineEvent>(`${this.baseUrl}/${id}/cancel`, {});
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const timelineApi = new TimelineApiService();
