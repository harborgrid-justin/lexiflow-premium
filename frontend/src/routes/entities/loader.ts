import { DataService } from "@/services/data/data-service.service";
import { type LegalEntity } from "@/types";

export interface EntitiesLoaderData {
  entities: LegalEntity[];
}

export async function clientLoader(): Promise<EntitiesLoaderData> {
  try {
    const entities = await DataService.entities.getAll();
    // Default to empty array if null
    return {
      entities: entities || [],
    };
  } catch (error) {
    console.error("Failed to load entities", error);
    return {
      entities: [],
    };
  }
}

// Support hydration
(clientLoader as unknown as { hydrate: boolean }).hydrate = true;
