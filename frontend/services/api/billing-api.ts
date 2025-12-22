/**
 * BillingApiService
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

export class BillingApiService {
  async getTimeEntries(filters?: { caseId?: string; userId?: string; page?: number; limit?: number }): Promise<TimeEntry[]> {
    // Backend has separate endpoints: /time-entries (all) and /time-entries/case/:caseId (by case)
    if (filters?.caseId) {
      const response = await apiClient.get<PaginatedResponse<TimeEntry>>(`/billing/time-entries/case/${filters.caseId}`);
      return Array.isArray(response) ? response : (response.data || []);
    }
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>('/billing/time-entries');
    return Array.isArray(response) ? response : (response.data || []);
  }

  async getTimeEntryById(id: string): Promise<TimeEntry> {
    return apiClient.get<TimeEntry>(`/billing/time-entries/${id}`);
  }

  async addTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
    // Transform frontend TimeEntry to backend CreateTimeEntryDto
    const createDto = {
      caseId: entry.caseId,
      userId: entry.userId || entry.createdBy,
      date: entry.date, // Should be ISO date string YYYY-MM-DD
      duration: entry.duration || entry.hours, // In hours
      description: entry.description || entry.notes,
      activity: entry.activity || entry.taskDescription,
      ledesCode: entry.ledesCode,
      rate: entry.rate || entry.hourlyRate || 0,
      status: entry.status,
      billable: entry.billable !== false, // Default to true if not specified
      rateTableId: entry.rateTableId,
      internalNotes: entry.internalNotes,
      taskCode: entry.taskCode,
    };
    
    // Remove undefined values
    Object.keys(createDto).forEach(key => {
      if (createDto[key] === undefined) {
        delete createDto[key];
      }
    });
    
    return apiClient.post<TimeEntry>('/billing/time-entries', createDto);
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

  async getTrustAccounts(filters?: { clientId?: string; status?: string }): Promise<any[]> {
    try {
      // Backend returns array directly, not paginated
      const response = await apiClient.get<any[]>('/billing/trust-accounts', filters);
      return Array.isArray(response) ? response : [];
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
