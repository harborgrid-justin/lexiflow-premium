/**
 * Review API Service
 * Manages document review and coding operations
 */

import { apiClient } from '@/services/infrastructure/apiClient';

import type { ReviewDocument, ReviewQueue, AdvancedSearchQuery, DocumentCoding } from '@/types/discovery-enhanced';

export class ReviewApiService {
  private readonly baseUrl = '/discovery/review';

  async getDocuments(filters?: Partial<AdvancedSearchQuery>): Promise<ReviewDocument[]> {
    const response = await apiClient.post<{ items: ReviewDocument[] }>(`${this.baseUrl}/search`, filters);
    return Array.isArray(response) ? response : response.items || [];
  }

  async getDocumentById(id: string): Promise<ReviewDocument> {
    return apiClient.get<ReviewDocument>(`${this.baseUrl}/documents/${id}`);
  }

  async updateCoding(documentId: string, coding: DocumentCoding, notes?: string): Promise<ReviewDocument> {
    return apiClient.put<ReviewDocument>(`${this.baseUrl}/documents/${documentId}/coding`, {
      coding,
      notes
    });
  }

  async getQueues(caseId?: string): Promise<ReviewQueue[]> {
    const params = new URLSearchParams();
    if (caseId) params.append('caseId', caseId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/queues?${queryString}` : `${this.baseUrl}/queues`;
    const response = await apiClient.get<{ items: ReviewQueue[] }>(url);
    return Array.isArray(response) ? response : response.items || [];
  }

  async createQueue(data: Partial<ReviewQueue>): Promise<ReviewQueue> {
    return apiClient.post<ReviewQueue>(`${this.baseUrl}/queues`, data);
  }

  async assignReviewer(queueId: string, reviewerId: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/queues/${queueId}/assign`, { reviewerId });
  }
}

export const reviewApi = new ReviewApiService();
