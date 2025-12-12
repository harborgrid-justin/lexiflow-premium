/**
 * Cases Service
 * Handles case management CRUD operations, search, and filters
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type {
  CaseListResponse,
  CaseItem,
  CaseDetailsResponse,
  CreateCaseRequest,
  UpdateCaseRequest,
  PaginationParams,
  CaseStatus,
} from '../../types/api';

export interface CaseFilters extends PaginationParams {
  status?: CaseStatus;
  clientId?: string;
  assignedAttorneyId?: string;
  caseType?: string;
  priority?: string;
  search?: string;
  filingDateFrom?: string;
  filingDateTo?: string;
}

/**
 * Get list of cases with optional filters
 */
export async function getCases(filters?: CaseFilters): Promise<CaseListResponse> {
  try {
    const response = await apiClient.get<CaseListResponse>(API_ENDPOINTS.CASES.BASE, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case by ID
 */
export async function getCaseById(id: string): Promise<CaseDetailsResponse> {
  try {
    const response = await apiClient.get<CaseDetailsResponse>(
      API_ENDPOINTS.CASES.BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new case
 */
export async function createCase(data: CreateCaseRequest): Promise<CaseItem> {
  try {
    const response = await apiClient.post<CaseItem>(API_ENDPOINTS.CASES.BASE, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update existing case
 */
export async function updateCase(id: string, data: UpdateCaseRequest): Promise<CaseItem> {
  try {
    const response = await apiClient.put<CaseItem>(
      API_ENDPOINTS.CASES.BY_ID(id),
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete case
 */
export async function deleteCase(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.CASES.BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Search cases with full-text search
 */
export async function searchCases(query: string, filters?: CaseFilters): Promise<CaseListResponse> {
  try {
    const response = await apiClient.get<CaseListResponse>(API_ENDPOINTS.CASES.SEARCH, {
      params: { query, ...filters },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case statistics
 */
export async function getCaseStatistics(): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CASES.STATISTICS);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case timeline
 */
export async function getCaseTimeline(caseId: string): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CASES.TIMELINE(caseId));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case parties
 */
export async function getCaseParties(caseId: string): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CASES.PARTIES(caseId));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Add party to case
 */
export async function addCaseParty(caseId: string, party: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.CASES.PARTIES(caseId), party);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case team members
 */
export async function getCaseTeam(caseId: string): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CASES.TEAM(caseId));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Add team member to case
 */
export async function addCaseTeamMember(caseId: string, member: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.CASES.TEAM(caseId), member);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Remove team member from case
 */
export async function removeCaseTeamMember(caseId: string, memberId: string): Promise<void> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.CASES.TEAM(caseId)}/${memberId}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get case phases
 */
export async function getCasePhases(caseId: string): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CASES.PHASES(caseId));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Link cases together
 */
export async function linkCases(caseId: string, linkedCaseId: string, relationship: string): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.CASES.LINK_CASE(caseId), {
      linkedCaseId,
      relationship,
    });
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Export case data
 */
export async function exportCase(caseId: string, format: 'pdf' | 'excel' | 'json' = 'pdf'): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CASES.EXPORT(caseId), {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  searchCases,
  getCaseStatistics,
  getCaseTimeline,
  getCaseParties,
  addCaseParty,
  getCaseTeam,
  addCaseTeamMember,
  removeCaseTeamMember,
  getCasePhases,
  linkCases,
  exportCase,
};
