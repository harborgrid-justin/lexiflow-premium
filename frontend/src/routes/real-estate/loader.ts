/**
 * Real Estate Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type RealEstateProperty = {
  id: string;
  address: string;
  type: "Residential" | "Commercial" | "Industrial" | "Land";
  status: "Active" | "Pending" | "Closed" | "Disputed";
  value: number;
  caseId?: string;
  documents: string[];
  lastUpdated: string;
};

export interface RealEstateLoaderData {
  properties: RealEstateProperty[];
}

export async function realEstateLoader() {
  const properties = await DataService.realEstate.getAll().catch(() => []);

  return {
    properties: properties || [],
  };
}
