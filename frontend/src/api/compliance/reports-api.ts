/**
 * Reports API Service
 * Manages report generation and templates
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface Report {
  id: string;
  name: string;
  reportType:
    | "billing"
    | "case_status"
    | "time_tracking"
    | "discovery"
    | "compliance"
    | "analytics"
    | "custom";
  format: "pdf" | "excel" | "csv" | "html" | "json";
  status: "pending" | "generating" | "completed" | "failed";
  filters?: Record<string, unknown>;
  generatedBy?: string;
  generatedAt?: string;
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  reportType: Report["reportType"];
  defaultFormat: Report["format"];
  parameters?: {
    name: string;
    type: "string" | "number" | "date" | "boolean" | "select";
    required: boolean;
    defaultValue?: unknown;
    options?: unknown[];
  }[];
  isPublic: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateReportRequest {
  templateId?: string;
  reportType: Report["reportType"];
  format: Report["format"];
  filters?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
}

export class ReportsApiService {
  private readonly baseUrl = "/reports";

  async generate(request: GenerateReportRequest): Promise<Report> {
    return apiClient.post<Report>(`${this.baseUrl}/generate`, request);
  }

  async getAll(filters?: {
    status?: Report["status"];
    reportType?: Report["reportType"];
  }): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.reportType) params.append("reportType", filters.reportType);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Report[]>(url);
  }

  async getById(id: string): Promise<Report> {
    return apiClient.get<Report>(`${this.baseUrl}/${id}`);
  }

  async download(id: string): Promise<Blob> {
    return apiClient.getBlob(`${this.baseUrl}/${id}/download`);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getTemplates(): Promise<ReportTemplate[]> {
    return apiClient.get<ReportTemplate[]>(`${this.baseUrl}/templates`);
  }

  async getTemplateById(id: string): Promise<ReportTemplate> {
    return apiClient.get<ReportTemplate>(`${this.baseUrl}/templates/${id}`);
  }

  async createTemplate(data: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return apiClient.post<ReportTemplate>(`${this.baseUrl}/templates`, data);
  }

  async updateTemplate(
    id: string,
    data: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    return apiClient.put<ReportTemplate>(
      `${this.baseUrl}/templates/${id}`,
      data
    );
  }

  async deleteTemplate(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/templates/${id}`);
  }
}
