/**
 * BillingApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

export class BillingApiService {
  async getTimeEntries(filters?: { caseId?: string; userId?: string; page?: number; limit?: number }): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>('/billing/time-entries', filters);
    return response.data;
  }

  async getTimeEntryById(id: string): Promise<TimeEntry> {
    return apiClient.get<TimeEntry>(`/billing/time-entries/${id}`);
  }

  async addTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>('/billing/time-entries', entry);
  }

  async addBulkTimeEntries(entries: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<TimeEntry[]> {
    return apiClient.post<TimeEntry[]>('/billing/time-entries/bulk', { entries });
  }

  async updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}`, entry);
  }

  async approveTimeEntry(id: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}/approve`, {});
  }

  async billTimeEntry(id: string, invoiceId: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}/bill`, { invoiceId });
  }

  async getUnbilledTimeEntries(caseId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>(`/billing/time-entries/case/${caseId}/unbilled`);
    return response.data;
  }

  async getTimeEntryTotals(caseId: string): Promise<{ total: number; billable: number; unbilled: number }> {
    return apiClient.get<{ total: number; billable: number; unbilled: number }>(`/billing/time-entries/case/${caseId}/totals`);
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await apiClient.delete(`/billing/time-entries/${id}`);
  }
}
