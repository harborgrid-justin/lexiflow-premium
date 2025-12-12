/**
 * Parties Service
 * Handles party management for legal cases - plaintiffs, defendants, witnesses, etc.
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface Party {
  id: string;
  caseId: string;
  type: 'plaintiff' | 'defendant' | 'witness' | 'expert' | 'attorney' | 'other';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  organizationName?: string;
  isOrganization: boolean;
  role: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  notes?: string;
  isPrimary: boolean;
  isActive: boolean;
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreatePartyRequest {
  caseId: string;
  type: Party['type'];
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  isOrganization: boolean;
  role: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  notes?: string;
  isPrimary?: boolean;
}

export interface UpdatePartyRequest {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  role?: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface PartiesListResponse {
  data: Party[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get all parties with optional filters
 */
export async function getParties(params?: PaginationParams & {
  caseId?: string;
  type?: Party['type'];
  search?: string;
  isActive?: boolean;
}): Promise<PartiesListResponse> {
  try {
    const response = await apiClient.get<PartiesListResponse>('/parties', {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get parties for a specific case
 */
export async function getCaseParties(caseId: string): Promise<Party[]> {
  try {
    const response = await apiClient.get<Party[]>(`/parties/case/${caseId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get party by ID
 */
export async function getPartyById(id: string): Promise<Party> {
  try {
    const response = await apiClient.get<Party>(`/parties/${id}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new party
 */
export async function createParty(data: CreatePartyRequest): Promise<Party> {
  try {
    const response = await apiClient.post<Party>('/parties', data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update existing party
 */
export async function updateParty(id: string, data: UpdatePartyRequest): Promise<Party> {
  try {
    const response = await apiClient.put<Party>(`/parties/${id}`, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete party
 */
export async function deleteParty(id: string): Promise<void> {
  try {
    await apiClient.delete(`/parties/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Set party as primary
 */
export async function setPrimaryParty(id: string): Promise<Party> {
  try {
    const response = await apiClient.post<Party>(`/parties/${id}/set-primary`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Deactivate party
 */
export async function deactivateParty(id: string): Promise<Party> {
  try {
    const response = await apiClient.post<Party>(`/parties/${id}/deactivate`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Activate party
 */
export async function activateParty(id: string): Promise<Party> {
  try {
    const response = await apiClient.post<Party>(`/parties/${id}/activate`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get party contact history
 */
export async function getPartyContactHistory(id: string): Promise<any[]> {
  try {
    const response = await apiClient.get<any[]>(`/parties/${id}/contact-history`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Merge duplicate parties
 */
export async function mergeParties(
  sourceId: string,
  targetId: string
): Promise<Party> {
  try {
    const response = await apiClient.post<Party>('/parties/merge', {
      sourceId,
      targetId,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getParties,
  getCaseParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  setPrimaryParty,
  deactivateParty,
  activateParty,
  getPartyContactHistory,
  mergeParties,
};
