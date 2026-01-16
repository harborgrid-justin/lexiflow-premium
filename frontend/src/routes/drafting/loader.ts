/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Drafting Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type DraftDocument = {
  id: string;
  title: string;
  type: string;
  status: "Draft" | "Review" | "Final";
  caseId?: string;
  author: string;
  wordCount: number;
  lastModified: string;
};

export interface DraftingLoaderData {
  drafts: DraftDocument[];
}

export async function draftingLoader() {
  const drafts = await DataService.drafting.getAll().catch(() => []);

  return {
    drafts: drafts || [],
  };
}
