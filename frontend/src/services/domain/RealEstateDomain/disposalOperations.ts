/**
 * RealEstateDomain - Disposal Operations
 * Property disposal tracking and management
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { DisposalStatus, RealEstateDisposal } from "./types";

/**
 * Get all disposal records
 */
export async function getDisposals(filters?: {
  status?: DisposalStatus;
  propertyId?: string;
}): Promise<RealEstateDisposal[]> {
  try {
    return await apiClient.get<RealEstateDisposal[]>(
      "/real-estate/disposals",
      filters
    );
  } catch (error) {
    console.error("[RealEstateService.getDisposals] Error:", error);
    return [];
  }
}

/**
 * Create a new disposal record
 */
export async function createDisposal(
  disposal: Omit<RealEstateDisposal, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateDisposal> {
  return apiClient.post<RealEstateDisposal>(
    "/real-estate/disposals",
    disposal
  );
}

/**
 * Update a disposal record
 */
export async function updateDisposal(
  id: string,
  updates: Partial<RealEstateDisposal>
): Promise<RealEstateDisposal> {
  return apiClient.patch<RealEstateDisposal>(
    `/real-estate/disposals/${id}`,
    updates
  );
}

/**
 * Delete a disposal record
 */
export async function deleteDisposal(id: string): Promise<void> {
  return apiClient.delete(`/real-estate/disposals/${id}`);
}
