/**
 * RealEstateDomain - Outgrant Operations
 * Outgrant and leasing management
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { OutgrantStatus, RealEstateOutgrant } from "./types";

/**
 * Get all outgrant records
 */
export async function getOutgrants(filters?: {
  status?: OutgrantStatus;
  propertyId?: string;
}): Promise<RealEstateOutgrant[]> {
  try {
    return await apiClient.get<RealEstateOutgrant[]>(
      "/real-estate/outgrants",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getOutgrants] Error:", error);
    return [];
  }
}

/**
 * Create a new outgrant record
 */
export async function createOutgrant(
  outgrant: Omit<RealEstateOutgrant, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateOutgrant> {
  return apiClient.post<RealEstateOutgrant>(
    "/real-estate/outgrants",
    outgrant
  );
}
