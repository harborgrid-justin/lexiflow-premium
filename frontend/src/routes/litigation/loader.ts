/**
 * Litigation Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

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

  return defer({
    matters: matters || [],
  });
}
