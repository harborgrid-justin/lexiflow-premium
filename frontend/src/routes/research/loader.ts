/**
 * Legal Research Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "../../services/data/dataService";
import type { Citation, ResearchQuery } from "../../types";

export interface ResearchLoaderData {
  recentSearches: ResearchQuery[];
  savedResearch: ResearchQuery[];
  citations: Citation[];
}

export async function researchLoader(): Promise<ResearchLoaderData> {
  const [recentSearches, savedResearch, citations] = await Promise.all([
    DataService.research.getHistory().catch(() => []),
    DataService.research.getSaved().catch(() => []),
    DataService.citations.getAll().catch(() => []),
  ]);

  return {
    recentSearches: recentSearches || [],
    savedResearch: savedResearch || [],
    citations: citations || [],
  };
}
