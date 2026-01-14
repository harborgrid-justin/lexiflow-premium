/**
 * Data Platform Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";
import { defer } from "react-router";

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

  return defer({
    sources: sources || [],
  });
}
