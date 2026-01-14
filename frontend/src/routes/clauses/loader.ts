/**
 * Clauses Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

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
