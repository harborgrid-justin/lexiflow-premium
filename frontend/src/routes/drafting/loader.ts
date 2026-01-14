/**
 * Drafting Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

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

  return defer({
    drafts: drafts || [],
  });
}
