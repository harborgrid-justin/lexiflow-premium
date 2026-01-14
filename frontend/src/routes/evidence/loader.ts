/**
 * Evidence Management Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

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
  const evidence = await DataService.evidence.getAll().catch(() => []);

  return {
    evidence: evidence || [],
  };
}
