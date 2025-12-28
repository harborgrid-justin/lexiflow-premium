/**
 * Legal Holds API Service
 * Manages legal hold notices and preservation obligations
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface LegalHold {
  id: string;
  caseId: string;
  name: string;
  description?: string;
  status: 'active' | 'released' | 'expired';
  effectiveDate: string;
  releaseDate?: string;
  custodians: string[];
  dataTypes: string[];
  preservationInstructions?: string;
  acknowledgments?: {
    custodianId: string;
    acknowledgedAt: string;
    acknowledgedBy: string;
  }[];
  reminders?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextReminderDate: string;
  };
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalHoldFilters {
  caseId?: string;
  status?: LegalHold['status'];
  custodianId?: string;
}

export class LegalHoldsApiService {
  private readonly baseUrl = '/legal-holds';

  async getAll(filters?: LegalHoldFilters): Promise<LegalHold[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.custodianId) params.append('custodianId', filters.custodianId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<{ items: LegalHold[] }>(url);
    // Backend returns paginated response {items, total, page, limit, totalPages}
    return Array.isArray(response) ? response : response.items || [];
  }

  async getById(id: string): Promise<LegalHold> {
    return apiClient.get<LegalHold>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<LegalHold[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<LegalHold>): Promise<LegalHold> {
    return apiClient.post<LegalHold>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<LegalHold>): Promise<LegalHold> {
    return apiClient.put<LegalHold>(`${this.baseUrl}/${id}`, data);
  }

  async release(id: string): Promise<LegalHold> {
    return apiClient.post<LegalHold>(`${this.baseUrl}/${id}/release`, {});
  }

  async sendReminder(id: string, custodianIds?: string[]): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${id}/remind`, { custodianIds });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
