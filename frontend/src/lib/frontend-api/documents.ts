/**
 * Documents Frontend API
 * Domain contract for document management
 */

import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getAllDocuments(filters?: {
  caseId?: string;
  type?: string;
}): Promise<Result<unknown[]>> {
  const params = filters || {};
  const result = await client.get<unknown>("/documents", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

export async function getDocumentById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Document ID is required"));

  const result = await client.get<unknown>(`/documents/${id}`);
  if (!result.ok) return result;

  return success(result.data);
}

export async function uploadDocument(
  file: File,
  metadata: Record<string, unknown>
): Promise<Result<unknown>> {
  const formData = new FormData();
  formData.append("file", file);
  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  // Note: For multipart/form-data, we need to let browser set Content-Type
  const result = await client.post<unknown>("/documents/upload", formData);

  if (!result.ok) return result;

  return success(result.data);
}

export async function deleteDocument(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Document ID is required"));
  return client.delete<void>(`/documents/${id}`);
}

export async function getDocumentVersions(
  documentId: string
): Promise<Result<unknown[]>> {
  if (!documentId)
    return failure(new ValidationError("Document ID is required"));

  const result = await client.get<unknown>(`/documents/${documentId}/versions`);

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

export const documentsApi = {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  getDocumentVersions,
};
