/**
 * Deposition Service
 * Handles deposition operations for discovery management
 *
 * @module DepositionService
 * @description Manages deposition records and related operations
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";

import { validateCaseId } from "../shared/validation";

import type { Deposition } from "@/types";

/**
 * Deposition Service Class
 * Manages deposition data operations
 */
export class DepositionService {
  /**
   * Get all depositions, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Deposition[]> Array of depositions
   * @throws Error if caseId is invalid
   * @throws OperationError if fetch fails
   *
   * @example
   * const depositions = await depositionService.getDepositions('case-123');
   */
  async getDepositions(caseId?: string): Promise<Deposition[]> {
    validateCaseId(caseId, "getDepositions");

    try {
      return (await discoveryApi.depositions.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as Deposition[];
    } catch (error) {
      console.error("[DepositionService.getDepositions] Error:", error);
      throw new OperationError("getDepositions", "Failed to fetch depositions");
    }
  }

  /**
   * Add a new deposition
   *
   * @param deposition - Deposition data
   * @returns Promise<Deposition> Created deposition
   * @throws ValidationError if deposition data is invalid
   * @throws OperationError if create fails
   *
   * @example
   * const newDeposition = await depositionService.addDeposition({
   *   caseId: 'case-123',
   *   deponentName: 'John Doe',
   *   scheduledDate: '2024-01-15'
   * });
   */
  async addDeposition(deposition: Deposition): Promise<Deposition> {
    if (!deposition || typeof deposition !== "object") {
      throw new ValidationError(
        "[DepositionService.addDeposition] Invalid deposition data"
      );
    }

    try {
      return (await discoveryApi.depositions.create(
        deposition as unknown as Record<string, unknown>
      )) as unknown as Deposition;
    } catch (error) {
      console.error("[DepositionService.addDeposition] Error:", error);
      throw new OperationError("addDeposition", "Failed to add deposition");
    }
  }
}

export const depositionService = new DepositionService();
