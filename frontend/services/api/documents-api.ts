/**
 * DocumentsApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

export class DocumentsApiService {
  async getAll(filters?: { caseId?: string; type?: string; status?: string; page?: number; limit?: number }): Promise<LegalDocument[]> {
    const response = await apiClient.get<PaginatedResponse<LegalDocument>>('/documents', filters);
    return response.data;
  }

  async getById(id: string): Promise<LegalDocument> {
    return apiClient.get<LegalDocument>(`/documents/${id}`);
  }

  async add(doc: Omit<LegalDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalDocument> {
    return apiClient.post<LegalDocument>('/documents', doc);
  }

  async update(id: string, doc: Partial<LegalDocument>): Promise<LegalDocument> {
    return apiClient.put<LegalDocument>(`/documents/${id}`, doc);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  }

  async upload(file: File, metadata: Record<string, any>): Promise<LegalDocument> {
    return apiClient.upload<LegalDocument>('/documents/upload', file, metadata);
  }

  async bulkUpload(files: File[], metadata: Record<string, any>): Promise<LegalDocument[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));
    
    const token = localStorage.getItem('lexiflow_auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary
    
    const response = await fetch(`${apiClient.getBaseUrl()}/documents/bulk-upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return response.json();
  }

  async download(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient.getBaseUrl()}/documents/${id}/download`, {
      headers: apiClient['getHeaders'](),
    });
    return response.blob();
  }

  async preview(id: string): Promise<string> {
    const response = await apiClient.get<{ url: string }>(`/documents/${id}/preview`);
    return response.url;
  }

  async redact(id: string, regions: Array<{ page: number; x: number; y: number; width: number; height: number }>): Promise<LegalDocument> {
    return apiClient.post<LegalDocument>(`/documents/${id}/redact`, { regions });
  }

  async getVersions(documentId: string): Promise<any[]> {
    const response = await apiClient.get<PaginatedResponse<any>>(`/documents/${documentId}/versions`);
    return response.data;
  }

  async restoreVersion(documentId: string, versionId: string): Promise<LegalDocument> {
    return apiClient.post<LegalDocument>(`/documents/${documentId}/versions/${versionId}/restore`, {});
  }

  async compareVersions(documentId: string, versionId: string, compareWithId: string): Promise<{ diff: string }> {
    return apiClient.get<{ diff: string }>(`/documents/${documentId}/versions/${versionId}/compare?compareWith=${compareWithId}`);
  }

  async getByCaseId(caseId: string): Promise<LegalDocument[]> {
    return this.getAll({ caseId });
  }

  async getFolders(): Promise<any[]> {
    return apiClient.get<any[]>('/documents/folders/list');
  }

  async getContent(id: string): Promise<string> {
    const response = await apiClient.get<{ content: string }>(`/documents/${id}/content`);
    return response.content;
  }
}
