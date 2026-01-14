/**
 * DAF (Document Assembly Framework) Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

type AssemblyTemplate = {
  id: string;
  name: string;
  category: string;
  fields: number;
  complexity: "Simple" | "Moderate" | "Complex";
  usageCount: number;
  lastUsed?: string;
};

export interface DAFLoaderData {
  templates: AssemblyTemplate[];
}

export async function dafLoader() {
  const templates = await DataService.daf.getAll().catch(() => []);

  return defer({
    templates: templates || [],
  });
}
