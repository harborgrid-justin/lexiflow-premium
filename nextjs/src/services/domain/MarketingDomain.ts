import { api } from "@/api";
import { MOCK_METRICS } from "@/api/types/marketingMetric";
import { MarketingCampaign, MarketingMetric } from "@/types";

export const MarketingService = {
  /**
   * Get marketing metrics from backend API
   * Falls back to mock data if backend is unavailable
   */
  getMetrics: async (): Promise<MarketingMetric[]> => {
    try {
      const response = await api.marketing.getMetrics();
      return response;
    } catch (error) {
      console.warn(
        "[MarketingService] Failed to fetch metrics from backend, using fallback data:",
        error
      );
      return MOCK_METRICS;
    }
  },

  /**
   * Get marketing campaigns from backend API
   * Falls back to static data if backend is unavailable
   */
  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    try {
      const response = await api.marketing.getCampaigns();
      return response;
    } catch (error) {
      console.warn(
        "[MarketingService] Failed to fetch campaigns from backend, using fallback data:",
        error
      );
      return [
        {
          id: "1",
          name: "Q1 Webinar Series",
          target: "Corporate Counsel",
          status: "Active",
          budget: "$2,000/mo",
        },
        {
          id: "2",
          name: 'Google Ads - "Commercial Lit"',
          target: "Small Business",
          status: "Active",
          budget: "$2,000/mo",
        },
        {
          id: "3",
          name: "LegalTech Conference Sponsor",
          target: "Industry Wide",
          status: "Upcoming",
          dates: "Sep 15-18",
        },
      ];
    }
  },

  /**
   * Create a new marketing campaign
   */
  createCampaign: async (
    campaign: Omit<MarketingCampaign, "id">
  ): Promise<MarketingCampaign> => {
    try {
      const response = await api.marketing.createCampaign(campaign);
      return response;
    } catch (error) {
      console.error("[MarketingService] Failed to create campaign:", error);
      throw new Error("Failed to create marketing campaign");
    }
  },

  /**
   * Update an existing marketing campaign
   */
  updateCampaign: async (
    id: string,
    updates: Partial<MarketingCampaign>
  ): Promise<MarketingCampaign> => {
    try {
      const response = await api.marketing.updateCampaign(id, updates);
      return response;
    } catch (error) {
      console.error("[MarketingService] Failed to update campaign:", error);
      throw new Error("Failed to update marketing campaign");
    }
  },

  /**
   * Delete a marketing campaign
   */
  deleteCampaign: async (id: string): Promise<void> => {
    try {
      await api.marketing.deleteCampaign(id);
    } catch (error) {
      console.error("[MarketingService] Failed to delete campaign:", error);
      throw new Error("Failed to delete marketing campaign");
    }
  },
};
