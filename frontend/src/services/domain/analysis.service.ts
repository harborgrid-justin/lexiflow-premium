// ================================================================================
// ANALYSIS DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → AnalysisService → Frontend API → Backend
//
// PURPOSE:
//   - Legal case analysis and data visualization
//   - Statistical analysis and trend identification
//   - Report generation for analytical insights
//
// USAGE:
//   Called by AnalysisContext and route loaders for analytical operations.
//   Never called directly from view components.
//
// ================================================================================

import { apiClient } from "@/services/infrastructure/apiClient";
import { JudgeProfile } from "@/types";

export interface AnalysisConfig {
  includeHistorical: boolean;
  jurisdictionWeights: Record<string, number>;
  confidenceThreshold: number;
}

export interface PredictionResult {
  outcomeProbabilities: Record<string, number>;
  estimatedDurationDays: number;
  similarCases: string[];
  riskFactors: Array<{ factor: string; impact: number }>;
}

export const AnalysisService = {
  /**
   * Get judge profiles for analysis
   * Maps to the backend judge statistics endpoint
   */
  getJudgeProfiles: async (): Promise<JudgeProfile[]> => {
    try {
      // The Controller endpoint is 'analytics/judge-stats'
      // We cast to unknown then to JudgeProfile[] as the shapes are likely compatible for frontend needs
      // (JudgeListItemDto usually contains id, name, court etc.)
      return (await apiClient.get(
        "/analytics/judge-stats"
      )) as unknown as JudgeProfile[];
    } catch (e) {
      console.warn("Failed to fetch judge profiles", e);
      return [];
    }
  },

  async predictCaseOutcome(
    caseId: string,
    config: AnalysisConfig
  ): Promise<PredictionResult> {
    return apiClient.post<PredictionResult>(
      `/analysis/cases/${caseId}/predict`,
      config
    );
  },

  async analyzeJudgeRulings(judgeId: string, topic?: string) {
    const params = topic ? { topic } : undefined;
    return apiClient.get(`/analysis/judges/${judgeId}/patterns`, { params });
  },

  async getJurisdictionTrends(jurisdictionId: string, year: number) {
    return apiClient.get(`/analysis/jurisdictions/${jurisdictionId}/trends`, {
      params: { year },
    });
  },

  async calculateSettlementValue(caseId: string) {
    return apiClient.get(`/analysis/cases/${caseId}/settlement-valuation`);
  },
};

export const analysisDomain = AnalysisService;
