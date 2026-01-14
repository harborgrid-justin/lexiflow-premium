/**
 * Entities Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "../../services/data/dataService";

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

export async function entitiesLoader(): Promise<EntitiesLoaderData> {
  const entities = await DataService.entities.getAll().catch(() => []);

  return {
    entities: entities || [],
  };
}
