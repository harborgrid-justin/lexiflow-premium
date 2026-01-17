/**
 * RealEstateDomain - Other Financial Operations
 * Solicitations and relocations management
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type {
  RealEstateRelocation,
  RealEstateSolicitation,
  SolicitationStatus,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────
// SOLICITATION OPERATIONS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Get all solicitation records
 */
export async function getSolicitations(filters?: {
  status?: SolicitationStatus;
}): Promise<RealEstateSolicitation[]> {
  try {
    return await apiClient.get<RealEstateSolicitation[]>(
      "/real-estate/solicitations",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getSolicitations] Error:", error);
    return [];
  }
}

/**
 * Create a new solicitation
 */
export async function createSolicitation(
  solicitation: Omit<RealEstateSolicitation, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateSolicitation> {
  return apiClient.post<RealEstateSolicitation>(
    "/real-estate/solicitations",
    solicitation
  );
}

// ─────────────────────────────────────────────────────────────────────────
// RELOCATION OPERATIONS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Get all relocation records
 */
export async function getRelocations(filters?: {
  status?: string;
}): Promise<RealEstateRelocation[]> {
  try {
    return await apiClient.get<RealEstateRelocation[]>(
      "/real-estate/relocations",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getRelocations] Error:", error);
    return [];
  }
}

/**
 * Create a new relocation record
 */
export async function createRelocation(
  relocation: Omit<RealEstateRelocation, "id" | "createdAt" | "updatedAt">
): Promise<RealEstateRelocation> {
  return apiClient.post<RealEstateRelocation>(
    "/real-estate/relocations",
    relocation
  );
}
