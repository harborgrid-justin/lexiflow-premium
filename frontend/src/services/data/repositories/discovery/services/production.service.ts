/**
 * Production Service
 * Handles production set operations for discovery management
 *
 * @module ProductionService
 * @description Manages production sets, creation, and downloads
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";
import { apiClient } from "@/services/infrastructure/api-client.service";
import type { ProductionSet } from "@/types";
import { validateCaseId, validateId } from "../shared/validation";

/**
 * Production Service Class
 * Manages production set data operations
 */
export class ProductionService {
  /**
   * Get all productions, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<ProductionSet[]> Array of productions
   * @throws Error if caseId is invalid
   */
  async getProductions(caseId?: string): Promise<ProductionSet[]> {
    validateCaseId(caseId, "getProductions");

    try {
      return (await discoveryApi.productions.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as ProductionSet[];
    } catch (error) {
      console.error("[ProductionService.getProductions] Error:", error);
      return [];
    }
  }

  /**
   * Create a new production set
   *
   * @param production - Production data
   * @returns Promise<ProductionSet> Created production
   * @throws ValidationError if production data is invalid
   * @throws OperationError if create fails
   */
  async createProduction(production: ProductionSet): Promise<ProductionSet> {
    if (!production || typeof production !== "object") {
      throw new ValidationError(
        "[ProductionService.createProduction] Invalid production data"
      );
    }

    try {
      return (await discoveryApi.productions.create(
        production as unknown as Record<string, unknown>
      )) as unknown as ProductionSet;
    } catch (error) {
      console.error("[ProductionService.createProduction] Error:", error);
      throw new OperationError(
        "createProduction",
        "Failed to create production"
      );
    }
  }

  /**
   * Download a production
   *
   * @param id - Production ID
   * @returns Promise<string> Download URL
   * @throws Error if id is invalid
   * @throws OperationError if retrieval fails
   */
  async downloadProduction(id: string): Promise<string> {
    validateId(id, "downloadProduction");

    try {
      // Check if production exists first via metadata endpoint
      const response = await apiClient.get<unknown>(
        `/discovery/productions/${id}`
      );

      const downloadData = response as { downloadUrl?: string };
      if (downloadData && downloadData.downloadUrl) {
        return downloadData.downloadUrl;
      }

      // Fallback to direct construction
      const client = apiClient as unknown as {
        defaults: { baseURL: string };
      };
      const baseURL = client.defaults?.baseURL || "";
      return `${baseURL}/discovery/productions/${id}/download`;
    } catch (error) {
      console.error("[ProductionService.downloadProduction] Error:", error);
      throw new OperationError(
        "downloadProduction",
        "Failed to retrieve download URL"
      );
    }
  }
}

export const productionService = new ProductionService();
