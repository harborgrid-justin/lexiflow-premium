/**
 * RealEstateDomain - Utilization Operations
 * Property utilization tracking and assessment
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { RealEstateUtilization } from "./types";

/**
 * Get utilization data for all properties
 */
export async function getUtilization(filters?: {
  propertyId?: string;
  minRate?: number;
  maxRate?: number;
}): Promise<RealEstateUtilization[]> {
  try {
    return await apiClient.get<RealEstateUtilization[]>(
      "/real-estate/utilization",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getUtilization] Error:", error);
    return [];
  }
}

/**
 * Update utilization record
 */
export async function updateUtilization(
  id: string,
  updates: Partial<RealEstateUtilization>
): Promise<RealEstateUtilization> {
  return apiClient.patch<RealEstateUtilization>(
    `/real-estate/utilization/${id}`,
    updates
  );
}
