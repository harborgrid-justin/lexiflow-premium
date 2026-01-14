/**
 * Documents Frontend API
 * Enterprise-grade API layer for document management
 *
 * @module lib/frontend-api/documents
 * @description Domain-level contract for document operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * Covers:
 * - Document CRUD operations
 * - Document uploads and processing
 * - Document versioning
 * - Search and filtering
 * - Access control
 * - Metadata management
 *
 * @example
 * ```typescript
 * // Fetch all documents for a case
 * const result = await documents.getAllDocuments({ caseId: 'case-123' });
 * if (!result.ok) {
 *   console.error(result.error.message);
 *   return;
 * }
 * const docs = result.data;
 * ```
 */

import type { Document } from "@/types";
import {
  client,
  failure,
  NotFoundError,
  type PaginatedResult,
  type Result,
  success,
  ValidationError,
} from "./index";

/**
 * Document query filters
 */
export interface DocumentFilters {
  caseId?: string;
  status?: string;
  type?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title" | "fileSize";
  sortOrder?: "asc" | "desc";
}

/**
 * Document creation input
 */
export interface CreateDocumentInput {
  caseId: string;
  title: string;
  description?: string;
  type?: string;
  file?: File;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

/**
 * Document update input
 */
export interface UpdateDocumentInput {
  title?: string;
  description?: string;
  status?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Document upload response
 */
export interface DocumentUploadResult {
  id: string;
  title: string;
  fileSize: number;
  uploadedAt: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
}

/**
 * Get all documents with optional filtering
 */
export async function getAllDocuments(
  filters?: DocumentFilters
): Promise<Result<PaginatedResult<Document>>> {
  const params: Record<string, string | number> = {};

  if (filters?.caseId) params.caseId = filters.caseId;
  if (filters?.type) params.type = filters.type;
  if (filters?.status) params.status = filters.status;
  if (filters?.search) params.search = filters.search;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;
  if (filters?.tags && filters.tags.length > 0) {
    params.tags = filters.tags.join(",");
  }

  const result = await client.get<unknown>("/documents", { params });

  if (!result.ok) {
    return result;
  }

  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: items as Document[],
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: string): Promise<Result<Document>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid document ID is required"));
  }

  const result = await client.get<Document>(`/documents/${id}`);

  if (!result.ok) {
    return result;
  }

  if (!result.data) {
    return failure(new NotFoundError(`Document ${id} not found`));
  }

  return success(result.data);
}

/**
 * Create document metadata (without file upload)
 */
export async function createDocument(
  input: CreateDocumentInput
): Promise<Result<Document>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Document input is required"));
  }

  if (!input.caseId || typeof input.caseId !== "string") {
    return failure(new ValidationError("Case ID is required"));
  }

  if (!input.title || typeof input.title !== "string") {
    return failure(new ValidationError("Document title is required"));
  }

  const result = await client.post<Document>("/documents", input);

  if (!result.ok) {
    return result;
  }

  return success(result.data);
}

/**
 * Update document metadata
 */
export async function updateDocument(
  id: string,
  input: UpdateDocumentInput
): Promise<Result<Document>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid document ID is required"));
  }

  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    return failure(new ValidationError("At least one field must be updated"));
  }

  const result = await client.patch<Document>(`/documents/${id}`, input);

  if (!result.ok) {
    return result;
  }

  return success(result.data);
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid document ID is required"));
  }

  return client.delete<void>(`/documents/${id}`);
}

/**
 * Upload document file
 */
export async function uploadDocument(
  file: File,
  metadata: {
    caseId: string;
    title?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }
): Promise<Result<DocumentUploadResult>> {
  if (!file || !(file instanceof File)) {
    return failure(new ValidationError("Valid file is required"));
  }

  if (!metadata.caseId || typeof metadata.caseId !== "string") {
    return failure(new ValidationError("Case ID is required"));
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("caseId", metadata.caseId);
  if (metadata.title) formData.append("title", metadata.title);
  if (metadata.tags) {
    formData.append("tags", JSON.stringify(metadata.tags));
  }
  if (metadata.metadata) {
    formData.append("metadata", JSON.stringify(metadata.metadata));
  }

  const result = await client.post<DocumentUploadResult>(
    "/documents/upload",
    formData
  );

  return result;
}

/**
 * Search documents by text query
 */
export async function searchDocuments(
  query: string,
  caseId?: string,
  options?: { limit?: number }
): Promise<Result<Document[]>> {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return failure(new ValidationError("Search query is required"));
  }

  const params: Record<string, string | number> = { q: query.trim() };
  if (caseId) params.caseId = caseId;
  if (options?.limit) params.limit = options.limit;

  const result = await client.get<unknown>("/documents/search", { params });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items as Document[]);
}

/**
 * Get document download URL
 */
export async function getDocumentDownloadUrl(
  id: string
): Promise<Result<{ url: string }>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid document ID is required"));
  }

  return client.get<{ url: string }>(`/documents/${id}/download-url`);
}

/**
 * Get document by case ID
 */
export async function getDocumentsByCase(
  caseId: string
): Promise<Result<Document[]>> {
  if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
    return failure(new ValidationError("Valid case ID is required"));
  }

  const result = await getAllDocuments({ caseId, limit: 1000 });

  if (!result.ok) {
    return result;
  }

  return success(result.data.data);
}

/**
 * Documents API module
 */
export const documentsApi = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocument,
  searchDocuments,
  getDocumentDownloadUrl,
  getDocumentsByCase,
} as const;
