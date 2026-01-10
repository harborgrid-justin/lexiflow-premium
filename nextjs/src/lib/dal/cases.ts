// DAL: Data Access Layer for Cases (Server-Side Only)
// Direct-to-Backend communication, intended for React Server Components

import "server-only";
import { ServerAPI } from "@/lib/server-api";
import { Case } from "@/types/case";

// Use the central types instead of redefining locally

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    hasNextPage: boolean;
  };
}

export const getCases = async (): Promise<Case[]> => {
  try {
    return await ServerAPI.get<Case[]>("/api/cases", {
      tags: ["cases"],
    });
  } catch {
    console.error("Failed to fetch cases:", error);
    return [];
  }
};

export const getCaseById = async (id: string): Promise<Case | null> => {
  try {
    return await ServerAPI.get<Case>(`/api/cases/${id}`, {
      tags: [`case-${id}`],
    });
  } catch {
    // Return null so the page can handle 404 with notFound()
    return null;
  }
};

export const createCase = async (data: Partial<Case>): Promise<Case> => {
  return ServerAPI.post<Case>("/api/cases", data, {
    tags: ["cases"], // Invalidate list
  });
};

export const updateCase = async (
  id: string,
  data: Partial<Case>
): Promise<Case> => {
  return ServerAPI.patch<Case>(`/api/cases/${id}`, data, {
    tags: [`case-${id}`, "cases"],
  });
};
