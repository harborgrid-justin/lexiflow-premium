// ================================================================================
// MARKETING DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → MarketingService → Frontend API → Backend
//
// PURPOSE:
//   - Marketing campaign management and tracking
//   - Lead generation and conversion metrics
//   - Marketing analytics and ROI calculation
//
// USAGE:
//   Called by MarketingContext and route loaders for marketing operations.
//   Never called directly from view components.
//
// ================================================================================

import { apiClient } from "@/services/infrastructure/api-client.service";
import { type MarketingCampaign, type MarketingMetric } from "@/types";

export const MarketingService = {
  getMetrics: async (): Promise<MarketingMetric[]> => {
    return apiClient.get<MarketingMetric[]>("/marketing/metrics");
  },

  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    return apiClient.get<MarketingCampaign[]>("/marketing/campaigns");
  },
};
