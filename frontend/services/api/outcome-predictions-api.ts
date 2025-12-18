/**
 * Outcome Predictions API Service
 * AI-powered case outcome predictions
 */

import { apiClient } from '../infrastructure/apiClient';

export interface OutcomePrediction {
  id: string;
  caseId: string;
  predictionType: 'settlement' | 'trial_verdict' | 'motion_outcome' | 'appeal_outcome';
  confidence: number;
  prediction: string;
  factors?: {
    factor: string;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  similarCases?: {
    caseId: string;
    similarity: number;
    outcome: string;
  }[];
  generatedAt: string;
  metadata?: Record<string, any>;
}

export class OutcomePredictionsApiService {
  private readonly baseUrl = '/outcome-predictions';

  async predict(caseId: string, predictionType: OutcomePrediction['predictionType']): Promise<OutcomePrediction> {
    return apiClient.post<OutcomePrediction>(`${this.baseUrl}/predict`, { caseId, predictionType });
  }

  async getByCaseId(caseId: string): Promise<OutcomePrediction[]> {
    return apiClient.get<OutcomePrediction[]>(`${this.baseUrl}/case/${caseId}`);
  }

  async getById(id: string): Promise<OutcomePrediction> {
    return apiClient.get<OutcomePrediction>(`${this.baseUrl}/${id}`);
  }
}
