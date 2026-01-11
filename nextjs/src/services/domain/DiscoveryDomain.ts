/**
 * @module DiscoveryDomain
 * @description Enterprise discovery and evidence management service
 */

import { api } from "@/api";
import { EvidenceItem } from "@/types";

export const DiscoveryService = {
  getEvidence: async (caseId?: string): Promise<EvidenceItem[]> => {
    try {
      const evidence = await api.evidence.getAll(caseId);
      return evidence;
    } catch (e) {
      console.error("Failed to fetch evidence", e);
      return [];
    }
  },

  getStats: async () => {
    try {
      // Aggregate from real data or call a stats endpoint if available
      // For now, we fetch all evidence and aggregate client-side or assume an endpoint will be added
      const evidence = await api.evidence.getAll();
      const total = evidence.length;
      const inCustody = evidence.filter(
        (e) => e.status === "In Custody"
      ).length; // Ensure status matches string literal if strict
      const pending = evidence.filter((e) => e.status === "Pending").length;

      return {
        total,
        inCustody,
        pending,
      };
    } catch {
      return { total: 0, inCustody: 0, pending: 0 };
    }
  },
};
