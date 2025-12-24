/**
 * Compliance Reporting API Service
 * Compliance and regulatory reporting
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface ComplianceReport {
  id: string;
  reportType: 'trust_account' | 'iolta' | 'audit_trail' | 'data_retention' | 'ethical_walls' | 'client_costs' | 'custom';
  title: string;
  period: { start: string; end: string };
  status: 'draft' | 'pending_review' | 'approved' | 'filed';
  findings?: {
    category: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation?: string;
  }[];
  data: Record<string, any>;
  generatedBy?: string;
  generatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  metadata?: Record<string, any>;
}

export class ComplianceReportingApiService {
  private readonly baseUrl = '/compliance-reporting';

  async generate(data: {
    reportType: ComplianceReport['reportType'];
    title: string;
    period: { start: string; end: string };
    filters?: Record<string, any>;
  }): Promise<ComplianceReport> {
    return apiClient.post<ComplianceReport>(`${this.baseUrl}/generate`, data);
  }

  async getAll(filters?: { reportType?: ComplianceReport['reportType']; status?: ComplianceReport['status'] }): Promise<ComplianceReport[]> {
    const params = new URLSearchParams();
    if (filters?.reportType) params.append('reportType', filters.reportType);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<ComplianceReport[]>(url);
  }

  async getById(id: string): Promise<ComplianceReport> {
    return apiClient.get<ComplianceReport>(`${this.baseUrl}/${id}`);
  }

  async approve(id: string): Promise<ComplianceReport> {
    return apiClient.post<ComplianceReport>(`${this.baseUrl}/${id}/approve`, {});
  }

  async export(id: string, format: 'pdf' | 'xlsx' | 'csv'): Promise<Blob> {
    const response = await fetch(`/api${this.baseUrl}/${id}/export?format=${format}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.blob();
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
