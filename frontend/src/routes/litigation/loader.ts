/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Litigation Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { litigationApi } from "@/lib/frontend-api/litigation";

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
  const result = await litigationApi.getAll();
  const matters = result.ok ? (result.data as LitigationMatter[]) : [];

  return {
    matters: matters || [],
  };
}
