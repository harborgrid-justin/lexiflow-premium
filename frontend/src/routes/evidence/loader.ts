/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Evidence Management Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { discoveryApi } from "@/lib/frontend-api";

type EvidenceItem = {
  id: string;
  caseId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  tags: string[];
  custodian?: string;
  collectedDate: string;
  location?: string;
};

export interface EvidenceLoaderData {
  evidence: EvidenceItem[];
}

export async function evidenceLoader() {
  const result = await discoveryApi.getAllEvidence({ page: 1, limit: 200 });

  return {
    evidence: result.ok ? result.data.data : [],
  };
}
