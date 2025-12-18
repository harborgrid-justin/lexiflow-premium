/**
 * BluebookApiService
 * Frontend API client for Bluebook citation formatting
 */

import { apiClient } from '../apiClient';
import {
  BluebookCitation,
  BatchFormatRequest,
  BatchFormatResult,
  FormattedCitation,
  CitationFormat
} from '../../types/bluebook';

export class BluebookApiService {
  /**
   * Parse a raw citation
   */
  async parseCitation(citation: string): Promise<{ success: boolean; data: any }> {
    return apiClient.post('/bluebook/parse', { citation });
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
    errors: any[];
    parsed: any;
  }> {
    return apiClient.post('/bluebook/validate', {
      citation,
      expectedType
    });
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
