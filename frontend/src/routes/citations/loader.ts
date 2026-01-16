/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Citations Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { knowledgeApi } from "@/lib/frontend-api";

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
  const result = await knowledgeApi.getAllCitations({ page: 1, limit: 200 });
  const citations = result.ok ? result.data.data : [];

  return {
    citations: citations || [],
  };
}
