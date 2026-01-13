/**
 * Sanction & Stipulation Service
 * Handles sanction motion and stipulation operations for discovery management
 *
 * @module SanctionStipulationService
 * @description Manages sanction motions and stipulation requests
 */

import { OperationError, ValidationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/apiClient";
import type { SanctionMotion, StipulationRequest } from "@/types";
import { validateCaseId } from "../shared/validation";

/**
 * Sanction & Stipulation Service Class
 * Manages sanction and stipulation data operations
 */
export class SanctionStipulationService {
  /**
   * Get all sanction motions, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<SanctionMotion[]> Array of sanction motions
   * @throws Error if caseId is invalid
   */
  async getSanctions(caseId?: string): Promise<SanctionMotion[]> {
    validateCaseId(caseId, "getSanctions");

    try {
      return await apiClient.get<SanctionMotion[]>("/discovery/sanctions", {
        { params: { caseId } }
      });
    } catch (error) {
      console.error("[SanctionStipulationService.getSanctions] Error:", error);
      return [];
    }
  }

  /**
   * Add a new sanction motion
   *
   * @param motion - Sanction motion data
   * @returns Promise<SanctionMotion> Created sanction motion
   * @throws ValidationError if motion data is invalid
   * @throws OperationError if create fails
   */
  async addSanctionMotion(motion: SanctionMotion): Promise<SanctionMotion> {
    if (!motion || typeof motion !== "object") {
      throw new ValidationError(
        "[SanctionStipulationService.addSanctionMotion] Invalid sanction motion data"
      );
    }

    try {
      return await apiClient.post<SanctionMotion>(
        "/discovery/sanctions",
        motion
      );
    } catch (error) {
      console.error(
        "[SanctionStipulationService.addSanctionMotion] Error:",
        error
      );
      throw new OperationError(
        "addSanctionMotion",
        "Failed to add sanction motion"
      );
    }
  }

  /**
   * Get all stipulations, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<StipulationRequest[]> Array of stipulations
   * @throws Error if caseId is invalid
   */
  async getStipulations(caseId?: string): Promise<StipulationRequest[]> {
    validateCaseId(caseId, "getStipulations");

    try {
      return await apiClient.get<StipulationRequest[]>(
        "/discovery/stipulations",
        { params: { caseId } }
      );
    } catch (error) {
      console.error(
        "[SanctionStipulationService.getStipulations] Error:",
        error
      );
      return [];
    }
  }

  /**
   * Add a new stipulation request
   *
   * @param stipulation - Stipulation data
   * @returns Promise<StipulationRequest> Created stipulation
   * @throws ValidationError if stipulation data is invalid
   * @throws OperationError if create fails
   */
  async addStipulation(
    stipulation: StipulationRequest
  ): Promise<StipulationRequest> {
    if (!stipulation || typeof stipulation !== "object") {
      throw new ValidationError(
        "[SanctionStipulationService.addStipulation] Invalid stipulation data"
      );
    }

    try {
      return await apiClient.post<StipulationRequest>(
        "/discovery/stipulations",
        stipulation
      );
    } catch (error) {
      console.error("[SanctionStipulationService.addStipulation] Error:", error);
      throw new OperationError("addStipulation", "Failed to add stipulation");
    }
  }
}

export const sanctionStipulationService = new SanctionStipulationService();
