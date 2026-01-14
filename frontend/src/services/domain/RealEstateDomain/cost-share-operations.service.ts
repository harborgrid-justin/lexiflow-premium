/**
 * RealEstateDomain - Cost Share Operations
 * Cost sharing agreement management
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { RealEstateCostShare } from "./types";

/**
 * Get all cost share agreements
 */
export async function getCostShares(filters?: {
  propertyId?: string;
  status?: string;
}): Promise<RealEstateCostShare[]> {
  try {
    return await apiClient.get<RealEstateCostShare[]>(
      "/real-estate/cost-shares",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getCostShares] Error:", error);
    return [];
  }
}

/**
 * Create a new cost share agreement
 */
export async function createCostShare(
  costShare: Omit<RealEstateCostShare, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateCostShare> {
  return apiClient.post<RealEstateCostShare>(
    "/real-estate/cost-shares",
    costShare
  );
}
