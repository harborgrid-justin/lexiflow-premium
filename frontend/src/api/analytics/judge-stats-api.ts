/**
 * Judge Stats API Service
 * Judge statistics and analytics
 */

import { apiClient } from '@/services/infrastructure/apiClient';

export interface JudgeStatistics {
  judgeId: string;
  judgeName: string;
  court: string;
  totalCases: number;
  activeCases: number;
  averageCaseDuration: number;
  motionGrantRate: number;
  settlementRate: number;
  trialRate: number;
  rulings?: {
    motionType: string;
    grantedCount: number;
    deniedCount: number;
    grantRate: number;
  }[];
  caseTypes?: {
    type: string;
    count: number;
    percentage: number;
  }[];
  metadata?: Record<string, any>;
}

export class JudgeStatsApiService {
  private readonly baseUrl = '/judge-stats';

  async getAll(): Promise<JudgeStatistics[]> {
    return apiClient.get<JudgeStatistics[]>(this.baseUrl);
  }

  async getById(judgeId: string): Promise<JudgeStatistics> {
    return apiClient.get<JudgeStatistics>(`${this.baseUrl}/${judgeId}`);
  }

  async search(query: { judgeName?: string; court?: string }): Promise<JudgeStatistics[]> {
    const params = new URLSearchParams();
    if (query.judgeName) params.append('judgeName', query.judgeName);
    if (query.court) params.append('court', query.court);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/search?${queryString}` : this.baseUrl;
    return apiClient.get<JudgeStatistics[]>(url);
  }
}
