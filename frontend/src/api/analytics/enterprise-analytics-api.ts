/**
 * Enterprise Analytics API Service
 * Comprehensive analytics endpoints for legal platform
 */

import { apiClient } from "@/services/infrastructure/apiClient";

import type {
  AuditLog,
  AuditLogFilters,
  BillingAnalytics,
  CaseAnalytics,
  ClientAnalytics,
  ProductivityAnalytics,
  Report,
  ReportData,
} from "@/types/analytics-enterprise";

export class EnterpriseAnalyticsApiService {
  private readonly baseUrl = "/analytics/enterprise";

  // ====================
  // CASE ANALYTICS ====================

  async getCaseAnalytics(
    startDate: string,
    endDate: string
  ): Promise<CaseAnalytics> {
    return apiClient.get<CaseAnalytics>(
      `${this.baseUrl}/cases?start=${startDate}&end=${endDate}`
    );
  }

  async getCaseOutcomeTracking(params: {
    practiceArea?: string;
    attorney?: string;
    caseType?: string;
  }): Promise<unknown> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return apiClient.get(`${this.baseUrl}/cases/outcomes?${queryString}`);
  }

  async getCaseWinRateByAttorney(
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/cases/win-rate?start=${startDate}&end=${endDate}`
    );
  }

  // ====================
  // BILLING ANALYTICS ====================

  async getBillingAnalytics(
    startDate: string,
    endDate: string
  ): Promise<BillingAnalytics> {
    return apiClient.get<BillingAnalytics>(
      `${this.baseUrl}/billing?start=${startDate}&end=${endDate}`
    );
  }

  async getRealizationRate(params: {
    attorney?: string;
    client?: string;
    practiceArea?: string;
  }): Promise<unknown> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return apiClient.get(`${this.baseUrl}/billing/realization?${queryString}`);
  }

  async getCollectionRate(params: {
    attorney?: string;
    client?: string;
  }): Promise<unknown> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return apiClient.get(`${this.baseUrl}/billing/collection?${queryString}`);
  }

  async getARAgingReport(asOfDate?: string): Promise<unknown> {
    const url = asOfDate
      ? `${this.baseUrl}/billing/ar-aging?asOfDate=${asOfDate}`
      : `${this.baseUrl}/billing/ar-aging`;
    return apiClient.get(url);
  }

  async getWIPReport(params?: {
    attorney?: string;
    client?: string;
  }): Promise<unknown> {
    const queryString = params
      ? new URLSearchParams(params as Record<string, string>).toString()
      : "";
    const url = queryString
      ? `${this.baseUrl}/billing/wip?${queryString}`
      : `${this.baseUrl}/billing/wip`;
    return apiClient.get(url);
  }

  async getMatterBudgetVsActual(matterId: string): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/billing/matter/${matterId}/budget-vs-actual`
    );
  }

  // ====================
  // PRODUCTIVITY ANALYTICS ====================

  async getProductivityAnalytics(
    startDate: string,
    endDate: string
  ): Promise<ProductivityAnalytics> {
    return apiClient.get<ProductivityAnalytics>(
      `${this.baseUrl}/productivity?start=${startDate}&end=${endDate}`
    );
  }

  async getAttorneyProductivity(
    attorneyId: string,
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/productivity/attorney/${attorneyId}?start=${startDate}&end=${endDate}`
    );
  }

  async getUtilizationRates(params?: {
    department?: string;
    role?: string;
  }): Promise<unknown> {
    const queryString = params
      ? new URLSearchParams(params as Record<string, string>).toString()
      : "";
    const url = queryString
      ? `${this.baseUrl}/productivity/utilization?${queryString}`
      : `${this.baseUrl}/productivity/utilization`;
    return apiClient.get(url);
  }

  async getProductivityTrends(
    granularity: "daily" | "weekly" | "monthly",
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/productivity/trends?granularity=${granularity}&start=${startDate}&end=${endDate}`
    );
  }

  // ====================
  // CLIENT ANALYTICS ====================

  async getClientAnalytics(
    startDate: string,
    endDate: string
  ): Promise<ClientAnalytics> {
    return apiClient.get<ClientAnalytics>(
      `${this.baseUrl}/clients?start=${startDate}&end=${endDate}`
    );
  }

  async getClientProfitability(params?: {
    sortBy?: "revenue" | "profit" | "margin";
    limit?: number;
  }): Promise<unknown> {
    const queryString = params
      ? new URLSearchParams(params as Record<string, string>).toString()
      : "";
    const url = queryString
      ? `${this.baseUrl}/clients/profitability?${queryString}`
      : `${this.baseUrl}/clients/profitability`;
    return apiClient.get(url);
  }

  async getClientEngagementMetrics(clientId: string): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/clients/${clientId}/engagement`);
  }

  async getClientRetention(cohortYear?: number): Promise<unknown> {
    const url = cohortYear
      ? `${this.baseUrl}/clients/retention?cohort=${cohortYear}`
      : `${this.baseUrl}/clients/retention`;
    return apiClient.get(url);
  }

  async getClientLifetimeValue(clientId: string): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/clients/${clientId}/lifetime-value`);
  }

  // ====================
  // REPORTS ====================

  async getReports(filters?: {
    category?: string;
    status?: string;
    type?: string;
  }): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/reports?${queryString}`
      : `${this.baseUrl}/reports`;
    return apiClient.get<Report[]>(url);
  }

  async getReportById(id: string): Promise<ReportData> {
    return apiClient.get<ReportData>(`${this.baseUrl}/reports/${id}`);
  }

  async createReport(data: Partial<Report>): Promise<Report> {
    return apiClient.post<Report>(`${this.baseUrl}/reports`, data);
  }

  async updateReport(id: string, data: Partial<Report>): Promise<Report> {
    return apiClient.put<Report>(`${this.baseUrl}/reports/${id}`, data);
  }

  async deleteReport(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/reports/${id}`);
  }

  async generateReport(
    id: string,
    params?: Record<string, unknown>
  ): Promise<ReportData> {
    return apiClient.post<ReportData>(
      `${this.baseUrl}/reports/${id}/generate`,
      params
    );
  }

  async scheduleReport(
    id: string,
    schedule: {
      frequency: string;
      dayOfWeek?: number;
      dayOfMonth?: number;
      time?: string;
    }
  ): Promise<Report> {
    return apiClient.post<Report>(`${this.baseUrl}/reports/${id}/schedule`, {
      schedule,
    });
  }

  async exportReport(
    id: string,
    format: "pdf" | "excel" | "csv" | "html"
  ): Promise<Blob> {
    return apiClient.get(`${this.baseUrl}/reports/${id}/export/${format}`);
  }

  // ====================
  // AUDIT LOGS ====================

  async getAuditLogs(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.entityType) params.append("entityType", filters.entityType);
    if (filters?.entityId) params.append("entityId", filters.entityId);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.searchTerm) params.append("search", filters.searchTerm);
    if (filters?.severity) {
      filters.severity.forEach((s) => params.append("severity", s));
    }
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/audit-logs?${queryString}`
      : `${this.baseUrl}/audit-logs`;
    return apiClient.get<AuditLog[]>(url);
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    return apiClient.get<AuditLog>(`${this.baseUrl}/audit-logs/${id}`);
  }

  async exportAuditLogs(
    filters?: AuditLogFilters,
    format: "csv" | "excel" | "pdf" = "csv"
  ): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.entityType) params.append("entityType", filters.entityType);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    params.append("format", format);
    const queryString = params.toString();
    return apiClient.get(`${this.baseUrl}/audit-logs/export?${queryString}`);
  }

  // ====================
  // COMPLIANCE ====================

  async getComplianceReport(
    reportType: "sox" | "hipaa" | "gdpr" | "soc2",
    startDate: string,
    endDate: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/compliance/${reportType}?start=${startDate}&end=${endDate}`
    );
  }

  async getDataAccessAudit(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    return apiClient.get<AuditLog[]>(
      `${this.baseUrl}/compliance/data-access/${entityType}/${entityId}`
    );
  }

  // ====================
  // COMPARISONS ====================

  async getYearOverYearComparison(
    metric: string,
    year1: number,
    year2: number
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/comparisons/yoy?metric=${metric}&year1=${year1}&year2=${year2}`
    );
  }

  async getMonthOverMonthComparison(
    metric: string,
    month1: string,
    month2: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/comparisons/mom?metric=${metric}&month1=${month1}&month2=${month2}`
    );
  }

  async getQuarterOverQuarterComparison(
    metric: string,
    quarter1: string,
    quarter2: string
  ): Promise<unknown> {
    return apiClient.get(
      `${this.baseUrl}/comparisons/qoq?metric=${metric}&q1=${quarter1}&q2=${quarter2}`
    );
  }

  // ====================
  // DASHBOARDS ====================

  async getExecutiveDashboard(period?: string): Promise<unknown> {
    const url = period
      ? `${this.baseUrl}/dashboards/executive?period=${period}`
      : `${this.baseUrl}/dashboards/executive`;
    return apiClient.get(url);
  }

  async getFinancialDashboard(period?: string): Promise<unknown> {
    const url = period
      ? `${this.baseUrl}/dashboards/financial?period=${period}`
      : `${this.baseUrl}/dashboards/financial`;
    return apiClient.get(url);
  }

  async getOperationalDashboard(period?: string): Promise<unknown> {
    const url = period
      ? `${this.baseUrl}/dashboards/operational?period=${period}`
      : `${this.baseUrl}/dashboards/operational`;
    return apiClient.get(url);
  }
}

// Export singleton instance
export const enterpriseAnalyticsApi = new EnterpriseAnalyticsApiService();
