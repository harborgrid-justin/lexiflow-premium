/**
 * CustodiansApiService
 * API service split from apiServices.ts
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";

export interface Custodian {
  id: string;
  caseId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "On Hold" | "Released" | "Pending";
  legalHoldId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class CustodiansApiService {
  async getAll(filters?: {
    caseId?: string;
    status?: string;
  }): Promise<Custodian[]> {
    const response = await apiClient.get<PaginatedResponse<Custodian>>(
      "/custodians",
      { params: filters },
    );

    // Handle direct array response
    if (Array.isArray(response)) {
      return response as Custodian[];
    }

    // Backend returns paginated response, extract items
    const paginatedResponse =
      response as unknown as PaginatedResponse<Custodian>;
    const items =
      (paginatedResponse as unknown as { items?: Custodian[] }).items ??
      paginatedResponse.data ??
      [];
    return Array.isArray(items) ? items : [];
  }

  async getById(id: string): Promise<Custodian> {
    return apiClient.get<Custodian>(`/custodians/${id}`);
  }

  async create(
    custodian: Omit<Custodian, "id" | "createdAt" | "updatedAt">,
  ): Promise<Custodian> {
    return apiClient.post<Custodian>("/custodians", custodian);
  }

  async update(id: string, custodian: Partial<Custodian>): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/custodians/${id}`, custodian);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/custodians/${id}`);
  }

  async placeOnHold(id: string): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/custodians/${id}/hold`, {
      status: "On Hold",
      holdDate: new Date().toISOString(),
    });
  }

  async release(id: string): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/custodians/${id}/release`, {
      status: "Released",
      releaseDate: new Date().toISOString(),
    });
  }

  async getByCaseId(caseId: string): Promise<Custodian[]> {
    return this.getAll({ caseId });
  }
}

// Export the service instance
export const custodiansApi = new CustodiansApiService();
