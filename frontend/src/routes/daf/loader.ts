/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * DAF (Document Assembly Framework) Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

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

  return {
    templates: templates || [],
  };
}
