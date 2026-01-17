/**
 * ESI Source Service
 * Handles Electronically Stored Information (ESI) source operations
 *
 * @module ESISourceService
 * @description Manages ESI sources and their lifecycle states
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";

import { validateCaseId, validateId } from "../shared/validation";

import type { ESISource } from "@/types";

/**
 * ESI Source Service Class
 * Manages ESI source data operations
 */
export class ESISourceService {
  /**
   * Get all ESI sources, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<ESISource[]> Array of ESI sources
   * @throws Error if caseId is invalid
   * @throws OperationError if fetch fails
   */
  async getESISources(caseId?: string): Promise<ESISource[]> {
    validateCaseId(caseId, "getESISources");

    try {
      return (await discoveryApi.esiSources.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as ESISource[];
    } catch (error) {
      console.error("[ESISourceService.getESISources] Error:", error);
      throw new OperationError("getESISources", "Failed to fetch ESI sources");
    }
  }

  /**
   * Add a new ESI source
   *
   * @param source - ESI source data
   * @returns Promise<ESISource> Created ESI source
   * @throws ValidationError if source data is invalid
   * @throws OperationError if create fails
   */
  async addESISource(source: ESISource): Promise<ESISource> {
    if (!source || typeof source !== "object") {
      throw new ValidationError(
        "[ESISourceService.addESISource] Invalid ESI source data"
      );
    }

    try {
      return (await discoveryApi.esiSources.create(
        source as unknown as Record<string, unknown>
      )) as unknown as ESISource;
    } catch (error) {
      console.error("[ESISourceService.addESISource] Error:", error);
      throw new OperationError("addESISource", "Failed to add ESI source");
    }
  }

  /**
   * Update ESI source status
   *
   * @param id - ESI source ID
   * @param status - New status value
   * @returns Promise<ESISource> Updated ESI source
   * @throws Error if id is invalid
   * @throws ValidationError if status is invalid
   * @throws OperationError if update fails
   */
  async updateESISourceStatus(id: string, status: string): Promise<ESISource> {
    validateId(id, "updateESISourceStatus");

    if (!status || status.trim() === "") {
      throw new ValidationError(
        "[ESISourceService.updateESISourceStatus] Invalid status parameter"
      );
    }

    try {
      // Cast the status to the specific union type required by the API
      const validStatus = status as
        | "identified"
        | "reviewed"
        | "preserved"
        | "collected"
        | "processed";

      const result = await discoveryApi.esiSources.updateStatus(
        id,
        validStatus
      );
      return result as unknown as ESISource;
    } catch (error) {
      console.error("[ESISourceService.updateESISourceStatus] Error:", error);
      throw new OperationError(
        "updateESISourceStatus",
        "Failed to update ESI source status"
      );
    }
  }
}

export const esiSourceService = new ESISourceService();
