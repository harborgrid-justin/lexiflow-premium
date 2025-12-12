/**
 * Motions Service
 * Handles legal motions, filings, and motion tracking
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface Motion {
  id: string;
  caseId: string;
  type: string;
  title: string;
  description?: string;
  status: 'draft' | 'filed' | 'pending' | 'granted' | 'denied' | 'withdrawn';
  filedBy: string;
  filedByName?: string;
  filedDate?: Date;
  hearingDate?: Date;
  decisionDate?: Date;
  decision?: 'granted' | 'denied' | 'partially_granted';
  judgeId?: string;
  judgeName?: string;
  notes?: string;
  documentIds?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMotionRequest {
  caseId: string;
  type: string;
  title: string;
  description?: string;
  status?: Motion['status'];
  filedDate?: Date;
  hearingDate?: Date;
  notes?: string;
  priority?: Motion['priority'];
  dueDate?: Date;
}

export interface UpdateMotionRequest {
  type?: string;
  title?: string;
  description?: string;
  status?: Motion['status'];
  filedDate?: Date;
  hearingDate?: Date;
  decisionDate?: Date;
  decision?: Motion['decision'];
  judgeId?: string;
  notes?: string;
  priority?: Motion['priority'];
  dueDate?: Date;
}

export interface MotionsListResponse {
  data: Motion[];
  total: number;
  page: number;
  limit: number;
}

export interface MotionStatistics {
  total: number;
  byStatus: Record<Motion['status'], number>;
  byType: Record<string, number>;
  granted: number;
  denied: number;
  pending: number;
  averageDecisionTime: number;
}

/**
 * Get list of motions with filters
 */
export async function getMotions(params?: PaginationParams & {
  caseId?: string;
  status?: Motion['status'];
  type?: string;
  priority?: Motion['priority'];
  search?: string;
  filedDateFrom?: string;
  filedDateTo?: string;
}): Promise<MotionsListResponse> {
  try {
    const response = await apiClient.get<MotionsListResponse>('/motions', {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get motions for a specific case
 */
export async function getCaseMotions(caseId: string): Promise<Motion[]> {
  try {
    const response = await apiClient.get<Motion[]>(`/motions/case/${caseId}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get motion by ID
 */
export async function getMotionById(id: string): Promise<Motion> {
  try {
    const response = await apiClient.get<Motion>(`/motions/${id}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create new motion
 */
export async function createMotion(data: CreateMotionRequest): Promise<Motion> {
  try {
    const response = await apiClient.post<Motion>('/motions', data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update existing motion
 */
export async function updateMotion(id: string, data: UpdateMotionRequest): Promise<Motion> {
  try {
    const response = await apiClient.put<Motion>(`/motions/${id}`, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete motion
 */
export async function deleteMotion(id: string): Promise<void> {
  try {
    await apiClient.delete(`/motions/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * File a motion (change status from draft to filed)
 */
export async function fileMotion(id: string, filedDate?: Date): Promise<Motion> {
  try {
    const response = await apiClient.post<Motion>(`/motions/${id}/file`, {
      filedDate: filedDate || new Date(),
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Withdraw a motion
 */
export async function withdrawMotion(id: string, reason?: string): Promise<Motion> {
  try {
    const response = await apiClient.post<Motion>(`/motions/${id}/withdraw`, {
      reason,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Record motion decision
 */
export async function recordMotionDecision(
  id: string,
  decision: Motion['decision'],
  decisionDate?: Date,
  notes?: string
): Promise<Motion> {
  try {
    const response = await apiClient.post<Motion>(`/motions/${id}/decision`, {
      decision,
      decisionDate: decisionDate || new Date(),
      notes,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Attach document to motion
 */
export async function attachDocument(motionId: string, documentId: string): Promise<Motion> {
  try {
    const response = await apiClient.post<Motion>(`/motions/${motionId}/documents`, {
      documentId,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Remove document from motion
 */
export async function removeDocument(motionId: string, documentId: string): Promise<Motion> {
  try {
    const response = await apiClient.delete<Motion>(
      `/motions/${motionId}/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get motion statistics
 */
export async function getMotionStatistics(caseId?: string): Promise<MotionStatistics> {
  try {
    const response = await apiClient.get<MotionStatistics>('/motions/statistics', {
      params: { caseId },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get upcoming motion hearings
 */
export async function getUpcomingHearings(days: number = 30): Promise<Motion[]> {
  try {
    const response = await apiClient.get<Motion[]>('/motions/upcoming-hearings', {
      params: { days },
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getMotions,
  getCaseMotions,
  getMotionById,
  createMotion,
  updateMotion,
  deleteMotion,
  fileMotion,
  withdrawMotion,
  recordMotionDecision,
  attachDocument,
  removeDocument,
  getMotionStatistics,
  getUpcomingHearings,
};
