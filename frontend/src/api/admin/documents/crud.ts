/**
 * Documents CRUD Operations
 * @module api/admin/documents/crud
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";
import type { LegalDocument } from "@/types";
import { validateId, validateObject } from "./validation";

/** Get all documents with optional filters */
export async function getAll(filters?: {
  caseId?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<LegalDocument[]> {
  try {
    const response = await apiClient.get<
      PaginatedResponse<LegalDocument> | LegalDocument[]
    >("/documents", filters);

    // Handle paginated response
    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      Array.isArray((response as PaginatedResponse<LegalDocument>).data)
    ) {
      return (response as PaginatedResponse<LegalDocument>).data;
    }

    // Handle wrapped paginated response (e.g. { success: true, data: { data: [], ... } })
    // This happens when NestJS interceptors wrap the response
    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      typeof (response as { data: unknown }).data === "object" &&
      (response as { data: unknown }).data !== null &&
      "data" in ((response as { data: unknown }).data as object) &&
      Array.isArray(
        ((response as { data: { data: unknown } }).data as { data: unknown })
          .data
      )
    ) {
      return (response as { data: { data: LegalDocument[] } }).data.data;
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      return response as LegalDocument[];
    }

    console.warn(
      "[DocumentsApiService.getAll] Invalid response format, expected data array or array. Received:",
      JSON.stringify(response).substring(0, 200)
    );
    return [];
  } catch (error) {
    console.error("[DocumentsApiService.getAll] Error:", error);
    throw new Error("Failed to fetch documents");
  }
}

/** Get document by ID */
export async function getById(id: string): Promise<LegalDocument> {
  validateId(id, "getById");
  try {
    const response = await apiClient.get<
      { success?: boolean; data?: LegalDocument } | LegalDocument
    >(`/documents/${id}`);

    // Unpack response if wrapped
    if (
      response &&
      "success" in response &&
      response.success === true &&
      response.data
    ) {
      return response.data;
    }

    return response as LegalDocument;
  } catch (error) {
    console.error("[DocumentsApiService.getById] Error:", error);
    throw new Error(`Failed to fetch document with id: ${id}`);
  }
}

/** Add a new document */
export async function add(
  doc: Omit<LegalDocument, "id" | "createdAt" | "updatedAt">
): Promise<LegalDocument> {
  validateObject(doc, "doc", "add");
  if (!doc.title)
    throw new Error("[DocumentsApiService.add] Document title is required");

  const createDto: Record<string, unknown> = {
    title: doc.title,
    description: doc.description,
    type: doc.type,
    caseId: doc.caseId,
    creatorId:
      doc.creatorId || doc.authorId || "00000000-0000-0000-0000-000000000000",
    status: doc.status,
    filename: doc.filename,
    filePath: doc.filePath,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    checksum: doc.checksum,
    author: doc.author,
    tags: doc.tags || [],
    customFields: doc.customFields,
  };
  Object.keys(createDto).forEach(
    (k) => createDto[k] === undefined && delete createDto[k]
  );

  try {
    return await apiClient.post<LegalDocument>("/documents", createDto);
  } catch (error) {
    console.error("[DocumentsApiService.add] Error:", error);
    throw new Error("Failed to create document");
  }
}

/** Update an existing document */
export async function update(
  id: string,
  doc: Partial<LegalDocument>
): Promise<LegalDocument> {
  validateId(id, "update");
  validateObject(doc, "doc", "update");
  try {
    return await apiClient.put<LegalDocument>(`/documents/${id}`, doc);
  } catch (error) {
    console.error("[DocumentsApiService.update] Error:", error);
    throw new Error(`Failed to update document with id: ${id}`);
  }
}

/** Delete a document */
export async function deleteDoc(id: string): Promise<void> {
  validateId(id, "delete");
  try {
    await apiClient.delete(`/documents/${id}`);
  } catch (error) {
    console.error("[DocumentsApiService.delete] Error:", error);
    throw new Error(`Failed to delete document with id: ${id}`);
  }
}
