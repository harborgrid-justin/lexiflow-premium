import { apiClient } from "@/services/infrastructure/apiClient";

export interface AccessRequest {
  id: number | string;
  user: string;
  dataset: string;
  purpose: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export class AccessRequestsApiService {
  private readonly baseUrl = "/admin/access-requests";

  async getRequests(): Promise<AccessRequest[]> {
    try {
      const response = await apiClient.get<AccessRequest[]>(this.baseUrl);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(
        "[AccessRequestsApiService] Failed to fetch access requests",
        error
      );
      return [];
    }
  }
}
