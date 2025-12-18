/**
 * Case Analytics API Service
 * Case performance and outcome analytics
 */

import { apiClient } from '../apiClient';

export interface CaseAnalytics {
  caseId: string;
  duration: {
    total: number;
    byPhase: { phase: string; duration: number }[];
  };
  timeline: {
    event: string;
    date: string;
    category: string;
  }[];
  costs: {
    total: number;
    byCategory: { category: string; amount: number }[];
  };
  activity: {
    documents: number;
    pleadings: number;
    motions: number;
    discovery: number;
  };
  team: {
    attorneys: number;
    paralegals: number;
    hoursLogged: number;
  };
  outcomes: {
    motions: { filed: number; granted: number; denied: number };
    discovery: { requested: number; produced: number; objected: number };
  };
  comparisons?: {
    metric: string;
    value: number;
    average: number;
    percentile: number;
  }[];
}

export class CaseAnalyticsApiService {
  private readonly baseUrl = '/case-analytics';

  async getById(caseId: string): Promise<CaseAnalytics> {
    return apiClient.get<CaseAnalytics>(`${this.baseUrl}/${caseId}`);
  }

  async compare(caseIds: string[]): Promise<any> {
    return apiClient.post(`${this.baseUrl}/compare`, { caseIds });
  }

  async getTrends(filters?: { caseType?: string; practiceArea?: string }): Promise<any> {
    return apiClient.post(`${this.baseUrl}/trends`, filters);
  }
}
