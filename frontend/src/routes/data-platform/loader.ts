/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Data Platform Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type DataSource = {
  id: string;
  name: string;
  type: "Database" | "API" | "File" | "Stream";
  status: "Connected" | "Disconnected" | "Error";
  recordCount: number;
  lastSync: string;
};

export interface DataPlatformLoaderData {
  sources: DataSource[];
}

export async function dataPlatformLoader() {
  const sources = await DataService.dataPlatform.getAll().catch(() => []);

  return {
    sources: sources || [],
  };
}
