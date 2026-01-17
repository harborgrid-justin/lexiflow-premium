/**
 * FeeAgreementsApiService
 * API service split from apiServices.ts
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";

import type { FeeAgreement } from "@/types/financial";

export class FeeAgreementsApiService {
  async getAll(filters?: {
    status?: string;
    clientName?: string;
  }): Promise<FeeAgreement[]> {
    const response = await apiClient.get<PaginatedResponse<FeeAgreement>>(
      "/billing/fee-agreements",
      { params: filters }
    );
    return response.data;
  }

  async getById(id: string): Promise<FeeAgreement> {
    return apiClient.get<FeeAgreement>(`/billing/fee-agreements/${id}`);
  }

  async create(
    agreement: Omit<FeeAgreement, "id" | "createdAt" | "updatedAt">
  ): Promise<FeeAgreement> {
    return apiClient.post<FeeAgreement>("/billing/fee-agreements", agreement);
  }

  async update(
    id: string,
    agreement: Partial<FeeAgreement>
  ): Promise<FeeAgreement> {
    return apiClient.patch<FeeAgreement>(
      `/billing/fee-agreements/${id}`,
      agreement
    );
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/fee-agreements/${id}`);
  }

  async activate(id: string): Promise<FeeAgreement> {
    return apiClient.patch<FeeAgreement>(
      `/billing/fee-agreements/${id}/activate`,
      {}
    );
  }

  async terminate(id: string, reason?: string): Promise<FeeAgreement> {
    return apiClient.patch<FeeAgreement>(
      `/billing/fee-agreements/${id}/terminate`,
      { reason }
    );
  }
}
