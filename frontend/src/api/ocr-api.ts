/**
 * OCR API Service
 * Optical Character Recognition and document processing
 */

import { apiClient } from '../infrastructure/apiClient';

export interface OCRJob {
  id: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  language?: string;
  confidence?: number;
  pageCount?: number;
  extractedText?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface OCRRequest {
  documentId: string;
  language?: string;
  options?: {
    enhanceImage?: boolean;
    detectTables?: boolean;
    detectHandwriting?: boolean;
  };
}

export class OCRApiService {
  private readonly baseUrl = '/ocr';

  async processDocument(request: OCRRequest): Promise<OCRJob> {
    return apiClient.post<OCRJob>(`${this.baseUrl}/process`, request);
  }

  async getJob(id: string): Promise<OCRJob> {
    return apiClient.get<OCRJob>(`${this.baseUrl}/jobs/${id}`);
  }

  async getJobs(filters?: { status?: OCRJob['status']; documentId?: string }): Promise<OCRJob[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.documentId) params.append('documentId', filters.documentId);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/jobs?${queryString}` : `${this.baseUrl}/jobs`;
    return apiClient.get<OCRJob[]>(url);
  }

  async cancelJob(id: string): Promise<void> {
    return apiClient.post(`${this.baseUrl}/jobs/${id}/cancel`, {});
  }
}
