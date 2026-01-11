/**
 * Processing Job Service
 * Handles processing job operations for discovery management
 *
 * @module ProcessingJobService
 * @description Manages processing jobs for document processing workflows
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import {
  EntityNotFoundError,
  OperationError,
} from "@/services/core/errors";
import type { ProcessingJob } from "@/types/discovery-enhanced";
import { validateId } from "../shared/validation";

/**
 * Processing Job Service Class
 * Manages processing job data operations
 */
export class ProcessingJobService {
  /**
   * Get all processing jobs
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<ProcessingJob[]> Array of processing jobs
   * @throws OperationError if fetch fails
   */
  async getProcessingJobs(caseId?: string): Promise<ProcessingJob[]> {
    try {
      return await discoveryApi.processing.getAll(caseId);
    } catch (error) {
      console.error("[ProcessingJobService.getProcessingJobs] Error:", error);
      throw new OperationError(
        "getProcessingJobs",
        "Failed to fetch processing jobs"
      );
    }
  }

  /**
   * Get a processing job by ID
   *
   * @param id - Job ID
   * @returns Promise<ProcessingJob> Processing job
   * @throws Error if id is invalid
   * @throws EntityNotFoundError if job not found
   */
  async getProcessingJob(id: string): Promise<ProcessingJob> {
    validateId(id, "getProcessingJob");

    try {
      return await discoveryApi.processing.getById(id);
    } catch (error) {
      console.error("[ProcessingJobService.getProcessingJob] Error:", error);
      throw new EntityNotFoundError("ProcessingJob", id);
    }
  }

  /**
   * Create a new processing job
   *
   * @param data - Job data
   * @returns Promise<ProcessingJob> Created job
   * @throws OperationError if create fails
   */
  async createProcessingJob(
    data: Partial<ProcessingJob>
  ): Promise<ProcessingJob> {
    try {
      return await discoveryApi.processing.create(data);
    } catch (error) {
      console.error("[ProcessingJobService.createProcessingJob] Error:", error);
      throw new OperationError(
        "createProcessingJob",
        "Failed to create processing job"
      );
    }
  }

  /**
   * Update a processing job
   *
   * @param id - Job ID
   * @param data - Updates
   * @returns Promise<ProcessingJob> Updated job
   * @throws Error if id is invalid
   * @throws OperationError if update fails
   */
  async updateProcessingJob(
    id: string,
    data: Partial<ProcessingJob>
  ): Promise<ProcessingJob> {
    validateId(id, "updateProcessingJob");

    try {
      // API might need PUT method - using create with id for now
      return await discoveryApi.processing.create({ ...data, id });
    } catch (error) {
      console.error("[ProcessingJobService.updateProcessingJob] Error:", error);
      throw new OperationError(
        "updateProcessingJob",
        "Failed to update processing job"
      );
    }
  }

  /**
   * Delete a processing job
   *
   * @param id - Job ID
   * @returns Promise<void>
   * @throws Error if id is invalid
   * @throws OperationError if delete fails
   */
  async deleteProcessingJob(id: string): Promise<void> {
    validateId(id, "deleteProcessingJob");

    try {
      await discoveryApi.processing.delete(id);
    } catch (error) {
      console.error("[ProcessingJobService.deleteProcessingJob] Error:", error);
      throw new OperationError(
        "deleteProcessingJob",
        "Failed to delete processing job"
      );
    }
  }
}

export const processingJobService = new ProcessingJobService();
