/**
 * Document Versions API Service
 * Document version control and history
 */

import { apiClient } from '../apiClient';

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  checksum?: string;
  changes?: string;
  createdBy?: string;
  createdAt: string;
  isCurrent: boolean;
  metadata?: Record<string, any>;
}

export class DocumentVersionsApiService {
  private readonly baseUrl = '/document-versions';

  async getByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    return apiClient.get<DocumentVersion[]>(`${this.baseUrl}/document/${documentId}`);
  }

  async getById(id: string): Promise<DocumentVersion> {
    return apiClient.get<DocumentVersion>(`${this.baseUrl}/${id}`);
  }

  async create(data: { documentId: string; file: File; changes?: string }): Promise<DocumentVersion> {
    const formData = new FormData();
    formData.append('documentId', data.documentId);
    formData.append('file', data.file);
    if (data.changes) formData.append('changes', data.changes);
    return apiClient.post<DocumentVersion>(this.baseUrl, formData);
  }

  async download(id: string): Promise<Blob> {
    return apiClient.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }

  async compare(version1Id: string, version2Id: string): Promise<any> {
    return apiClient.get(`${this.baseUrl}/compare?v1=${version1Id}&v2=${version2Id}`);
  }

  async revertTo(versionId: string): Promise<DocumentVersion> {
    return apiClient.post<DocumentVersion>(`${this.baseUrl}/${versionId}/revert`, {});
  }
}
