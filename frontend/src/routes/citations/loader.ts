/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Citations Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type Citation = {
  id: string;
  caseTitle: string;
  citation: string;
  year: number;
  court: string;
  jurisdiction: string;
  summary: string;
  relevance: "High" | "Medium" | "Low";
  tags: string[];
};

export interface CitationsLoaderData {
  citations: Citation[];
}

export async function citationsLoader() {
  const citations = await DataService.citations.getAll().catch(() => []);

  return {
    citations: citations || [],
  };
}
