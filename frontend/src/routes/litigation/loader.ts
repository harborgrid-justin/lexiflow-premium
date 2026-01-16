/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Litigation Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type LitigationMatter = {
  id: string;
  caseId: string;
  caseName: string;
  stage: "Discovery" | "Pre-Trial" | "Trial" | "Appeal" | "Closed";
  nextHearing: string;
  strategy: string;
  riskLevel: "Low" | "Medium" | "High";
};

export interface LitigationLoaderData {
  matters: LitigationMatter[];
}

export async function litigationLoader() {
  const matters = await DataService.litigation.getAll().catch(() => []);

  return {
    matters: matters || [],
  };
}
