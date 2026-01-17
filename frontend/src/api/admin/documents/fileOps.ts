/**
 * Documents File Operations
 * @module api/admin/documents/fileOps
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import {
  validateArray,
  validateFile,
  validateId,
  validateObject,
} from "./validation";

import type { LegalDocument } from "@/types";

/** Upload a document file with metadata */
export async function upload(
  file: File,
  metadata: Record<string, unknown>,
): Promise<LegalDocument> {
  validateFile(file, "upload");
  validateObject(metadata, "metadata", "upload");
  try {
    return await apiClient.upload<LegalDocument>(
      "/documents/upload",
      file,
      metadata,
    );
  } catch (error) {
    console.error("[DocumentsApiService.upload] Error:", error);
    throw new Error("Failed to upload document");
  }
}

/** Bulk upload multiple documents */
export async function bulkUpload(
  files: File[],
  metadata: Record<string, string>,
): Promise<LegalDocument[]> {
  validateArray(files, "files", "bulkUpload");
  validateObject(metadata, "metadata", "bulkUpload");
  files.forEach((f, i) => {
    if (!(f instanceof File)) throw new Error(`Invalid file at index ${i}`);
  });

  try {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    Object.keys(metadata).forEach((k) => {
      const value = metadata[k];
      if (value !== undefined && value !== null) {
        formData.append(k, value);
      }
    });

    const token = localStorage.getItem("lexiflow_auth_token");
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await fetch(
      `${apiClient.getBaseUrl()}/documents/bulk-upload`,
      { method: "POST", headers, body: formData },
    );
    if (!response.ok) throw new Error(`Bulk upload failed: ${response.status}`);
    const payload: LegalDocument[] = (await response.json()) as LegalDocument[];
    return payload;
  } catch (error) {
    console.error("[DocumentsApiService.bulkUpload] Error:", error);
    throw new Error("Failed to bulk upload documents");
  }
}

/** Download a document file */
export async function download(id: string): Promise<Blob> {
  validateId(id, "download");
  try {
    // Use apiClient's built-in fetch with proper headers
    return await apiClient.get<Blob>(`/documents/${id}/download`);
  } catch (error) {
    console.error("[DocumentsApiService.download] Error:", error);
    throw new Error(`Failed to download document with id: ${id}`);
  }
}

/** Get document preview URL */
export async function preview(id: string): Promise<string> {
  validateId(id, "preview");
  try {
    const response = await apiClient.get<{ url: string }>(
      `/documents/${id}/preview`,
    );
    return response.url;
  } catch (error) {
    console.error("[DocumentsApiService.preview] Error:", error);
    throw new Error(`Failed to generate preview for document with id: ${id}`);
  }
}
