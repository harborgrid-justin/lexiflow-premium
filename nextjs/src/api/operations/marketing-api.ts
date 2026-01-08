/**
 * Marketing & CRM API Service
 * Manages marketing metrics, campaigns, and analytics
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import { MarketingCampaign, MarketingMetric } from "@/types";

export class MarketingApiService {
  async getMetrics(): Promise<MarketingMetric[]> {
    return apiClient.get<MarketingMetric[]>("/marketing/metrics");
  }

  async getCampaigns(): Promise<MarketingCampaign[]> {
    return apiClient.get<MarketingCampaign[]>("/marketing/campaigns");
  }

  async createCampaign(
    campaign: Omit<MarketingCampaign, "id">
  ): Promise<MarketingCampaign> {
    return apiClient.post<MarketingCampaign>("/marketing/campaigns", campaign);
  }

  async updateCampaign(
    id: string,
    updates: Partial<MarketingCampaign>
  ): Promise<MarketingCampaign> {
    return apiClient.put<MarketingCampaign>(
      `/marketing/campaigns/${id}`,
      updates
    );
  }

  async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete(`/marketing/campaigns/${id}`);
  }

  async getLeads(): Promise<any[]> {
    return apiClient.get("/marketing/leads");
  }

  async getConversionRates(): Promise<any> {
    return apiClient.get("/marketing/conversion-rates");
  }
}
