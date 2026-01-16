/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Rules Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type CourtRule = {
  id: string;
  number: string;
  title: string;
  court: string;
  jurisdiction: string;
  category: string;
  text: string;
  lastUpdated: string;
};

export interface RulesLoaderData {
  rules: CourtRule[];
}

export async function rulesLoader() {
  const rules = await DataService.rules.getAll().catch(() => []);

  return {
    rules: rules || [],
  };
}
