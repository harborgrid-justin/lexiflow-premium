/**
 * Discovery Analytics API Service
 * Discovery process analytics
 */

import { apiClient } from '@services/infrastructure/apiClient';

export interface DiscoveryAnalytics {
  caseId: string;
  overview: {
    totalDocuments: number;
    reviewedDocuments: number;
    privilegedDocuments: number;
    responsiveDocuments: number;
    productionCount: number;
  };
  progress: {
    phase: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number;
    documentsProcessed: number;
    totalDocuments: number;
  }[];
  timeline: {
    date: string;
    documentsProcessed: number;
    cumulative: number;
  }[];
  costs: {
    hosting: number;
    review: number;
    production: number;
    total: number;
  };
  team: {
    reviewers: number;
    documentsPerReviewer: number;
    averageReviewRate: number;
  };
  quality: {
    consistency: number;
    accuracy: number;
    disputes: number;
  };
}

export class DiscoveryAnalyticsApiService {
  private readonly baseUrl = '/discovery-analytics';

  async getByCaseId(caseId: string): Promise<DiscoveryAnalytics> {
    return apiClient.get<DiscoveryAnalytics>(`${this.baseUrl}/case/${caseId}`);
  }

  async getReviewMetrics(caseId: string, userId?: string): Promise<unknown> {
    const url = userId 
      ? `${this.baseUrl}/case/${caseId}/review-metrics?userId=${userId}`
      : `${this.baseUrl}/case/${caseId}/review-metrics`;
    return apiClient.get(url);
  }

  async getCostProjection(caseId: string): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/case/${caseId}/cost-projection`);
  }
}
