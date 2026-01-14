/**
 * Pleadings Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "../../services/data/dataService";

type Pleading = {
  id: string;
  title: string;
  type: string;
  caseId: string;
  filedDate: string;
  status: "Draft" | "Filed" | "Approved" | "Rejected";
  documentId?: string;
};

export interface PleadingsLoaderData {
  pleadings: Pleading[];
}

export async function pleadingsLoader(): Promise<PleadingsLoaderData> {
  const pleadings = await DataService.pleadings.getAll().catch(() => []);

  return {
    pleadings: pleadings || [],
  };
}
