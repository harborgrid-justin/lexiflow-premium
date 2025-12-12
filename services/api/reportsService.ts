/**
 * Reports Service
 * Handles report generation and management for various modules
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'billing' | 'case' | 'time' | 'expense' | 'analytics' | 'compliance' | 'discovery' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parameters: Record<string, any>;
  resultUrl?: string;
  fileSize?: number;
  generatedBy: string;
  generatedByName?: string;
  generatedAt?: Date;
  expiresAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: Report['type'];
  parameters: ReportParameter[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  defaultValue?: any;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface GenerateReportRequest {
  templateId?: string;
  name: string;
  type: Report['type'];
  format: Report['format'];
  parameters: Record<string, any>;
}

export interface ReportsListResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

export interface BillingReportParams {
  caseId?: string;
  clientId?: string;
  userId?: string;
  dateFrom: string;
  dateTo: string;
  includeTimeEntries?: boolean;
  includeExpenses?: boolean;
  includeInvoices?: boolean;
  groupBy?: 'case' | 'client' | 'user' | 'date';
}

export interface CaseReportParams {
  caseId?: string;
  status?: string;
  caseType?: string;
  assignedAttorneyId?: string;
  dateFrom?: string;
  dateTo?: string;
  includeTimeline?: boolean;
  includeDocuments?: boolean;
  includeParties?: boolean;
}

export interface TimeAnalysisParams {
  userId?: string;
  caseId?: string;
  dateFrom: string;
  dateTo: string;
  groupBy?: 'user' | 'case' | 'activity' | 'day' | 'week' | 'month';
}

/**
 * Get reports with filters
 */
export async function getReports(params?: PaginationParams & {
  type?: Report['type'];
  status?: Report['status'];
  dateFrom?: string;
  dateTo?: string;
}): Promise<ReportsListResponse> {
  try {
    const response = await apiClient.get<ReportsListResponse>(
      API_ENDPOINTS.BILLING.REPORTS,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get report by ID
 */
export async function getReportById(id: string): Promise<Report> {
  try {
    const response = await apiClient.get<Report>(`${API_ENDPOINTS.BILLING.REPORTS}/${id}`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate a new report
 */
export async function generateReport(data: GenerateReportRequest): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(
      `${API_ENDPOINTS.BILLING.REPORTS}/generate`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete report
 */
export async function deleteReport(id: string): Promise<void> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.BILLING.REPORTS}/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Download report
 */
export async function downloadReport(id: string): Promise<Blob> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.BILLING.REPORTS}/${id}/download`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get report templates
 */
export async function getReportTemplates(type?: Report['type']): Promise<ReportTemplate[]> {
  try {
    const response = await apiClient.get<ReportTemplate[]>(
      `${API_ENDPOINTS.BILLING.REPORTS}/templates`,
      { params: { type } }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get report template by ID
 */
export async function getReportTemplateById(id: string): Promise<ReportTemplate> {
  try {
    const response = await apiClient.get<ReportTemplate>(
      `${API_ENDPOINTS.BILLING.REPORTS}/templates/${id}`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create report template
 */
export async function createReportTemplate(data: {
  name: string;
  description?: string;
  type: Report['type'];
  parameters: ReportParameter[];
  isPublic?: boolean;
}): Promise<ReportTemplate> {
  try {
    const response = await apiClient.post<ReportTemplate>(
      `${API_ENDPOINTS.BILLING.REPORTS}/templates`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update report template
 */
export async function updateReportTemplate(
  id: string,
  data: Partial<ReportTemplate>
): Promise<ReportTemplate> {
  try {
    const response = await apiClient.put<ReportTemplate>(
      `${API_ENDPOINTS.BILLING.REPORTS}/templates/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete report template
 */
export async function deleteReportTemplate(id: string): Promise<void> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.BILLING.REPORTS}/templates/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate billing report
 */
export async function generateBillingReport(
  params: BillingReportParams,
  format: Report['format'] = 'pdf'
): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(
      `${API_ENDPOINTS.BILLING.REPORTS}/billing`,
      {
        ...params,
        format,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate case report
 */
export async function generateCaseReport(
  params: CaseReportParams,
  format: Report['format'] = 'pdf'
): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(
      `${API_ENDPOINTS.ANALYTICS.REPORTS}/case`,
      {
        ...params,
        format,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate time analysis report
 */
export async function generateTimeAnalysisReport(
  params: TimeAnalysisParams,
  format: Report['format'] = 'excel'
): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(
      `${API_ENDPOINTS.BILLING.REPORTS}/time-analysis`,
      {
        ...params,
        format,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Generate compliance report
 */
export async function generateComplianceReport(
  params: {
    reportType: 'audit' | 'access' | 'conflicts' | 'violations';
    dateFrom: string;
    dateTo: string;
    includeDetails?: boolean;
  },
  format: Report['format'] = 'pdf'
): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(
      `${API_ENDPOINTS.COMPLIANCE.REPORTS}`,
      {
        ...params,
        format,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Schedule recurring report
 */
export async function scheduleReport(data: {
  templateId: string;
  name: string;
  parameters: Record<string, any>;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: Report['format'];
}): Promise<{ id: string; nextRunDate: Date }> {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.BILLING.REPORTS}/schedule`,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get scheduled reports
 */
export async function getScheduledReports(): Promise<any[]> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.BILLING.REPORTS}/scheduled`);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Cancel scheduled report
 */
export async function cancelScheduledReport(id: string): Promise<void> {
  try {
    await apiClient.delete(`${API_ENDPOINTS.BILLING.REPORTS}/scheduled/${id}`);
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getReports,
  getReportById,
  generateReport,
  deleteReport,
  downloadReport,
  getReportTemplates,
  getReportTemplateById,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  generateBillingReport,
  generateCaseReport,
  generateTimeAnalysisReport,
  generateComplianceReport,
  scheduleReport,
  getScheduledReports,
  cancelScheduledReport,
};
