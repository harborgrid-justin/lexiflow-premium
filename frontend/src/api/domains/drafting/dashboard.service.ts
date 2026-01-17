/**
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * Dashboard-specific data fetching service
 */

import { type ApiClient } from "@/services/infrastructure/api-client.service";

import type {
  DraftingStats,
  DraftingTemplate,
  GeneratedDocument,
} from "./types";

export class DashboardService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async getRecentDrafts(limit: number = 5): Promise<GeneratedDocument[]> {
    return this.client.get<GeneratedDocument[]>(
      `/drafting/recent-drafts?limit=${limit}`
    );
  }

  async getTemplates(limit: number = 10): Promise<DraftingTemplate[]> {
    return this.client.get<DraftingTemplate[]>(
      `/drafting/templates?limit=${limit}`
    );
  }

  async getPendingApprovals(): Promise<GeneratedDocument[]> {
    return this.client.get<GeneratedDocument[]>("/drafting/approvals");
  }

  async getStats(): Promise<DraftingStats> {
    return this.client.get<DraftingStats>("/drafting/stats");
  }
}
