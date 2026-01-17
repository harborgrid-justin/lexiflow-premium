/**
 * Exhibits API Service
 * Manages trial exhibits
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { TrialExhibit } from "@/types";

// Alias for backward compatibility
export type Exhibit = TrialExhibit;

export interface ExhibitFilters {
  caseId?: string;
  party?: string;
  status?: TrialExhibit["status"];
  type?: TrialExhibit["type"];
}

export class ExhibitsApiService {
  private readonly baseUrl = "/exhibits";

  async getAll(filters?: ExhibitFilters): Promise<TrialExhibit[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append("caseId", filters.caseId);
    if (filters?.party) params.append("party", filters.party);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<TrialExhibit[]>(url);
  }

  async getById(id: string): Promise<TrialExhibit> {
    return apiClient.get<TrialExhibit>(`${this.baseUrl}/${id}`);
  }

  async getByCaseId(caseId: string): Promise<TrialExhibit[]> {
    return this.getAll({ caseId });
  }

  async create(data: Partial<TrialExhibit>): Promise<TrialExhibit> {
    return apiClient.post<TrialExhibit>(this.baseUrl, data);
  }

  // Alias for Repository compatibility
  async add(data: Partial<TrialExhibit>): Promise<TrialExhibit> {
    return this.create(data);
  }

  async update(id: string, data: Partial<TrialExhibit>): Promise<TrialExhibit> {
    return apiClient.put<TrialExhibit>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(
    id: string,
    status: TrialExhibit["status"]
  ): Promise<TrialExhibit> {
    return apiClient.patch<TrialExhibit>(`${this.baseUrl}/${id}/status`, {
      status,
    });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
