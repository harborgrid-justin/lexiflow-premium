/**
 * Document Review Service
 * Handles document review operations for discovery management
 *
 * @module DocumentReviewService
 * @description Manages document review and coding operations
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError } from "@/services/core/errors";
import type {
  DocumentCoding,
  ReviewDocument,
} from "@/types/discovery-enhanced";
import { validateId } from "../shared/validation";

/**
 * Document Review Service Class
 * Manages document review data operations
 */
export class DocumentReviewService {
  /**
   * Get review documents
   *
   * @param filters - Search filters
   * @returns Promise<ReviewDocument[]> Array of review documents
   *
   * @example
   * const docs = await documentReviewService.getReviewDocuments({
   *   caseId: 'case-123',
   *   status: 'pending'
   * });
   */
  async getReviewDocuments(
    filters?: Record<string, unknown>
  ): Promise<ReviewDocument[]> {
    try {
      return await discoveryApi.review.getDocuments(filters);
    } catch (error) {
      console.error("[DocumentReviewService.getReviewDocuments] Error:", error);
      return [];
    }
  }

  /**
   * Update document coding
   *
   * @param id - Document ID
   * @param coding - Coding data
   * @param notes - Optional notes
   * @returns Promise<ReviewDocument> Updated document
   * @throws Error if id is invalid
   * @throws OperationError if update fails
   *
   * @example
   * const doc = await documentReviewService.updateDocumentCoding(
   *   'doc-123',
   *   { relevance: 'responsive', privilege: 'none' },
   *   'Reviewed by Smith'
   * );
   */
  async updateDocumentCoding(
    id: string,
    coding: DocumentCoding,
    notes?: string
  ): Promise<ReviewDocument> {
    validateId(id, "updateDocumentCoding");

    try {
      return await discoveryApi.review.updateCoding(id, coding, notes);
    } catch (error) {
      console.error("[DocumentReviewService.updateDocumentCoding] Error:", error);
      throw new OperationError(
        "updateDocumentCoding",
        "Failed to update document coding"
      );
    }
  }
}

export const documentReviewService = new DocumentReviewService();
