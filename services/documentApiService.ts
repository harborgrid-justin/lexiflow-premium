import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: string;
  caseId: string;
  status: string;
  filename?: string;
  filePath?: string;
  mimeType?: string;
  fileSize?: number;
  checksum?: string;
  currentVersion: number;
  author?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  fullTextContent?: string;
  ocrProcessed: boolean;
  ocrProcessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface DocumentFilter {
  caseId?: string;
  type?: string;
  status?: string;
  search?: string;
  author?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  variables?: string[];
  defaultVariables?: Record<string, any>;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  filename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  changeDescription?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  createdBy?: string;
}

export const documentApiService = {
  // Document CRUD operations
  async getDocuments(filter: DocumentFilter = {}): Promise<PaginatedResponse<Document>> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/documents`, {
      params: filter,
    });
    return response.data;
  },

  async getDocument(id: string): Promise<Document> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/documents/${id}`);
    return response.data;
  },

  async createDocument(
    data: FormData | Partial<Document>,
    file?: File,
  ): Promise<Document> {
    const formData = data instanceof FormData ? data : new FormData();

    if (!(data instanceof FormData)) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });
    }

    if (file) {
      formData.append('file', file);
    }

    const response = await axios.post(`${API_BASE_URL}/api/v1/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const response = await axios.put(`${API_BASE_URL}/api/v1/documents/${id}`, data);
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/v1/documents/${id}`);
  },

  async downloadDocument(id: string): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // OCR operations
  async triggerOCR(id: string, languages: string[] = ['eng']): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/documents/${id}/ocr`, {
      languages,
    });
    return response.data;
  },

  // Template operations
  async getTemplates(category?: string, isActive?: boolean): Promise<DocumentTemplate[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/document-templates`, {
      params: { category, isActive },
    });
    return response.data;
  },

  async getTemplate(id: string): Promise<DocumentTemplate> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/document-templates/${id}`);
    return response.data;
  },

  async createTemplate(data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/document-templates`, data);
    return response.data;
  },

  async updateTemplate(
    id: string,
    data: Partial<DocumentTemplate>,
  ): Promise<DocumentTemplate> {
    const response = await axios.put(`${API_BASE_URL}/api/v1/document-templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/v1/document-templates/${id}`);
  },

  async generateFromTemplate(
    templateId: string,
    variables: Record<string, any>,
  ): Promise<{ content: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/document-templates/generate`,
      {
        templateId,
        variables,
      },
    );
    return response.data;
  },

  async validateTemplate(content: string): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/document-templates/validate`,
      { content },
    );
    return response.data;
  },

  async getMostUsedTemplates(limit: number = 10): Promise<DocumentTemplate[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/document-templates/most-used`,
      {
        params: { limit },
      },
    );
    return response.data;
  },

  // Version operations
  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions`,
    );
    return response.data;
  },

  async getVersion(documentId: string, version: number): Promise<DocumentVersion> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions/${version}`,
    );
    return response.data;
  },

  async createVersion(
    documentId: string,
    caseId: string,
    file: File,
    changeDescription?: string,
    metadata?: Record<string, any>,
  ): Promise<DocumentVersion> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    if (changeDescription) {
      formData.append('changeDescription', changeDescription);
    }
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async downloadVersion(documentId: string, version: number): Promise<Blob> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions/${version}/download`,
      {
        responseType: 'blob',
      },
    );
    return response.data;
  },

  async compareVersions(
    documentId: string,
    version1: number,
    version2: number,
  ): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions/compare`,
      {
        params: { v1: version1, v2: version2 },
      },
    );
    return response.data;
  },

  async restoreVersion(documentId: string, version: number, caseId: string): Promise<DocumentVersion> {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions/${version}/restore`,
      { caseId },
    );
    return response.data;
  },

  async getDocumentChanges(documentId: string): Promise<any[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions/changes`,
    );
    return response.data;
  },

  async getChangeSummary(documentId: string): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/documents/${documentId}/versions/changes/summary`,
    );
    return response.data;
  },
};

export default documentApiService;
