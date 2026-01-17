/**
 * ExaminationsApiService
 * API service split from apiServices.ts
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/api-client.service";

import type { Examination } from "@/types/discovery";

export class ExaminationsApiService {
  async getAll(filters?: {
    caseId?: string;
    status?: string;
    type?: string;
  }): Promise<Examination[]> {
    try {
      const response = await apiClient.get<
        PaginatedResponse<Examination> | { items: Examination[] }
      >("/examinations", { params: filters });

      // Handle paginated response
      if (response && typeof response === "object" && "items" in response) {
        return Array.isArray(response.items) ? response.items : [];
      }

      // Handle direct data response
      if (response && typeof response === "object" && "data" in response) {
        return Array.isArray(response.data) ? response.data : [];
      }

      // Handle array response
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback to empty array
      return [];
    } catch (error) {
      console.error("[ExaminationsApiService.getAll] Error:", error);
      return [];
    }
  }

  async getById(id: string): Promise<Examination> {
    return apiClient.get<Examination>(`/examinations/${id}`);
  }

  async create(
    examination: Omit<Examination, "id" | "createdAt" | "updatedAt">
  ): Promise<Examination> {
    return apiClient.post<Examination>("/examinations", examination);
  }

  async update(
    id: string,
    examination: Partial<Examination>
  ): Promise<Examination> {
    return apiClient.patch<Examination>(
      `/discovery/examinations/${id}`,
      examination
    );
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/examinations/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Examination[]> {
    return this.getAll({ caseId });
  }
}
