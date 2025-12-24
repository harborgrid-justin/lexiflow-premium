/**
 * Motions API Service
 * Manages legal motions in cases
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface Motion {
  id: string;
  caseId: string;
  type: string;
  title: string;
  status: 'draft' | 'filed' | 'pending' | 'granted' | 'denied' | 'withdrawn';
  filedDate?: string;
  hearingDate?: string;
  decidedDate?: string;
  outcome?: string;
  documentId?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MotionFilters {
  caseId?: string;
  type?: string;
  status?: Motion['status'];
}

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

  async create(data: Partial<Motion>): Promise<Motion> {
    // Transform frontend Motion to backend CreateMotionDto
    const createDto = {
      caseId: data.caseId,
      title: data.title,
      type: data.type, // Should match backend MotionType enum
      status: data.status, // Should match backend MotionStatus enum
      description: data.notes, // Backend uses 'description', frontend may use 'notes'
      filedBy: data.filedBy,
      filedDate: data.filedDate ? new Date(data.filedDate) : undefined,
      hearingDate: data.hearingDate ? new Date(data.hearingDate) : undefined,
      decisionDate: data.decidedDate ? new Date(data.decidedDate) : undefined,
      decision: data.outcome, // Backend uses 'decision', frontend uses 'outcome'
      documentId: data.documentId,
      notes: data.notes,
      metadata: data.metadata,
    };
    
    // Remove undefined values
    Object.keys(createDto).forEach(key => {
      if ((createDto as any)[key] === undefined) {
        delete (createDto as any)[key];
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
