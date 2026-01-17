/**
 * Pleadings Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

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

export async function clientLoader(): Promise<PleadingsLoaderData> {
  try {
    const pleadings = await DataService.pleadings.getAll();

    return {
      pleadings: pleadings ?? [],
    };
  } catch (error: unknown) {
    console.error("Failed to load pleadings:", error);
    return {
      pleadings: [],
    };
  }
}
