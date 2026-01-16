/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Entities Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type Entity = {
  id: string;
  name: string;
  type: "Person" | "Organization" | "Government" | "Trust";
  jurisdiction: string;
  identificationNumber: string;
  relatedCases: number;
  status: "Active" | "Inactive";
};

export interface EntitiesLoaderData {
  entities: Entity[];
}

export async function entitiesLoader() {
  const entities = await DataService.entities.getAll().catch(() => []);

  return {
    entities: entities || [],
  };
}
