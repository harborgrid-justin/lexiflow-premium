import { apiClient } from './api/apiClient';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: string;
  severity: string;
  resourceType: string;
  resourceId: string;
  description: string;
  ipAddress: string;
  successful: boolean;
  errorMessage?: string;
}

export interface SearchQuery {
  keywords?: string[];
  userId?: string;
  action?: string[];
  category?: string[];
  severity?: string[];
  resourceType?: string[];
  resourceId?: string[];
  startDate?: string;
  endDate?: string;
  successful?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  entries: AuditEntry[];
  total: number;
  facets: {
    users: Record<string, number>;
    actions: Record<string, number>;
    categories: Record<string, number>;
  };
}

export interface AuditReport {
  id: string;
  reportType: string;
  title: string;
  description: string;
  generatedAt: string;
  dateRange: { start: string; end: string };
  format: string;
  downloadUrl: string;
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    criticalEvents: number;
    complianceScore: number;
  };
}

export interface Anomaly {
  id: string;
  type: string;
  severity: string;
  detectedAt: string;
  userId?: string;
  userName?: string;
  description: string;
  riskScore: number;
  investigated: boolean;
  resolved: boolean;
}

export interface ExportJob {
  id: string;
  format: string;
  status: string;
  createdAt: string;
  totalRecords: number;
  processedRecords: number;
  downloadUrl?: string;
  expiresAt?: string;
}

class AuditService {
  /**
   * Search audit logs
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const response = await apiClient.post('/api/audit/search', query);
    return response.data;
  }

  /**
   * Get audit entry by ID
   */
  async getAuditEntry(entryId: string): Promise<AuditEntry> {
    const response = await apiClient.get(`/api/audit/entries/${entryId}`);
    return response.data;
  }

  /**
   * Get audit history for resource
   */
  async getResourceHistory(resourceType: string, resourceId: string): Promise<AuditEntry[]> {
    const response = await apiClient.get(
      `/api/audit/history/${resourceType}/${resourceId}`,
    );
    return response.data;
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    failedActions: number;
    criticalEvents: number;
  }> {
    const response = await apiClient.get(`/api/audit/users/${userId}/activity`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Get security events
   */
  async getSecurityEvents(
    startDate: string,
    endDate: string,
    failedOnly?: boolean,
  ): Promise<AuditEntry[]> {
    const response = await apiClient.get('/api/audit/security-events', {
      params: { startDate, endDate, failedOnly },
    });
    return response.data;
  }

  /**
   * Get critical events
   */
  async getCriticalEvents(hours: number = 24): Promise<AuditEntry[]> {
    const response = await apiClient.get('/api/audit/critical-events', {
      params: { hours },
    });
    return response.data;
  }

  /**
   * Verify audit chain integrity
   */
  async verifyAuditChain(startSequence?: number, endSequence?: number): Promise<{
    isValid: boolean;
    brokenAtSequence?: number;
    totalEntries: number;
  }> {
    const response = await apiClient.get('/api/audit/verify-chain', {
      params: { startSequence, endSequence },
    });
    return response.data;
  }

  /**
   * Generate audit report
   */
  async generateReport(
    reportType: string,
    dateRange: { start: string; end: string },
    format: string,
  ): Promise<AuditReport> {
    const response = await apiClient.post('/api/audit/reports', {
      reportType,
      dateRange,
      format,
    });
    return response.data;
  }

  /**
   * Get audit reports
   */
  async getReports(): Promise<AuditReport[]> {
    const response = await apiClient.get('/api/audit/reports');
    return response.data;
  }

  /**
   * Get report by ID
   */
  async getReport(reportId: string): Promise<AuditReport> {
    const response = await apiClient.get(`/api/audit/reports/${reportId}`);
    return response.data;
  }

  /**
   * Download report
   */
  async downloadReport(reportId: string): Promise<Blob> {
    const response = await apiClient.get(`/api/audit/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Create export job
   */
  async createExport(format: string, query: SearchQuery): Promise<ExportJob> {
    const response = await apiClient.post('/api/audit/exports', {
      format,
      query,
    });
    return response.data;
  }

  /**
   * Get export job status
   */
  async getExportJob(jobId: string): Promise<ExportJob> {
    const response = await apiClient.get(`/api/audit/exports/${jobId}`);
    return response.data;
  }

  /**
   * Get all export jobs for current user
   */
  async getExportJobs(): Promise<ExportJob[]> {
    const response = await apiClient.get('/api/audit/exports');
    return response.data;
  }

  /**
   * Cancel export job
   */
  async cancelExport(jobId: string): Promise<void> {
    await apiClient.delete(`/api/audit/exports/${jobId}`);
  }

  /**
   * Download export
   */
  async downloadExport(jobId: string): Promise<Blob> {
    const response = await apiClient.get(`/api/audit/exports/${jobId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get anomalies
   */
  async getAnomalies(filters?: {
    type?: string;
    severity?: string;
    userId?: string;
    investigated?: boolean;
    resolved?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<Anomaly[]> {
    const response = await apiClient.get('/api/audit/anomalies', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Investigate anomaly
   */
  async investigateAnomaly(
    anomalyId: string,
    notes: string,
    falsePositive: boolean = false,
  ): Promise<void> {
    await apiClient.post(`/api/audit/anomalies/${anomalyId}/investigate`, {
      notes,
      falsePositive,
    });
  }

  /**
   * Resolve anomaly
   */
  async resolveAnomaly(anomalyId: string): Promise<void> {
    await apiClient.post(`/api/audit/anomalies/${anomalyId}/resolve`);
  }

  /**
   * Get anomaly statistics
   */
  async getAnomalyStatistics(startDate: string, endDate: string): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    investigated: number;
    resolved: number;
    averageRiskScore: number;
  }> {
    const response = await apiClient.get('/api/audit/anomalies/statistics', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate: string, endDate: string): Promise<{
    totalEntries: number;
    uniqueUsers: number;
    actionDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    severityDistribution: Record<string, number>;
    successRate: number;
    criticalEventsCount: number;
    securityEventsCount: number;
  }> {
    const response = await apiClient.get('/api/audit/statistics', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Save search query
   */
  async saveSearch(
    name: string,
    description: string,
    query: SearchQuery,
    shared: boolean = false,
  ): Promise<{ id: string; name: string }> {
    const response = await apiClient.post('/api/audit/saved-searches', {
      name,
      description,
      query,
      shared,
    });
    return response.data;
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    query: SearchQuery;
  }>> {
    const response = await apiClient.get('/api/audit/saved-searches');
    return response.data;
  }

  /**
   * Execute saved search
   */
  async executeSavedSearch(searchId: string): Promise<SearchResult> {
    const response = await apiClient.get(`/api/audit/saved-searches/${searchId}/execute`);
    return response.data;
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    await apiClient.delete(`/api/audit/saved-searches/${searchId}`);
  }
}

export const auditService = new AuditService();
export default auditService;
