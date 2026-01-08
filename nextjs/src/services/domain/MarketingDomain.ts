import { api } from "@/api";
import { MarketingCampaign, MarketingMetric } from "@/types";

export const MarketingService = {
  /**
   * Get marketing metrics from backend API
   */
  getMetrics: async (): Promise<MarketingMetric[]> => {
    return api.marketing.getMetrics();
  },

  /**
   * Get marketing campaigns from backend API
   */
  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    return api.marketing.getCampaigns();
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
