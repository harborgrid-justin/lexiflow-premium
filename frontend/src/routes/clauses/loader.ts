/**
 * Clauses Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

type Clause = {
  id: string;
  title: string;
  category: string;
  text: string;
  language: string;
  tags: string[];
  useCount: number;
  lastUsed?: string;
};

export interface ClausesLoaderData {
  clauses: Clause[];
}

export async function clausesLoader() {
  const clauses = await DataService.clauses.getAll().catch(() => []);

  return defer({
    clauses: clauses || [],
  });
}
