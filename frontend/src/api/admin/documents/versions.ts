/**
 * Documents Version Operations
 * @module api/admin/documents/versions
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/api-client.service";

import { validateArray, validateId } from "./validation";

import type { DocumentVersion, LegalDocument } from "@/types";

/** Redact document regions */
export async function redact(
  id: string,
  regions: Array<{
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>
): Promise<LegalDocument> {
  validateId(id, "redact");
  validateArray(regions, "regions", "redact");
  try {
    return await apiClient.post<LegalDocument>(`/documents/${id}/redact`, {
      regions,
    });
  } catch (error) {
    console.error("[DocumentsApiService.redact] Error:", error);
    throw new Error(`Failed to redact document with id: ${id}`);
  }
}

/** Get document versions */
export async function getVersions(
  documentId: string
): Promise<DocumentVersion[]> {
  validateId(documentId, "getVersions");
  try {
    const response = await apiClient.get<PaginatedResponse<DocumentVersion>>(
      `/documents/${documentId}/versions`
    );
    return response.data;
  } catch (error) {
    console.error("[DocumentsApiService.getVersions] Error:", error);
    throw new Error(
      `Failed to fetch versions for document with id: ${documentId}`
    );
  }
}

/** Restore a document version */
export async function restoreVersion(
  documentId: string,
  versionId: string
): Promise<LegalDocument> {
  validateId(documentId, "restoreVersion");
  validateId(versionId, "restoreVersion");
  try {
    return await apiClient.post<LegalDocument>(
      `/documents/${documentId}/versions/${versionId}/restore`,
      {}
    );
  } catch (error) {
    console.error("[DocumentsApiService.restoreVersion] Error:", error);
    throw new Error(
      `Failed to restore version ${versionId} for document ${documentId}`
    );
  }
}

/** Compare two document versions */
export async function compareVersions(
  documentId: string,
  versionId: string,
  compareWithId: string
): Promise<{ diff: string }> {
  validateId(documentId, "compareVersions");
  validateId(versionId, "compareVersions");
  validateId(compareWithId, "compareVersions");
  try {
    return await apiClient.get<{ diff: string }>(
      `/documents/${documentId}/versions/${versionId}/compare?compareWith=${compareWithId}`
    );
  } catch (error) {
    console.error("[DocumentsApiService.compareVersions] Error:", error);
    throw new Error(`Failed to compare versions for document ${documentId}`);
  }
}
