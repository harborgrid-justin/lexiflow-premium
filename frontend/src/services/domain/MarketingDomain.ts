import { apiClient } from "@/services/infrastructure/apiClient";
import { MarketingCampaign, MarketingMetric } from "@/types";

export const MarketingService = {
  getMetrics: async (): Promise<MarketingMetric[]> => {
    return apiClient.get<MarketingMetric[]>("/marketing/metrics");
  },

  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    return apiClient.get<MarketingCampaign[]>("/marketing/campaigns");
  },
};
