/**
 * Docket Service
 * Handles court docket entries, deadlines, and calendar management
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface DocketEntry {
  id: string;
  caseId: string;
  entryNumber: number;
  entryDate: Date;
  filingDate?: Date;
  docketText: string;
  documentNumber?: string;
  documentDescription?: string;
  filedBy?: string;
  documentIds?: string[];
  isSealed: boolean;
  pageCount?: number;
  attachments?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourtDeadline {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  deadlineDate: Date;
  deadlineType: 'filing' | 'discovery' | 'motion' | 'hearing' | 'trial' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'completed' | 'missed' | 'extended';
  responsibleAttorneyId?: string;
  responsibleAttorneyName?: string;
  relatedDocketEntryId?: string;
  notes?: string;
  completedDate?: Date;
  extensionGranted?: boolean;
  newDeadlineDate?: Date;
  reminderDays?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocketEntryRequest {
  caseId: string;
  entryDate: Date;
  filingDate?: Date;
  docketText: string;
  documentNumber?: string;
  documentDescription?: string;
  filedBy?: string;
  isSealed?: boolean;
  pageCount?: number;
  attachments?: number;
}

export interface UpdateDocketEntryRequest {
  entryDate?: Date;
  filingDate?: Date;
  docketText?: string;
  documentNumber?: string;
  documentDescription?: string;
  filedBy?: string;
  isSealed?: boolean;
  pageCount?: number;
  attachments?: number;
}

export interface CreateDeadlineRequest {
  caseId: string;
  title: string;
  description?: string;
  deadlineDate: Date;
  deadlineType: CourtDeadline['deadlineType'];
  priority?: CourtDeadline['priority'];
  responsibleAttorneyId?: string;
  notes?: string;
  reminderDays?: number[];
}

export interface UpdateDeadlineRequest {
  title?: string;
  description?: string;
  deadlineDate?: Date;
  deadlineType?: CourtDeadline['deadlineType'];
  priority?: CourtDeadline['priority'];
  responsibleAttorneyId?: string;
  notes?: string;
  reminderDays?: number[];
}

export interface DocketEntriesListResponse {
  data: DocketEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface DeadlinesListResponse {
  data: CourtDeadline[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get docket entries with filters
 */
export async function getDocketEntries(params?: PaginationParams & {
  caseId?: string;
  search?: string;
  entryDateFrom?: string;
  entryDateTo?: string;
  isSealed?: boolean;
}): Promise<DocketEntriesListResponse> {
  try {
    const response = await apiClient.get<DocketEntriesListResponse>('/docket', {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get docket entries for a specific case
 */
export async function getCaseDocket(caseId: string): Promise<DocketEntry[]> {
  try {
    const response = await apiClient.get<DocketEntry[]>(`/docket/case/${caseId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get docket entry by ID
 */
export async function getDocketEntryById(id: string): Promise<DocketEntry> {
  try {
    const response = await apiClient.get<DocketEntry>(`/docket/${id}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new docket entry
 */
export async function createDocketEntry(data: CreateDocketEntryRequest): Promise<DocketEntry> {
  try {
    const response = await apiClient.post<DocketEntry>('/docket', data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update docket entry
 */
export async function updateDocketEntry(
  id: string,
  data: UpdateDocketEntryRequest
): Promise<DocketEntry> {
  try {
    const response = await apiClient.put<DocketEntry>(`/docket/${id}`, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete docket entry
 */
export async function deleteDocketEntry(id: string): Promise<void> {
  try {
    await apiClient.delete(`/docket/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Import docket from PACER
 */
export async function importFromPacer(caseId: string, pacerCaseId: string): Promise<{
  imported: number;
  errors: string[];
}> {
  try {
    const response = await apiClient.post<{ imported: number; errors: string[] }>(
      '/docket/import/pacer',
      {
        caseId,
        pacerCaseId,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get court deadlines
 */
export async function getDeadlines(params?: PaginationParams & {
  caseId?: string;
  status?: CourtDeadline['status'];
  deadlineType?: CourtDeadline['deadlineType'];
  priority?: CourtDeadline['priority'];
  responsibleAttorneyId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<DeadlinesListResponse> {
  try {
    const response = await apiClient.get<DeadlinesListResponse>('/docket/deadlines', {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get upcoming deadlines
 */
export async function getUpcomingDeadlines(days: number = 30): Promise<CourtDeadline[]> {
  try {
    const response = await apiClient.get<CourtDeadline[]>('/docket/deadlines/upcoming', {
      params: { days },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get deadline by ID
 */
export async function getDeadlineById(id: string): Promise<CourtDeadline> {
  try {
    const response = await apiClient.get<CourtDeadline>(`/docket/deadlines/${id}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new deadline
 */
export async function createDeadline(data: CreateDeadlineRequest): Promise<CourtDeadline> {
  try {
    const response = await apiClient.post<CourtDeadline>('/docket/deadlines', data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update deadline
 */
export async function updateDeadline(
  id: string,
  data: UpdateDeadlineRequest
): Promise<CourtDeadline> {
  try {
    const response = await apiClient.put<CourtDeadline>(`/docket/deadlines/${id}`, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete deadline
 */
export async function deleteDeadline(id: string): Promise<void> {
  try {
    await apiClient.delete(`/docket/deadlines/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Mark deadline as completed
 */
export async function completeDeadline(id: string, completedDate?: Date): Promise<CourtDeadline> {
  try {
    const response = await apiClient.post<CourtDeadline>(`/docket/deadlines/${id}/complete`, {
      completedDate: completedDate || new Date(),
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Request deadline extension
 */
export async function requestExtension(
  id: string,
  newDeadlineDate: Date,
  reason: string
): Promise<CourtDeadline> {
  try {
    const response = await apiClient.post<CourtDeadline>(
      `/docket/deadlines/${id}/extend`,
      {
        newDeadlineDate,
        reason,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get deadline calendar view
 */
export async function getDeadlineCalendar(
  startDate: Date,
  endDate: Date
): Promise<CourtDeadline[]> {
  try {
    const response = await apiClient.get<CourtDeadline[]>('/docket/deadlines/calendar', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getDocketEntries,
  getCaseDocket,
  getDocketEntryById,
  createDocketEntry,
  updateDocketEntry,
  deleteDocketEntry,
  importFromPacer,
  getDeadlines,
  getUpcomingDeadlines,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  completeDeadline,
  requestExtension,
  getDeadlineCalendar,
};
