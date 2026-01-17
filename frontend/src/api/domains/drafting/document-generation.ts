/**
 * Document Generation API
 * Generate and manage generated documents
 */

import { type ApiClient } from "@/services/infrastructure/api-client.service";

import type {
  GeneratedDocument,
  GenerateDocumentDto,
  UpdateGeneratedDocumentDto,
  GeneratedDocumentStatus,
} from "./types";

/**
 * Generate new document from template
 */
export async function generateDocument(
  client: ApiClient,
  dto: GenerateDocumentDto
): Promise<GeneratedDocument> {
  return client.post<GeneratedDocument>("/drafting/generate", dto);
}

/**
 * Get all generated documents with optional filters
 */
export async function getAllGeneratedDocuments(
  client: ApiClient,
  filters?: {
    status?: GeneratedDocumentStatus;
    caseId?: string;
  }
): Promise<GeneratedDocument[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.caseId) params.append("caseId", filters.caseId);

  const query = params.toString();
  return client.get<GeneratedDocument[]>(
    `/drafting/documents${query ? `?${query}` : ""}`
  );
}

/**
 * Get generated document by ID
 */
export async function getGeneratedDocumentById(
  client: ApiClient,
  id: string
): Promise<GeneratedDocument> {
  return client.get<GeneratedDocument>(`/drafting/documents/${id}`);
}

/**
 * Update generated document
 */
export async function updateGeneratedDocument(
  client: ApiClient,
  id: string,
  dto: UpdateGeneratedDocumentDto
): Promise<GeneratedDocument> {
  return client.put<GeneratedDocument>(`/drafting/documents/${id}`, dto);
}

/**
 * Delete generated document
 */
export async function deleteGeneratedDocument(
  client: ApiClient,
  id: string
): Promise<void> {
  return client.delete(`/drafting/documents/${id}`);
}
