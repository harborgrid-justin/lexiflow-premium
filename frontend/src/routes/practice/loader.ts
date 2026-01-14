/**
 * Practice Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

type PracticeArea = {
  id: string;
  name: string;
  category: string;
  activeCases: number;
  specialists: string[];
  description: string;
};

export interface PracticeLoaderData {
  areas: PracticeArea[];
}

export async function practiceLoader() {
  const areas = await DataService.practice.getAll().catch(() => []);

  return {
    areas: areas || [],
  };
}
