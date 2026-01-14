/**
 * RealEstateDomain - Audit & Portfolio Operations
 * Audit readiness, portfolio stats, and user management
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { PortfolioStats, RealEstateAuditItem } from "./types";

// ─────────────────────────────────────────────────────────────────────────
// AUDIT READINESS OPERATIONS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Get audit readiness items
 */
export async function getAuditItems(filters?: {
  propertyId?: string;
  status?: string;
}): Promise<RealEstateAuditItem[]> {
  try {
    return await apiClient.get<RealEstateAuditItem[]>(
      "/real-estate/audit-items",
      { params: filters }
    );
  } catch (error) {
    console.error("[RealEstateService.getAuditItems] Error:", error);
    return [];
  }
}

/**
 * Update audit item status
 */
export async function updateAuditItem(
  id: string,
  updates: Partial<RealEstateAuditItem>
): Promise<RealEstateAuditItem> {
  return apiClient.patch<RealEstateAuditItem>(
    `/real-estate/audit-items/${id}`,
    updates
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PORTFOLIO STATISTICS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Get portfolio summary statistics
 */
export async function getPortfolioStats(): Promise<PortfolioStats> {
  try {
    return await apiClient.get<PortfolioStats>("/real-estate/portfolio/stats");
  } catch (error) {
    console.error("[RealEstateService.getPortfolioStats] Error:", error);
    return {
      totalProperties: 0,
      totalValue: 0,
      activeProperties: 0,
      pendingAcquisitions: 0,
      pendingDisposals: 0,
      activeEncroachments: 0,
      avgUtilizationRate: 0,
      totalSquareFootage: 0,
      totalAcreage: 0,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT FOR REAL ESTATE MODULE
// ─────────────────────────────────────────────────────────────────────────

/**
 * Get users with real estate module access
 */
export async function getModuleUsers(): Promise<
  Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    lastActive?: string;
  }>
> {
  try {
    return await apiClient.get("/real-estate/users");
  } catch (error) {
    console.error("[RealEstateService.getModuleUsers] Error:", error);
    return [];
  }
}

/**
 * Update user permissions for real estate module
 */
export async function updateUserPermissions(
  userId: string,
  permissions: string[]
): Promise<void> {
  return apiClient.patch(`/real-estate/users/${userId}/permissions`, {
    permissions,
  });
}
