/**
 * Documents Query Operations
 * @module api/admin/documents/queries
 */

import { apiClient } from "@/services/infrastructure/api-client.service";
import type { LegalDocument } from "@/types";
import { getAll } from "./crud";
import { validateId } from "./validation";

/** Get documents by case ID */
export async function getByCaseId(caseId: string): Promise<LegalDocument[]> {
  validateId(caseId, "getByCaseId");
  return getAll({ caseId });
}

/** Get document folders */
export async function getFolders(): Promise<unknown[]> {
  try {
    return await apiClient.get<unknown[]>("/documents/folders/list");
  } catch (error) {
    console.error("[DocumentsApiService.getFolders] Error:", error);
    throw new Error("Failed to fetch document folders");
  }
}

/** Get document content/text */
export async function getContent(id: string): Promise<string> {
  validateId(id, "getContent");
  try {
    const response = await apiClient.get<{ content: string }>(
      `/documents/${id}/content`
    );
    return response.content;
  } catch (error) {
    console.error("[DocumentsApiService.getContent] Error:", error);
    throw new Error(`Failed to fetch content for document with id: ${id}`);
  }
}

/** Get document statistics for filters */
export async function getStats(): Promise<{
  smartViews: { id: string; count: number }[];
  facets: {
    fileType: { id: string; count: number }[];
    status: { id: string; count: number }[];
  };
}> {
  try {
    const response = await apiClient.get<{
      smartViews: { id: string; count: number }[];
      facets: {
        fileType: { id: string; count: number }[];
        status: { id: string; count: number }[];
      };
    }>("/documents/stats");
    if (response) return response;
    // Fallback if null
    return { smartViews: [], facets: { fileType: [], status: [] } };
  } catch (error) {
    console.warn(
      "[DocumentsApiService.getStats] Failed to fetch stats, returning empty:",
      error
    );
    return {
      smartViews: [],
      facets: { fileType: [], status: [] },
    };
  }
}
