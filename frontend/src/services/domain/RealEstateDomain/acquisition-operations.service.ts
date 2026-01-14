/**
 * RealEstateDomain - Acquisition Operations
 * Property acquisition tracking and management
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { AcquisitionStatus, RealEstateAcquisition } from "./types";

/**
 * Get all acquisition records
 */
export async function getAcquisitions(filters?: {
  status?: AcquisitionStatus;
}): Promise<RealEstateAcquisition[]> {
  try {
    return await apiClient.get<RealEstateAcquisition[]>(
      "/real-estate/acquisitions",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getAcquisitions] Error:", error);
    return [];
  }
}

/**
 * Create a new acquisition record
 */
export async function createAcquisition(
  acquisition: Omit<RealEstateAcquisition, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateAcquisition> {
  return apiClient.post<RealEstateAcquisition>(
    "/real-estate/acquisitions",
    acquisition
  );
}

/**
 * Update an acquisition record
 */
export async function updateAcquisition(
  id: string,
  updates: Partial<RealEstateAcquisition>
): Promise<RealEstateAcquisition> {
  return apiClient.patch<RealEstateAcquisition>(
    `/real-estate/acquisitions/${id}`,
    updates
  );
}
