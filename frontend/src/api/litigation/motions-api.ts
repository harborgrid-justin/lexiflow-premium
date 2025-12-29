/**
 * Motions API Service
 * Manages legal motions in cases
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { Motion, MotionFilters } from '@/types';

export class MotionsApiService {
  private readonly baseUrl = '/motions';

  async getAll(filters?: MotionFilters): Promise<Motion[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Motion[]>(url);
  }

  async getById(id: string): Promise<Motion> {
    return apiClient.get<Motion>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Motion[]> {
    // Use the correct backend endpoint: /motions/case/:caseId
    const result = await apiClient.get<Motion[]>(`${this.baseUrl}/case/${caseId}`);
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  }

  async create(data: Partial<Motion> & { filedBy?: string }): Promise<Motion> {
    // Transform frontend Motion to backend CreateMotionDto
    const createDto: Record<string, unknown> = {
      caseId: data.caseId,
      title: data.title,
      type: data.type, // Should match backend MotionType enum
      status: data.status, // Should match backend MotionStatus enum
      description: (data as Record<string, unknown>).notes || data.description, // Map notes → description for compatibility
      filedBy: data.filedBy,
      filedDate: data.filedDate ? new Date(data.filedDate) : undefined,
      hearingDate: data.hearingDate ? new Date(data.hearingDate) : undefined,
      decisionDate: (data as Record<string, unknown>).decidedDate || data.decisionDate ? new Date((data as Record<string, unknown>).decidedDate || data.decisionDate!) : undefined,
      decision: data.outcome || data.decision, // Backend uses 'decision', frontend uses 'outcome'
      documentId: data.documentId,
      metadata: (data as Record<string, unknown>).metadata,
    };

    // Remove undefined values
    Object.keys(createDto).forEach(key => {
      if (createDto[key] === undefined) {
        delete createDto[key];
      }
    });

    return apiClient.post<Motion>(this.baseUrl, createDto);
  }

  async update(id: string, data: Partial<Motion>): Promise<Motion> {
    return apiClient.put<Motion>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
