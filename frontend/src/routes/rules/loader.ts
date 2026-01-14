/**
 * Rules Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

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

  return defer({
    rules: rules || [],
  });
}
