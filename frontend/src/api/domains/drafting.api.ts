import { ApiClient } from '../../services/infrastructure/apiClient';
import { Document } from '../../types/models';

export interface DraftingStats {
  drafts: number;
  templates: number;
  pendingReviews: number;
}

export class DraftingApiService {
  private static instance: DraftingApiService;
  private client: ApiClient;

  private constructor() {
    this.client = new ApiClient();
  }

  public static getInstance(): DraftingApiService {
    if (!DraftingApiService.instance) {
      DraftingApiService.instance = new DraftingApiService();
    }
    return DraftingApiService.instance;
  }

  public async getRecentDrafts(limit: number = 5): Promise<Document[]> {
    return this.client.get<Document[]>(`/drafting/recent-drafts?limit=${limit}`);
  }

  public async getTemplates(limit: number = 10): Promise<Document[]> {
    return this.client.get<Document[]>(`/drafting/templates?limit=${limit}`);
  }

  public async getPendingApprovals(): Promise<Document[]> {
    return this.client.get<Document[]>('/drafting/approvals');
  }

  public async getStats(): Promise<DraftingStats> {
    return this.client.get<DraftingStats>('/drafting/stats');
  }
}

export const draftingApi = DraftingApiService.getInstance();
