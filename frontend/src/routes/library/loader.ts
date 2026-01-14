/**
 * Library Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { defer } from "react-router";
import { DataService } from "../../services/data/dataService";

type LibraryItem = {
  id: string;
  title: string;
  type: "Template" | "Form" | "Precedent" | "Guide";
  category: string;
  description: string;
  lastUsed?: string;
  useCount: number;
};

export interface LibraryLoaderData {
  items: LibraryItem[];
}

export async function libraryLoader() {
  const items = await DataService.library.getAll().catch(() => []);

  return defer({
    items: items || [],
  });
}
