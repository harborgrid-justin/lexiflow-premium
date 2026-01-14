/**
 * Review Batch Service
 * Handles review batch operations for discovery management
 *
 * @module ReviewBatchService
 * @description Manages review batches for document review workflows
 */

import { OperationError, ValidationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/api-client.service";
import type { ReviewBatch } from "@/types";
import { validateId } from "../shared/validation";

/**
 * Review Batch Service Class
 * Manages review batch data operations
 */
export class ReviewBatchService {
  /**
   * Get review batches for a case
   *
   * @param caseId - Case ID (required)
   * @returns Promise<ReviewBatch[]> Array of review batches
   * @throws Error if caseId is invalid
   *
   * @example
   * const batches = await reviewBatchService.getReviewBatches('case-123');
   */
  async getReviewBatches(caseId: string): Promise<ReviewBatch[]> {
    validateId(caseId, "getReviewBatches");

    try {
      return await apiClient.get<ReviewBatch[]>("/discovery/review/batches", {
        params: { caseId }
      });
    } catch (error) {
      console.error("[ReviewBatchService.getReviewBatches] Error:", error);
      return [];
    }
  }

  /**
   * Create a new review batch
   *
   * @param batch - Review batch data
   * @returns Promise<ReviewBatch> Created batch
   * @throws ValidationError if batch data is invalid
   * @throws OperationError if create fails
   *
   * @example
   * const batch = await reviewBatchService.createReviewBatch({
   *   name: 'Batch 1',
   *   documentCount: 100,
   *   assignedTo: 'user-123'
   * });
   */
  async createReviewBatch(batch: ReviewBatch): Promise<ReviewBatch> {
    if (!batch || typeof batch !== "object") {
      throw new ValidationError(
        "[ReviewBatchService.createReviewBatch] Invalid batch data"
      );
    }

    try {
      return await apiClient.post<ReviewBatch>(
        "/discovery/review/batches",
        batch
      );
    } catch (error) {
      console.error("[ReviewBatchService.createReviewBatch] Error:", error);
      throw new OperationError(
        "createReviewBatch",
        "Failed to create review batch"
      );
    }
  }
}

export const reviewBatchService = new ReviewBatchService();
