/**
 * Compliance Service
 * Handles audit logs, compliance reports, conflicts, and ethical walls
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
}

export interface ConflictCheckData {
  entityName: string;
  entityType?: string;
  caseId?: string;
  additionalInfo?: string;
}

/**
 * AUDIT LOGS
 */

/**
 * Get audit log entries
 */
export async function getAuditLog(filters?: AuditLogFilters): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.AUDIT_LOG, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Export audit log
 */
export async function exportAuditLog(
  filters?: AuditLogFilters,
  format: 'csv' | 'excel' | 'pdf' = 'csv'
): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.AUDIT_EXPORT, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * COMPLIANCE REPORTS
 */

/**
 * Get compliance reports
 */
export async function getComplianceReports(params?: {
  reportType?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.REPORTS, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate compliance report
 */
export async function generateComplianceReport(data: {
  reportType: string;
  dateFrom: string;
  dateTo: string;
  includeDetails?: boolean;
}): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.COMPLIANCE.REPORTS, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * COMPLIANCE METRICS
 */

/**
 * Get compliance metrics
 */
export async function getComplianceMetrics(params?: {
  period?: 'day' | 'week' | 'month' | 'year';
}): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.METRICS, {
      params,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * CONFLICT CHECKS
 */

/**
 * Perform conflict check
 */
export async function performConflictCheck(data: ConflictCheckData): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.COMPLIANCE.CONFLICTS, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get conflict check history
 */
export async function getConflictChecks(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.CONFLICTS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get conflict check by ID
 */
export async function getConflictCheckById(id: string): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.COMPLIANCE.CONFLICTS}/${id}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * ETHICAL WALLS
 */

/**
 * Get ethical walls
 */
export async function getEthicalWalls(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.ETHICAL_WALLS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create ethical wall
 */
export async function createEthicalWall(data: {
  caseId: string;
  title: string;
  restrictedGroups: string[];
  authorizedUsers: string[];
  reason: string;
}): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.COMPLIANCE.ETHICAL_WALLS, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update ethical wall
 */
export async function updateEthicalWall(id: string, data: any): Promise<any> {
  try {
    const response = await apiClient.put(
      `${API_ENDPOINTS.COMPLIANCE.ETHICAL_WALLS}/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Remove ethical wall
 */
export async function removeEthicalWall(id: string): Promise<void> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.COMPLIANCE.ETHICAL_WALLS}/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * COMPLIANCE POLICIES
 */

/**
 * Get compliance policies
 */
export async function getCompliancePolicies(): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.POLICIES);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get policy by ID
 */
export async function getPolicyById(id: string): Promise<any> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.COMPLIANCE.POLICIES}/${id}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Accept policy
 */
export async function acceptPolicy(policyId: string): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.COMPLIANCE.POLICIES}/${policyId}/accept`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * VIOLATIONS
 */

/**
 * Get compliance violations
 */
export async function getViolations(filters?: any): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMPLIANCE.VIOLATIONS, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Report violation
 */
export async function reportViolation(data: {
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  relatedEntity?: string;
}): Promise<any> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.COMPLIANCE.VIOLATIONS, data);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Resolve violation
 */
export async function resolveViolation(
  id: string,
  resolution: { note: string; action: string }
): Promise<void> {
  try {
    await apiClient.post(`${API_ENDPOINTS.COMPLIANCE.VIOLATIONS}/${id}/resolve`, resolution);
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  // Audit Logs
  getAuditLog,
  exportAuditLog,
  // Reports
  getComplianceReports,
  generateComplianceReport,
  // Metrics
  getComplianceMetrics,
  // Conflict Checks
  performConflictCheck,
  getConflictChecks,
  getConflictCheckById,
  // Ethical Walls
  getEthicalWalls,
  createEthicalWall,
  updateEthicalWall,
  removeEthicalWall,
  // Policies
  getCompliancePolicies,
  getPolicyById,
  acceptPolicy,
  // Violations
  getViolations,
  reportViolation,
  resolveViolation,
};
