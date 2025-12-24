/**
 * Bluebook API Service
 * Enterprise-grade Bluebook citation management and formatting
 */

import { apiClient } from '@services/infrastructure/apiClient';
import {
  BluebookCitation,
  BatchFormatRequest,
  BatchFormatResult,
  FormattedCitation,
  CitationFormat
} from '../../types/bluebook';

export interface CitationValidation {
  citation: string;
  isValid: boolean;
  type: string;
  errors: Array<{ field: string; message: string }>;
  parsed: unknown;
}

export interface CitationParseResult {
  success: boolean;
  data: unknown;
  type?: string;
  confidence?: number;
}

export class BluebookApiService {
  private readonly baseUrl = '/bluebook';

  /**
   * Parse a raw citation
   */
  async parseCitation(citation: string): Promise<CitationParseResult> {
    return apiClient.post<CitationParseResult>(`${this.baseUrl}/parse`, { citation });
  }

  /**
   * Format a single citation
   */
  async formatCitation(
    citation: string,
    options?: {
      format?: CitationFormat;
      italicizeCaseNames?: boolean;
      useSmallCaps?: boolean;
    }
  ): Promise<{ original: string; formatted: string; type: string; parsed: any }> {
    return apiClient.post('/bluebook/format', {
      citation,
      ...options
    });
  }

  /**
   * Validate a citation
   */
  async validateCitation(
    citation: string,
    expectedType?: string
  ): Promise<{
    citation: string;
    isValid: boolean;
    type: string;
    errors: unknown[];
    parsed: unknown;
  }> {
    return apiClient.post('/bluebook/validate', {
      citation,
      expectedType
    });
  }

  /**
   * Get citation history
   */
  async getCitationHistory(documentId?: string): Promise<FormattedCitation[]> {
    const params = documentId ? { documentId } : {};
    return apiClient.get<FormattedCitation[]>(`${this.baseUrl}/history`, params);
  }

  /**
   * Get citation templates
   */
  async getTemplates(type?: string): Promise<any[]> {
    const params = type ? { type } : {};
    return apiClient.get<any[]>(`${this.baseUrl}/templates`, params);
  }

  /**
   * Batch format multiple citations
   */
  async batchFormat(request: BatchFormatRequest): Promise<BatchFormatResult> {
    return apiClient.post('/bluebook/batch', request);
  }

  /**
   * Generate table of authorities
   */
  async generateTableOfAuthorities(citations: string[]): Promise<{ html: string; count: number }> {
    return apiClient.post('/bluebook/table-of-authorities', { citations });
  }
}

// Export singleton instance
export const bluebookApi = new BluebookApiService();
