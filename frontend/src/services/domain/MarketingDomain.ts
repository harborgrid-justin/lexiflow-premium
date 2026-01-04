import { isBackendApiEnabled } from "@/api";
import { apiClient } from "@/services/infrastructure/apiClient";
import { MarketingCampaign, MarketingMetric } from "@/types";

export const MarketingService = {
  getMetrics: async (): Promise<MarketingMetric[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<MarketingMetric[]>("/marketing/metrics");
    }
    console.warn("Backend disabled, returning empty metrics");
    return [];
  },

  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<MarketingCampaign[]>("/marketing/campaigns");
    }
    console.warn("Backend disabled, returning empty campaigns");
    return [];
  },
};
