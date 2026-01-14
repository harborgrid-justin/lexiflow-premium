/**
 * Pleadings Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

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

export async function pleadingsLoader() {
  const pleadings = await DataService.pleadings.getAll().catch(() => []);

  return defer({
    pleadings: pleadings || [],
  });
}
