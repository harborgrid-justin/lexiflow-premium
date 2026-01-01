/**
 * Documents File Operations
 * @module api/admin/documents/fileOps
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { LegalDocument } from '@/types';
import { validateId, validateFile, validateObject, validateArray } from './validation';

/** Upload a document file with metadata */
export async function upload(file: File, metadata: Record<string, unknown>): Promise<LegalDocument> {
  validateFile(file, 'upload');
  validateObject(metadata, 'metadata', 'upload');
  try {
    return await apiClient.upload<LegalDocument>('/documents/upload', file, metadata);
  } catch (error) {
    console.error('[DocumentsApiService.upload] Error:', error);
    throw new Error('Failed to upload document');
  }
}

/** Bulk upload multiple documents */
export async function bulkUpload(files: File[], metadata: Record<string, string>): Promise<LegalDocument[]> {
  validateArray(files, 'files', 'bulkUpload');
  validateObject(metadata, 'metadata', 'bulkUpload');
  files.forEach((f, i) => { if (!(f instanceof File)) throw new Error(`Invalid file at index ${i}`); });

  try {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    Object.keys(metadata).forEach(k => formData.append(k, metadata[k]));

    const token = localStorage.getItem('lexiflow_auth_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${apiClient.getBaseUrl()}/documents/bulk-upload`, { method: 'POST', headers, body: formData });
    if (!response.ok) throw new Error(`Bulk upload failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('[DocumentsApiService.bulkUpload] Error:', error);
    throw new Error('Failed to bulk upload documents');
  }
}

/** Download a document file */
export async function download(id: string): Promise<Blob> {
  validateId(id, 'download');
  try {
    const response = await fetch(`${apiClient.getBaseUrl()}/documents/${id}/download`, { headers: apiClient['getHeaders']() });
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return await response.blob();
  } catch (error) {
    console.error('[DocumentsApiService.download] Error:', error);
    throw new Error(`Failed to download document with id: ${id}`);
  }
}

/** Get document preview URL */
export async function preview(id: string): Promise<string> {
  validateId(id, 'preview');
  try {
    const response = await apiClient.get<{ url: string }>(`/documents/${id}/preview`);
    return response.url;
  } catch (error) {
    console.error('[DocumentsApiService.preview] Error:', error);
    throw new Error(`Failed to generate preview for document with id: ${id}`);
  }
}
