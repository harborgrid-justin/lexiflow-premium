/**
 * Custodian Service
 * Handles custodian operations for discovery management
 *
 * @module CustodianService
 * @description Manages CRUD operations for custodians in discovery process
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import type { Custodian } from "@/types";
import { validateId } from "../shared/validation";

/**
 * Custodian Service Class
 * Manages custodian data operations
 */
export class CustodianService {
  /**
   * Get all custodians, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<Custodian[]> Array of custodians
   * @throws OperationError if fetch fails
   *
   * @example
   * const allCustodians = await custodianService.getCustodians();
   * const caseCustodians = await custodianService.getCustodians('case-123');
   */
  async getCustodians(caseId?: string): Promise<Custodian[]> {
    try {
      return await discoveryApi.custodians.getAll(caseId ? { caseId } : {});
    } catch (error) {
      console.error("[CustodianService.getCustodians] Error:", error);
      return [];
    }
  }

  /**
   * Add a new custodian
   *
   * @param custodian - Custodian data
   * @returns Promise<Custodian> Created custodian
   * @throws ValidationError if custodian data is invalid
   * @throws OperationError if create fails
   */
  async addCustodian(custodian: Custodian): Promise<Custodian> {
    if (!custodian || typeof custodian !== "object") {
      throw new ValidationError(
        "[CustodianService.addCustodian] Invalid custodian data"
      );
    }

    try {
      const result = await discoveryApi.custodians.create(
        custodian as Omit<Custodian, "id" | "createdAt" | "updatedAt">
      );
      return result as unknown as Custodian;
    } catch (error) {
      console.error("[CustodianService.addCustodian] Error:", error);
      throw new OperationError("addCustodian", "Failed to add custodian");
    }
  }

  /**
   * Update an existing custodian
   *
   * @param custodian - Custodian data with ID
   * @returns Promise<unknown> Updated custodian
   * @throws ValidationError if custodian ID is missing
   * @throws OperationError if update fails
   */
  async updateCustodian(custodian: unknown): Promise<unknown> {
    const custodianObj = custodian as { id?: string };
    if (!custodianObj?.id) {
      throw new ValidationError(
        "[CustodianService.updateCustodian] Custodian ID required"
      );
    }

    try {
      const { id, ...updates } = custodianObj as {
        id: string;
        [key: string]: unknown;
      };
      return await discoveryApi.custodians.update(id, updates);
    } catch (error) {
      console.error("[CustodianService.updateCustodian] Error:", error);
      throw new OperationError("updateCustodian", "Failed to update custodian");
    }
  }

  /**
   * Delete a custodian
   *
   * @param id - Custodian ID
   * @returns Promise<void>
   * @throws Error if id is invalid
   * @throws OperationError if delete fails
   */
  async deleteCustodian(id: string): Promise<void> {
    validateId(id, "deleteCustodian");

    try {
      await discoveryApi.custodians.delete(id);
    } catch (error) {
      console.error("[CustodianService.deleteCustodian] Error:", error);
      throw new OperationError("deleteCustodian", "Failed to delete custodian");
    }
  }
}

export const custodianService = new CustodianService();
