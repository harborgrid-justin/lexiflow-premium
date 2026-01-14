/**
 * Citations Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "../../services/data/dataService";

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

export async function citationsLoader(): Promise<CitationsLoaderData> {
  const citations = await DataService.citations.getAll().catch(() => []);

  return {
    citations: citations || [],
  };
}
