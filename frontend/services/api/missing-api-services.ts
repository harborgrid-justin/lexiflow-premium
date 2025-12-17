/**
 * Missing API Services for Backend Integration
 * Provides frontend access to all backend endpoints
 */

import { apiClient, type PaginatedResponse } from '../apiClient';

// =============================================================================
// DISCOVERY MAIN API SERVICE
// =============================================================================

export class DiscoveryApiService {
  async getAll(filters?: Record<string, any>): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/api/v1/discovery', filters);
    return response.data;
  }

  async getStats(caseId?: string): Promise<any> {
    return apiClient.get('/api/v1/discovery/stats', caseId ? { caseId } : undefined);
  }

  async getDashboard(caseId?: string): Promise<any> {
    return apiClient.get('/api/v1/discovery/dashboard', caseId ? { caseId } : undefined);
  }
}

// =============================================================================
// SEARCH API SERVICE
// =============================================================================

export class SearchApiService {
  async search(query: string, filters?: { type?: string; caseId?: string }): Promise<any[]> {
    return apiClient.get<any[]>('/api/v1/search', { q: query, ...filters });
  }

  async searchDocuments(query: string, caseId?: string): Promise<any[]> {
    return apiClient.get<any[]>('/api/v1/search/documents', { q: query, caseId });
  }

  async searchCases(query: string): Promise<any[]> {
    return apiClient.get<any[]>('/api/v1/search/cases', { q: query });
  }

  async searchFullText(query: string, options?: Record<string, any>): Promise<any[]> {
    return apiClient.post<any[]>('/api/v1/search/full-text', { query, ...options });
  }
}

// =============================================================================
// OCR API SERVICE
// =============================================================================

export class OCRApiService {
  async processDocument(documentId: string): Promise<any> {
    return apiClient.post(`/api/v1/ocr/process/${documentId}`, {});
  }

  async getStatus(jobId: string): Promise<any> {
    return apiClient.get(`/api/v1/ocr/status/${jobId}`);
  }

  async getResults(jobId: string): Promise<any> {
    return apiClient.get(`/api/v1/ocr/results/${jobId}`);
  }

  async cancelJob(jobId: string): Promise<void> {
    await apiClient.post(`/api/v1/ocr/cancel/${jobId}`, {});
  }
}

// =============================================================================
// SERVICE JOBS API SERVICE
// =============================================================================

export class ServiceJobsApiService {
  async getAll(filters?: { status?: string; type?: string }): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/api/v1/service-jobs', filters);
    return response.data;
  }

  async getById(id: string): Promise<any> {
    return apiClient.get(`/api/v1/service-jobs/${id}`);
  }

  async create(job: any): Promise<any> {
    return apiClient.post('/api/v1/service-jobs', job);
  }

  async cancel(id: string): Promise<void> {
    await apiClient.post(`/api/v1/service-jobs/${id}/cancel`, {});
  }

  async retry(id: string): Promise<any> {
    return apiClient.post(`/api/v1/service-jobs/${id}/retry`, {});
  }
}

// =============================================================================
// MESSAGING API SERVICE
// =============================================================================

export class MessagingApiService {
  async getMessages(filters?: { conversationId?: string }): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/api/v1/messages', filters);
    return response.data;
  }

  async sendMessage(message: any): Promise<any> {
    return apiClient.post('/api/v1/messages', message);
  }

  async markAsRead(messageId: string): Promise<void> {
    await apiClient.patch(`/api/v1/messages/${messageId}/read`, {});
  }

  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/api/v1/messages/${messageId}`);
  }
}

// =============================================================================
// COMPLIANCE MAIN API SERVICE
// =============================================================================

export class ComplianceApiService {
  async getDashboard(): Promise<any> {
    return apiClient.get('/api/v1/compliance/dashboard');
  }

  async runCheck(checkType: string, params?: Record<string, any>): Promise<any> {
    return apiClient.post('/api/v1/compliance/check', { checkType, ...params });
  }

  async getViolations(filters?: { severity?: string; resolved?: boolean }): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/api/v1/compliance/violations', filters);
    return response.data;
  }

  async resolveViolation(violationId: string, resolution: string): Promise<any> {
    return apiClient.post(`/api/v1/compliance/violations/${violationId}/resolve`, { resolution });
  }
}

// =============================================================================
// TOKEN BLACKLIST ADMIN API SERVICE
// =============================================================================

export class TokenBlacklistAdminApiService {
  async getBlacklist(filters?: { page?: number; limit?: number }): Promise<any> {
    return apiClient.get('/api/v1/admin/blacklist', filters);
  }

  async addToBlacklist(token: string, reason?: string): Promise<void> {
    await apiClient.post('/api/v1/admin/blacklist', { token, reason });
  }

  async removeFromBlacklist(token: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/blacklist/${token}`);
  }

  async clearExpired(): Promise<{ deleted: number }> {
    return apiClient.post('/api/v1/admin/blacklist/clear-expired', {});
  }
}

// =============================================================================
// ANALYTICS API SERVICE
// =============================================================================

export class AnalyticsApiService {
  // Case Analytics
  async getCaseMetrics(filters?: Record<string, any>): Promise<any> {
    return apiClient.get('/api/v1/analytics/cases/metrics', filters);
  }

  async getCaseTrends(period?: string): Promise<any[]> {
    return apiClient.get('/api/v1/analytics/cases/trends', { period });
  }

