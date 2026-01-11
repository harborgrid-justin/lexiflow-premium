/**
 * RealEstateDomain - Encroachment Operations
 * Encroachment tracking and resolution management
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { EncroachmentStatus, RealEstateEncroachment } from "./types";

/**
 * Get all encroachment records
 */
export async function getEncroachments(filters?: {
  status?: EncroachmentStatus;
  propertyId?: string;
}): Promise<RealEstateEncroachment[]> {
  try {
    return await apiClient.get<RealEstateEncroachment[]>(
      "/real-estate/encroachments",
      filters
    );
  } catch (error) {
    console.error("[RealEstateService.getEncroachments] Error:", error);
    return [];
  }
}

/**
 * Create a new encroachment record
 */
export async function createEncroachment(
  encroachment: Omit<RealEstateEncroachment, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateEncroachment> {
  return apiClient.post<RealEstateEncroachment>(
    "/real-estate/encroachments",
    encroachment
  );
}

/**
 * Update an encroachment record
 */
export async function updateEncroachment(
  id: string,
  updates: Partial<RealEstateEncroachment>
): Promise<RealEstateEncroachment> {
  return apiClient.patch<RealEstateEncroachment>(
    `/real-estate/encroachments/${id}`,
    updates
  );
}

/**
 * Resolve an encroachment
 */
export async function resolveEncroachment(
  id: string,
  resolution: { method: string; notes?: string }
): Promise<RealEstateEncroachment> {
  return apiClient.post<RealEstateEncroachment>(
    `/real-estate/encroachments/${id}/resolve`,
    resolution
  );
}
