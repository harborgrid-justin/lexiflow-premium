/**
 * Time Entries Service
 * Handles billable time tracking and time entry management
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface TimeEntry {
  id: string;
  caseId: string;
  caseName?: string;
  userId: string;
  userName?: string;
  activityType: string;
  description: string;
  date: Date;
  hours: number;
  minutes: number;
  totalMinutes: number;
  rate: number;
  amount: number;
  isBillable: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'invoiced';
  invoiceId?: string;
  notes?: string;
  taskCode?: string;
  utbmsCode?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimeEntryRequest {
  caseId: string;
  activityType: string;
  description: string;
  date: Date;
  hours: number;
  minutes: number;
  rate?: number;
  isBillable?: boolean;
  notes?: string;
  taskCode?: string;
  utbmsCode?: string;
}

export interface UpdateTimeEntryRequest {
  activityType?: string;
  description?: string;
  date?: Date;
  hours?: number;
  minutes?: number;
  rate?: number;
  isBillable?: boolean;
  notes?: string;
  taskCode?: string;
  utbmsCode?: string;
}

export interface TimeEntriesListResponse {
  data: TimeEntry[];
  total: number;
  page: number;
  limit: number;
  totalHours: number;
  totalAmount: number;
}

export interface TimeEntryStatistics {
  totalEntries: number;
  totalHours: number;
  totalAmount: number;
  billableHours: number;
  billableAmount: number;
  nonBillableHours: number;
  byStatus: Record<TimeEntry['status'], { count: number; hours: number; amount: number }>;
  byUser: Array<{ userId: string; userName: string; hours: number; amount: number }>;
  byCase: Array<{ caseId: string; caseName: string; hours: number; amount: number }>;
}

/**
 * Get time entries with filters
 */
export async function getTimeEntries(params?: PaginationParams & {
  caseId?: string;
  userId?: string;
  status?: TimeEntry['status'];
  isBillable?: boolean;
  dateFrom?: string;
  dateTo?: string;
  invoiceId?: string;
  search?: string;
}): Promise<TimeEntriesListResponse> {
  try {
    const response = await apiClient.get<TimeEntriesListResponse>(
      API_ENDPOINTS.BILLING.TIME_ENTRIES,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get time entry by ID
 */
export async function getTimeEntryById(id: string): Promise<TimeEntry> {
  try {
    const response = await apiClient.get<TimeEntry>(
      API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new time entry
 */
export async function createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
  try {
    const response = await apiClient.post<TimeEntry>(
      API_ENDPOINTS.BILLING.TIME_ENTRIES,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update time entry
 */
export async function updateTimeEntry(
  id: string,
  data: UpdateTimeEntryRequest
): Promise<TimeEntry> {
  try {
    const response = await apiClient.put<TimeEntry>(
      API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id),
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete time entry
 */
export async function deleteTimeEntry(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Submit time entry for approval
 */
export async function submitTimeEntry(id: string): Promise<TimeEntry> {
  try {
    const response = await apiClient.post<TimeEntry>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id)}/submit`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Approve time entry
 */
export async function approveTimeEntry(id: string): Promise<TimeEntry> {
  try {
    const response = await apiClient.post<TimeEntry>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id)}/approve`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Reject time entry
 */
export async function rejectTimeEntry(id: string, reason: string): Promise<TimeEntry> {
  try {
    const response = await apiClient.post<TimeEntry>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRY_BY_ID(id)}/reject`,
      { reason }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Bulk create time entries
 */
export async function bulkCreateTimeEntries(
  entries: CreateTimeEntryRequest[]
): Promise<TimeEntry[]> {
  try {
    const response = await apiClient.post<TimeEntry[]>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRIES}/bulk`,
      { entries }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Bulk approve time entries
 */
export async function bulkApproveTimeEntries(ids: string[]): Promise<{ approved: number }> {
  try {
    const response = await apiClient.post<{ approved: number }>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRIES}/bulk-approve`,
      { ids }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get time entry statistics
 */
export async function getTimeEntryStatistics(params?: {
  caseId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TimeEntryStatistics> {
  try {
    const response = await apiClient.get<TimeEntryStatistics>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRIES}/statistics`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get current user's recent time entries
 */
export async function getMyRecentTimeEntries(limit: number = 10): Promise<TimeEntry[]> {
  try {
    const response = await apiClient.get<TimeEntry[]>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRIES}/my-recent`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Start timer for time entry
 */
export async function startTimer(caseId: string, activityType: string): Promise<{
  timerId: string;
  startTime: Date;
}> {
  try {
    const response = await apiClient.post<{ timerId: string; startTime: Date }>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRIES}/timer/start`,
      { caseId, activityType }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Stop timer and create time entry
 */
export async function stopTimer(timerId: string, description: string): Promise<TimeEntry> {
  try {
    const response = await apiClient.post<TimeEntry>(
      `${API_ENDPOINTS.BILLING.TIME_ENTRIES}/timer/stop`,
      { timerId, description }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Export time entries
 */
export async function exportTimeEntries(
  params: {
    caseId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  format: 'csv' | 'excel' | 'pdf' = 'excel'
): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.BILLING.TIME_ENTRIES}/export`,
      {
        params: { ...params, format },
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getTimeEntries,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  submitTimeEntry,
  approveTimeEntry,
  rejectTimeEntry,
  bulkCreateTimeEntries,
  bulkApproveTimeEntries,
  getTimeEntryStatistics,
  getMyRecentTimeEntries,
  startTimer,
  stopTimer,
  exportTimeEntries,
};