  // Discovery Analytics
  async getDiscoveryMetrics(caseId?: string): Promise<any> {
    return apiClient.get('/api/v1/analytics/discovery/metrics', caseId ? { caseId } : undefined);
  }

  async getDiscoveryTimeline(caseId: string): Promise<any[]> {
    return apiClient.get(`/api/v1/analytics/discovery/timeline/${caseId}`);
  }

  // General Analytics
  async getPerformanceMetrics(filters?: Record<string, any>): Promise<any> {
    return apiClient.get('/api/v1/analytics/performance', filters);
  }
}

// =============================================================================
// JUDGE STATS API SERVICE
// =============================================================================

export class JudgeStatsApiService {
  async getAll(filters?: { jurisdiction?: string }): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/api/v1/analytics/judge-stats', filters);
    return response.data;
  }

  async getById(judgeId: string): Promise<any> {
    return apiClient.get(`/api/v1/analytics/judge-stats/${judgeId}`);
  }

  async getMotionStats(judgeId: string): Promise<any> {
    return apiClient.get(`/api/v1/analytics/judge-stats/${judgeId}/motions`);
  }

  async getDispositionTrends(judgeId: string): Promise<any[]> {
    return apiClient.get(`/api/v1/analytics/judge-stats/${judgeId}/trends`);
  }
}

// =============================================================================
// OUTCOME PREDICTIONS API SERVICE
// =============================================================================

export class OutcomePredictionsApiService {
  async getAll(filters?: { caseId?: string }): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>('/api/v1/analytics/outcome-predictions', filters);
    return response.data;
  }

  async getById(id: string): Promise<any> {
    return apiClient.get(`/api/v1/analytics/outcome-predictions/${id}`);
  }

  async predict(caseData: Record<string, any>): Promise<any> {
    return apiClient.post('/api/v1/analytics/outcome-predictions/predict', caseData);
  }

  async updatePrediction(id: string, update: any): Promise<any> {
    return apiClient.put(`/api/v1/analytics/outcome-predictions/${id}`, update);
  }
}

// =============================================================================
// DOCUMENT VERSIONS API SERVICE
// =============================================================================

export class DocumentVersionsApiService {
  async getVersions(documentId: string): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>(`/api/v1/documents/${documentId}/versions`);
    return response.data;
  }

  async getVersion(documentId: string, versionId: string): Promise<any> {
    return apiClient.get(`/api/v1/documents/${documentId}/versions/${versionId}`);
  }

  async createVersion(documentId: string, versionData: any): Promise<any> {
    return apiClient.post(`/api/v1/documents/${documentId}/versions`, versionData);
  }

  async restoreVersion(documentId: string, versionId: string): Promise<any> {
    return apiClient.post(`/api/v1/documents/${documentId}/versions/${versionId}/restore`, {});
  }

  async compareVersions(documentId: string, versionId1: string, versionId2: string): Promise<any> {
    return apiClient.get(`/api/v1/documents/${documentId}/versions/compare`, { v1: versionId1, v2: versionId2 });
  }
}

// =============================================================================
// DATA SOURCES API SERVICE
// =============================================================================

export class DataSourcesApiService {
  async getAll(): Promise<any[]> {
    return apiClient.get('/integrations/data-sources');
  }

  async getById(id: string): Promise<any> {
    return apiClient.get(`/integrations/data-sources/${id}`);
  }

  async create(source: any): Promise<any> {
    return apiClient.post('/integrations/data-sources', source);
  }

  async update(id: string, source: any): Promise<any> {
    return apiClient.put(`/integrations/data-sources/${id}`, source);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/integrations/data-sources/${id}`);
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/integrations/data-sources/${id}/test`, {});
  }

  async sync(id: string): Promise<any> {
    return apiClient.post(`/integrations/data-sources/${id}/sync`, {});
  }
}

// =============================================================================
// METRICS API SERVICE
// =============================================================================

export class MetricsApiService {
  async getMetrics(): Promise<any> {
    return apiClient.get('/metrics');
  }

  async getSystemMetrics(): Promise<any> {
    return apiClient.get('/metrics/system');
  }

  async getApiMetrics(): Promise<any> {
    return apiClient.get('/metrics/api');
  }
}

// =============================================================================
// PRODUCTION API SERVICE (Different from Productions)
// =============================================================================

export class ProductionApiService {
  async getBuildInfo(): Promise<any> {
    return apiClient.get('/production/info');
  }

  async getStatus(): Promise<any> {
    return apiClient.get('/production/status');
  }

  async triggerDeployment(config?: any): Promise<any> {
    return apiClient.post('/production/deploy', config || {});
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const missingApiServices = {
  discovery: new DiscoveryApiService(),
  search: new SearchApiService(),
  ocr: new OCRApiService(),
  serviceJobs: new ServiceJobsApiService(),
  messaging: new MessagingApiService(),
  compliance: new ComplianceApiService(),
  tokenBlacklist: new TokenBlacklistAdminApiService(),
  analytics: new AnalyticsApiService(),
  judgeStats: new JudgeStatsApiService(),
  outcomePredictions: new OutcomePredictionsApiService(),
  documentVersions: new DocumentVersionsApiService(),
  dataSources: new DataSourcesApiService(),
  metrics: new MetricsApiService(),
  production: new ProductionApiService(),
};
