/**
 * Discovery Service
 * Handles discovery requests, depositions, productions, and ESI management
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type {
  DiscoveryRequestListResponse,
  DiscoveryRequestItem,
  DepositionItem,
  PaginationParams,
} from '../../types/api';

export interface DiscoveryFilters extends PaginationParams {
  caseId?: string;
  requestType?: 'INTERROGATORY' | 'DOCUMENT' | 'ADMISSION' | 'DEPOSITION';
  status?: 'PENDING' | 'IN_PROGRESS' | 'RESPONDED' | 'OVERDUE';
  propoundedBy?: string;
  propoundedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DepositionFilters extends PaginationParams {
  caseId?: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  witnessName?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * DISCOVERY REQUESTS
 */

/**
 * Get list of discovery requests
 */
export async function getDiscoveryRequests(
  filters?: DiscoveryFilters
): Promise<DiscoveryRequestListResponse> {
  try {
    const response = await apiClient.get<DiscoveryRequestListResponse>(
      API_ENDPOINTS.DISCOVERY.REQUESTS,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get discovery request by ID
 */
export async function getDiscoveryRequestById(id: string): Promise<DiscoveryRequestItem> {
  try {
    const response = await apiClient.get<DiscoveryRequestItem>(
      API_ENDPOINTS.DISCOVERY.REQUEST_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create discovery request
 */
export async function createDiscoveryRequest(data: any): Promise<DiscoveryRequestItem> {
  try {
    const response = await apiClient.post<DiscoveryRequestItem>(
      API_ENDPOINTS.DISCOVERY.REQUESTS,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update discovery request
 */
export async function updateDiscoveryRequest(
  id: string,
  data: any
): Promise<DiscoveryRequestItem> {
  try {
    const response = await apiClient.put<DiscoveryRequestItem>(
      API_ENDPOINTS.DISCOVERY.REQUEST_BY_ID(id),
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete discovery request
 */
export async function deleteDiscoveryRequest(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.DISCOVERY.REQUEST_BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * DEPOSITIONS
 */

/**
 * Get list of depositions
 */
export async function getDepositions(filters?: DepositionFilters): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DISCOVERY.DEPOSITIONS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get deposition by ID
 */
export async function getDepositionById(id: string): Promise<DepositionItem> {
  try {
    const response = await apiClient.get<DepositionItem>(
      API_ENDPOINTS.DISCOVERY.DEPOSITION_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Schedule deposition
 */
export async function scheduleDeposition(data: any): Promise<DepositionItem> {
  try {
    const response = await apiClient.post<DepositionItem>(
      API_ENDPOINTS.DISCOVERY.DEPOSITIONS,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update deposition
 */
export async function updateDeposition(id: string, data: any): Promise<DepositionItem> {
  try {
    const response = await apiClient.put<DepositionItem>(
      API_ENDPOINTS.DISCOVERY.DEPOSITION_BY_ID(id),
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Cancel deposition
 */
export async function cancelDeposition(id: string, reason?: string): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.DISCOVERY.DEPOSITION_BY_ID(id)}/cancel`, {
      reason,
    });
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * PRODUCTIONS
 */

/**
 * Get document productions
 */
export async function getProductions(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DISCOVERY.PRODUCTIONS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create production
 */
export async function createProduction(data: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DISCOVERY.PRODUCTIONS, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * INTERROGATORIES
 */

/**
 * Get interrogatories
 */
export async function getInterrogatories(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DISCOVERY.INTERROGATORIES, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create interrogatory
 */
export async function createInterrogatory(data: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DISCOVERY.INTERROGATORIES, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * REQUESTS FOR ADMISSION
 */

/**
 * Get requests for admission
 */
export async function getAdmissions(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DISCOVERY.ADMISSIONS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create request for admission
 */
export async function createAdmission(data: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DISCOVERY.ADMISSIONS, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * LEGAL HOLDS
 */

/**
 * Get legal holds
 */
export async function getLegalHolds(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DISCOVERY.LEGAL_HOLDS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create legal hold
 */
export async function createLegalHold(data: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DISCOVERY.LEGAL_HOLDS, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Release legal hold
 */
export async function releaseLegalHold(id: string): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.DISCOVERY.LEGAL_HOLDS}/${id}/release`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * ESI SOURCES
 */

/**
 * Get ESI sources
 */
export async function getESISources(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DISCOVERY.ESI_SOURCES, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create ESI source
 */
export async function createESISource(data: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DISCOVERY.ESI_SOURCES, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * PRIVILEGE LOG
 */

/**
 * Get privilege log entries
 */
export async function getPrivilegeLog(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DISCOVERY.PRIVILEGE_LOG, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create privilege log entry
 */
export async function createPrivilegeLogEntry(data: any): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DISCOVERY.PRIVILEGE_LOG, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  // Discovery Requests
  getDiscoveryRequests,
  getDiscoveryRequestById,
  createDiscoveryRequest,
  updateDiscoveryRequest,
  deleteDiscoveryRequest,
  // Depositions
  getDepositions,
  getDepositionById,
  scheduleDeposition,
  updateDeposition,
  cancelDeposition,
  // Productions
  getProductions,
  createProduction,
  // Interrogatories
  getInterrogatories,
  createInterrogatory,
  // Admissions
  getAdmissions,
  createAdmission,
  // Legal Holds
  getLegalHolds,
  createLegalHold,
  releaseLegalHold,
  // ESI
  getESISources,
  createESISource,
  // Privilege Log
  getPrivilegeLog,
  createPrivilegeLogEntry,
};
