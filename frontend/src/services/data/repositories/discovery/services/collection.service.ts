/**
 * Collection Service
 * Handles data collection operations for discovery management
 *
 * @module CollectionService
 * @description Manages data collections and collection processes
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import {
  EntityNotFoundError,
  OperationError,
} from "@/services/core/errors";

import { validateId } from "../shared/validation";

import type { DataCollection } from "@/types/discovery-enhanced";

/**
 * Collection Service Class
 * Manages collection data operations
 */
export class CollectionService {
  /**
   * Get all data collections
   *
   * @param caseId - Optional case ID to filter by
   * @returns Promise<DataCollection[]> Array of collections
   */
  async getCollections(caseId?: string): Promise<DataCollection[]> {
    try {
      return await discoveryApi.collections.getAll(caseId);
    } catch (error) {
      console.error("[CollectionService.getCollections] Error:", error);
      return [];
    }
  }

  /**
   * Get a data collection by ID
   *
   * @param id - Collection ID
   * @returns Promise<DataCollection> Collection record
   * @throws Error if id is invalid
   * @throws EntityNotFoundError if collection not found
   */
  async getCollection(id: string): Promise<DataCollection> {
    validateId(id, "getCollection");

    try {
      return await discoveryApi.collections.getById(id);
    } catch (error) {
      console.error("[CollectionService.getCollection] Error:", error);
      throw new EntityNotFoundError("Collection", id);
    }
  }

  /**
   * Create a new data collection
   *
   * @param data - Collection data
   * @returns Promise<DataCollection> Created collection
   * @throws OperationError if create fails
   */
  async createCollection(
    data: Partial<DataCollection>
  ): Promise<DataCollection> {
    try {
      return await discoveryApi.collections.create(data);
    } catch (error) {
      console.error("[CollectionService.createCollection] Error:", error);
      throw new OperationError(
        "createCollection",
        "Failed to create collection"
      );
    }
  }

  /**
   * Update a data collection
   *
   * @param id - Collection ID
   * @param data - Updates
   * @returns Promise<DataCollection> Updated collection
   * @throws Error if id is invalid
   * @throws OperationError if update fails
   */
  async updateCollection(
    id: string,
    data: Partial<DataCollection>
  ): Promise<DataCollection> {
    validateId(id, "updateCollection");

    try {
      return await discoveryApi.collections.update(id, data);
    } catch (error) {
      console.error("[CollectionService.updateCollection] Error:", error);
      throw new OperationError(
        "updateCollection",
        "Failed to update collection"
      );
    }
  }

  /**
   * Delete a data collection
   *
   * @param id - Collection ID
   * @returns Promise<void>
   * @throws Error if id is invalid
   * @throws OperationError if delete fails
   */
  async deleteCollection(id: string): Promise<void> {
    validateId(id, "deleteCollection");

    try {
      await discoveryApi.collections.delete(id);
    } catch (error) {
      console.error("[CollectionService.deleteCollection] Error:", error);
      throw new OperationError(
        "deleteCollection",
        "Failed to delete collection"
      );
    }
  }

  /**
   * Start collection process
   *
   * @param id - Source ID
   * @returns Promise<string> Job ID
   * @throws Error if id is invalid
   * @throws OperationError if start fails
   */
  async startCollection(id: string): Promise<string> {
    validateId(id, "startCollection");

    try {
      const response = await discoveryApi.collections.resume(id);
      return (response as { jobId?: string })?.jobId || `job-${id}-resumed`;
    } catch (error) {
      console.error("[CollectionService.startCollection] Error:", error);
      throw new OperationError(
        "startCollection",
        "Failed to start collection job"
      );
    }
  }
}

export const collectionService = new CollectionService();
