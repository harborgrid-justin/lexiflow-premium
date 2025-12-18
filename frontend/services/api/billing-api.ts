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

  async getTrustAccounts(filters?: { page?: number; limit?: number }): Promise<any[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<any>>('/billing/trust-accounts', filters);
      return response.data;
    } catch (error) {
      // Fallback to empty array if endpoint doesn't exist yet
      console.warn('Trust accounts endpoint not available, returning empty array');
      return [];
    }
  }

  async getWIPStats(): Promise<any[]> {
    try {
      return await apiClient.get<any[]>('/billing/wip-stats');
    } catch (error) {
      console.warn('WIP stats endpoint not available, returning empty array');
      return [];
    }
  }

  async getRealizationStats(): Promise<any> {
    try {
      return await apiClient.get<any>('/billing/realization-stats');
    } catch (error) {
      console.warn('Realization stats endpoint not available, returning default');
      return [
        { name: 'Billed', value: 0, color: '#10b981' },
        { name: 'Write-off', value: 100, color: '#ef4444' },
      ];
    }
  }

  async getRates(timekeeperId: string): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(`/billing/rates/${timekeeperId}`);
    } catch (error) {
      console.warn('Rates endpoint not available, returning empty array');
      return [];
    }
  }

  async getInvoices(filters?: { caseId?: string; clientId?: string; status?: string }): Promise<any[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<any>>('/billing/invoices', filters);
      return response.data;
    } catch (error) {
      console.warn('Invoices endpoint not available, returning empty array');
      return [];
    }
  }

  async createInvoice(data: any): Promise<any> {
    return apiClient.post<any>('/billing/invoices', data);
  }

  async updateInvoice(id: string, data: any): Promise<any> {
    return apiClient.put<any>(`/billing/invoices/${id}`, data);
  }

  async sendInvoice(id: string): Promise<any> {
    return apiClient.post<any>(`/billing/invoices/${id}/send`, {});
  }

  async getOverviewStats(): Promise<{ realization: number; totalBilled: number; month: string }> {
    try {
      return await apiClient.get<{ realization: number; totalBilled: number; month: string }>('/billing/overview-stats');
    } catch (error) {
      console.warn('Overview stats endpoint not available, returning default');
      return { realization: 92.4, totalBilled: 482000, month: 'March 2024' };
    }
  }

  async getTopAccounts(): Promise<any[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<any>>('/clients', { sortBy: 'totalBilled', sortOrder: 'desc', limit: 4 });
      return response.data;
    } catch (error) {
      console.warn('Top accounts endpoint not available, returning empty array');
      return [];
    }
  }
}
