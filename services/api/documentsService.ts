/**
 * Documents Service
 * Handles document upload, download, versions, OCR, and management
 */

import apiClient, { uploadFile, downloadFile } from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type {
  DocumentListResponse,
  DocumentItem,
  DocumentDetailsResponse,
  UploadDocumentRequest,
  PaginationParams,
  DocumentStatus,
} from '../../types/api';

export interface DocumentFilters extends PaginationParams {
  caseId?: string;
  documentType?: string;
  status?: DocumentStatus;
  uploadedBy?: string;
  tags?: string[];
  search?: string;
  uploadedFrom?: string;
  uploadedTo?: string;
  isConfidential?: boolean;
}

/**
 * Get list of documents with optional filters
 */
export async function getDocuments(filters?: DocumentFilters): Promise<DocumentListResponse> {
  try {
    const response = await apiClient.get<DocumentListResponse>(
      API_ENDPOINTS.DOCUMENTS.BASE,
      { params: filters }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: string): Promise<DocumentDetailsResponse> {
  try {
    const response = await apiClient.get<DocumentDetailsResponse>(
      API_ENDPOINTS.DOCUMENTS.BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Upload single document
 */
export async function uploadDocument(
  file: File,
  metadata: Omit<UploadDocumentRequest, 'file'>,
  onProgress?: (progress: number) => void
): Promise<DocumentItem> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('documentType', metadata.documentType);

    if (metadata.caseId) formData.append('caseId', metadata.caseId);
    if (metadata.isConfidential !== undefined) {
      formData.append('isConfidential', String(metadata.isConfidential));
    }
    if (metadata.tags) {
      formData.append('tags', JSON.stringify(metadata.tags));
    }

    const response = await apiClient.post<DocumentItem>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Upload multiple documents
 */
export async function uploadDocumentsBulk(
  files: File[],
  metadata: { caseId?: string; documentType: string; tags?: string[] },
  onProgress?: (progress: number) => void
): Promise<DocumentItem[]> {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('documentType', metadata.documentType);

    if (metadata.caseId) formData.append('caseId', metadata.caseId);
    if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));

    const response = await apiClient.post<DocumentItem[]>(
      API_ENDPOINTS.DOCUMENTS.BULK_UPLOAD,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Download document
 */
export async function downloadDocument(id: string, filename?: string): Promise<void> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `document-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get document preview URL
 */
export async function getDocumentPreviewUrl(id: string): Promise<string> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.PREVIEW(id));
    return response.data.url;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  id: string,
  updates: Partial<DocumentItem>
): Promise<DocumentItem> {
  try {
    const response = await apiClient.put<DocumentItem>(
      API_ENDPOINTS.DOCUMENTS.BY_ID(id),
      updates
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get document versions
 */
export async function getDocumentVersions(id: string): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.VERSIONS(id));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Trigger OCR processing for document
 */
export async function triggerOCR(id: string): Promise<{ jobId: string }> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DOCUMENTS.OCR(id));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get OCR status and results
 */
export async function getOCRStatus(id: string): Promise<any> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.OCR(id));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Search documents with full-text search
 */
export async function searchDocuments(
  query: string,
  filters?: DocumentFilters
): Promise<DocumentListResponse> {
  try {
    const response = await apiClient.get<DocumentListResponse>(
      API_ENDPOINTS.DOCUMENTS.SEARCH,
      { params: { query, ...filters } }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get all document tags
 */
export async function getDocumentTags(): Promise<string[]> {
  try {
    const response = await apiClient.get<string[]>(API_ENDPOINTS.DOCUMENTS.TAGS);
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Share document with users
 */
export async function shareDocument(
  id: string,
  userIds: string[],
  permissions: 'read' | 'write' = 'read'
): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.DOCUMENTS.SHARE(id), {
      userIds,
      permissions,
    });
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get document access log
 */
export async function getDocumentAccessLog(id: string): Promise<any[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENTS.ACCESS_LOG(id));
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getDocuments,
  getDocumentById,
  uploadDocument,
  uploadDocumentsBulk,
  downloadDocument,
  getDocumentPreviewUrl,
  updateDocument,
  deleteDocument,
  getDocumentVersions,
  triggerOCR,
  getOCRStatus,
  searchDocuments,
  getDocumentTags,
  shareDocument,
  getDocumentAccessLog,
};
