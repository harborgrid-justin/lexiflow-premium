import { apiClient } from "@/services/infrastructure/apiClient";
import { isBackendApiEnabled } from "@/api";
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
    if (isBackendApiEnabled()) {
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
    }
    return [];
  },

  async predictCaseOutcome(caseId: string, config: AnalysisConfig): Promise<PredictionResult> {
    return apiClient.post<PredictionResult>(`/analysis/cases/${caseId}/predict`, config);
  },

  async analyzeJudgeRulings(judgeId: string, topic?: string) {
    const params = topic ? { topic } : undefined;
    return apiClient.get(`/analysis/judges/${judgeId}/patterns`, { params });
  },

  async getJurisdictionTrends(jurisdictionId: string, year: number) {
    return apiClient.get(`/analysis/jurisdictions/${jurisdictionId}/trends`, {
      params: { year }
    });
  },

  async calculateSettlementValue(caseId: string) {
    return apiClient.get(`/analysis/cases/${caseId}/settlement-valuation`);
  }
};

export const analysisDomain = AnalysisService;
        return [];
      }
    }
    // Fallback or legacy mode (empty for now as we don't have local repo for judges in this context)
    return [];
  },

  /**
   * Save an analysis session
   * Currently a placeholder that logs the action as backend endpoint is TBD
   */
  add: async (analysis: any): Promise<any> => {
    if (isBackendApiEnabled()) {
      // Placeholder for saving analysis result
      // Could be POST /cases/:id/analysis or similar in future
      console.info("Analysis save requested:", analysis);
      return Promise.resolve(analysis);
    }
    console.info("Analysis save requested (local):", analysis);
    return Promise.resolve(analysis);
  },
};
