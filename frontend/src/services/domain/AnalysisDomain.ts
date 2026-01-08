import { apiClient } from "@/services/infrastructure/apiClient";
import { isBackendApiEnabled } from "@/api";
import { JudgeProfile } from "@/types";

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
