/**
 * Consolidated Time Entries API Service
 * Merges duplicate implementations from billing-api.ts, apiServicesAdditional.ts, and apiServicesFinal.ts
 * 100% backend endpoint coverage (13/13 endpoints)
 */

import { apiClient, type PaginatedResponse } from '../../infrastructure/apiClient';
import type { TimeEntry } from '../../../types';

export interface TimeEntryFilters {
  caseId?: string;
  userId?: string;
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Billed';
  billable?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface TimeEntryTotals {
  total: number;
  billable: number;
  unbilled: number;
  hours: number;
}

export interface CreateTimeEntryDto {
  caseId: string;
  userId: string;
  date: string;
  hours: number;
  rate: number;
  description: string;
  billable: boolean;
  status?: 'Draft' | 'Submitted';
  taskCode?: string;
  activityType?: string;
}

export interface UpdateTimeEntryDto extends Partial<CreateTimeEntryDto> {}

export interface BulkTimeEntryDto {
  entries: CreateTimeEntryDto[];
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: { index: number; error: string }[];
}

export class TimeEntriesApiService {
  /**
   * Get all time entries with optional filters
   * GET /api/v1/billing/time-entries
   */
  async getAll(filters?: TimeEntryFilters): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>('/billing/time-entries', filters);
    return response.data;
  }

  /**
   * Get time entry by ID
   * GET /api/v1/billing/time-entries/:id
   */
  async getById(id: string): Promise<TimeEntry> {
    return apiClient.get<TimeEntry>(`/billing/time-entries/${id}`);
  }

  /**
   * Get unbilled time entries for a case
   * GET /api/v1/billing/time-entries/case/:caseId/unbilled
   */
  async getUnbilledByCase(caseId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>(`/billing/time-entries/case/${caseId}/unbilled`);
    return response.data;
  }

  /**
   * Get time entry totals for a case
   * GET /api/v1/billing/time-entries/case/:caseId/totals
   */
  async getTotalsByCase(caseId: string): Promise<TimeEntryTotals> {
    return apiClient.get<TimeEntryTotals>(`/billing/time-entries/case/${caseId}/totals`);
  }

  /**
   * Create a new time entry
   * POST /api/v1/billing/time-entries
   */
  async create(entry: CreateTimeEntryDto): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>('/billing/time-entries', entry);
  }

  /**
   * Create multiple time entries at once
   * POST /api/v1/billing/time-entries/bulk
   */
  async createBulk(dto: BulkTimeEntryDto): Promise<BulkOperationResult> {
    return apiClient.post<BulkOperationResult>('/billing/time-entries/bulk', dto);
  }

  /**
   * Update a time entry
   * PUT /api/v1/billing/time-entries/:id
   */
  async update(id: string, entry: UpdateTimeEntryDto): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}`, entry);
  }

  /**
   * Approve a time entry (change status to 'Approved')
   * PUT /api/v1/billing/time-entries/:id/approve
   */
  async approve(id: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}/approve`, {});
  }

  /**
   * Mark a time entry as billed
   * PUT /api/v1/billing/time-entries/:id/bill
   */
  async bill(id: string, invoiceId: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/billing/time-entries/${id}/bill`, { invoiceId });
  }

  /**
   * Bulk approve time entries
   * POST /api/v1/billing/time-entries/bulk-approve
   */
  async approveBulk(ids: string[]): Promise<BulkOperationResult> {
    return apiClient.post<BulkOperationResult>('/billing/time-entries/bulk-approve', { ids });
  }

  /**
   * Bulk bill time entries
   * POST /api/v1/billing/time-entries/bulk-bill
   */
  async billBulk(ids: string[], invoiceId: string): Promise<BulkOperationResult> {
    return apiClient.post<BulkOperationResult>('/billing/time-entries/bulk-bill', { ids, invoiceId });
  }

  /**
   * Delete a time entry
   * DELETE /api/v1/billing/time-entries/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/time-entries/${id}`);
  }

  /**
   * Bulk delete time entries
   * POST /api/v1/billing/time-entries/bulk-delete
   */
  async deleteBulk(ids: string[]): Promise<BulkOperationResult> {
    return apiClient.post<BulkOperationResult>('/billing/time-entries/bulk-delete', { ids });
  }
}
