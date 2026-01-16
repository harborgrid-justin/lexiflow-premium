/**
 * Library Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { knowledgeApi } from "@/lib/frontend-api";

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
  const result = await knowledgeApi.getAllKnowledge({ page: 1, limit: 200 });
  const items = result.ok
    ? result.data.data.map((item) => ({
        id: item.id,
        title: item.title,
        type: "Guide",
        category: "General",
        description: item.content,
        useCount: 0,
      }))
    : [];

  return {
    items: items || [],
  };
}
