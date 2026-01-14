/**
 * Jurisdiction Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

type Jurisdiction = {
  id: string;
  name: string;
  type: "Federal" | "State" | "Local";
  court: string;
  rules: string[];
  filingRequirements: string[];
};

export interface JurisdictionLoaderData {
  jurisdictions: Jurisdiction[];
}

export async function jurisdictionLoader() {
  const jurisdictions = await DataService.jurisdiction.getAll().catch(() => []);

  return defer({
    jurisdictions: jurisdictions || [],
  });
}
