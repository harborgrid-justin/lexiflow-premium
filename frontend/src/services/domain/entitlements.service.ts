// ================================================================================
// ENTITLEMENTS SERVICE - DOMAIN SERVICE LAYER
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context (state) → Service (effects) → Frontend API (HTTP)
//
// PURPOSE:
//   - Derives entitlements from user role and organization
//   - Fetches organization data when needed
//   - Provides domain-level entitlements logic
//   - Never called by views directly (only by EntitlementsContext)
//
// ================================================================================

import { apiClient } from "@/services/infrastructure/api-client.service";
import { OrganizationTypeEnum } from "@/types";

import type { Organization, User } from "@/types";

export type Plan = "free" | "pro" | "enterprise";

export interface Entitlements {
  plan: Plan;
  canUseAdminTools: boolean;
  maxCases: number;
  storageLimitGB: number;
}

const DEFAULT_ENTITLEMENTS: Entitlements = {
  plan: "free",
  canUseAdminTools: false,
  maxCases: 5,
  storageLimitGB: 1,
};

export class EntitlementsService {
  /**
   * Derive entitlements from user data
   * May fetch organization details if needed
   */
  static async deriveFromUser(user: User): Promise<Entitlements> {
    try {
      let plan: Plan = "free";
      let canUseAdminTools = false;
      let maxCases = 10;
      let storageLimitGB = 5;

      // Map from UserRole
      if (user.role === "Administrator") {
        plan = "enterprise";
        canUseAdminTools = true;
        maxCases = 10000;
        storageLimitGB = 10000;
      } else if (user.role === "Senior Partner" || user.role === "Associate") {
        plan = "pro";
        maxCases = 500;
        storageLimitGB = 100;

        // Fetch organization details if available
        if (user.orgId) {
          try {
            const org = await this.fetchOrganization(user.orgId);
            const orgEntitlements = this.deriveFromOrganization(org);

            // Override with org-level entitlements
            plan = orgEntitlements.plan;
            maxCases = orgEntitlements.maxCases;
            storageLimitGB = orgEntitlements.storageLimitGB;
          } catch (err) {
            console.warn(
              "Could not fetch organization details, using role-based entitlements",
              err,
            );
          }
        }
      } else if (user.role === "Paralegal") {
        plan = "pro";
        maxCases = 100;
        storageLimitGB = 50;
      } else {
        // Client User, Guest, etc.
        plan = "free";
        maxCases = 5;
        storageLimitGB = 1;
      }

      return {
        plan,
        canUseAdminTools,
        maxCases,
        storageLimitGB,
      };
    } catch (err) {
      console.error("Failed to derive entitlements", err);
      return DEFAULT_ENTITLEMENTS;
    }
  }

  /**
   * Fetch organization data from API
   */
  private static async fetchOrganization(orgId: string): Promise<Organization> {
    const org = await apiClient.get<Organization>(`/organizations/${orgId}`);
    return org;
  }

  /**
   * Derive entitlements from organization data
   */
  private static deriveFromOrganization(org: Organization): Entitlements {
    let plan: Plan = "pro";
    let maxCases = 500;
    let storageLimitGB = 100;

    // Example mapping based on organization type
    if (
      org.organizationType === OrganizationTypeEnum.CORPORATION ||
      org.organizationType === OrganizationTypeEnum.LLC ||
      org.organizationType === OrganizationTypeEnum.PARTNERSHIP
    ) {
      plan = "enterprise";
      maxCases = 10000;
      storageLimitGB = 10000;
    }

    return {
      plan,
      canUseAdminTools: false, // Org data doesn't affect admin tools
      maxCases,
      storageLimitGB,
    };
  }
}
