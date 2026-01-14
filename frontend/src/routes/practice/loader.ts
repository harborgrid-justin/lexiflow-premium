/**
 * Practice Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

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

  return defer({
    areas: areas || [],
  });
}
