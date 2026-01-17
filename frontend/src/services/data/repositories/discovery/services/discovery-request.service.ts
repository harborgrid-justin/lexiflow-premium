/**
 * Discovery Request Service
 * Handles discovery request operations for discovery management
 *
 * @module DiscoveryRequestService
 * @description Manages discovery requests and their status tracking
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";

import { validateCaseId, validateId } from "../shared/validation";

import type { DiscoveryRequest } from "@/types";

/**
 * Discovery Request Service Class
 * Manages discovery request data operations
 */
export class DiscoveryRequestService {
  /**
   * Get all discovery requests, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<DiscoveryRequest[]> Array of discovery requests
   * @throws Error if caseId is invalid
   */
  async getRequests(caseId?: string): Promise<DiscoveryRequest[]> {
    validateCaseId(caseId, "getRequests");

    try {
      return (await discoveryApi.discoveryRequests.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as DiscoveryRequest[];
    } catch (error) {
      console.error("[DiscoveryRequestService.getRequests] Error:", error);
      return [];
    }
  }

  /**
   * Add a new discovery request
   *
   * @param request - Discovery request data
   * @returns Promise<DiscoveryRequest> Created request
   * @throws ValidationError if request data is invalid
   * @throws OperationError if create fails
   */
  async addRequest(request: DiscoveryRequest): Promise<DiscoveryRequest> {
    if (!request || typeof request !== "object") {
      throw new ValidationError(
        "[DiscoveryRequestService.addRequest] Invalid request data"
      );
    }

    try {
      return (await discoveryApi.discoveryRequests.create(
        request as unknown as Record<string, unknown>
      )) as unknown as DiscoveryRequest;
    } catch (error) {
      console.error("[DiscoveryRequestService.addRequest] Error:", error);
      throw new OperationError("addRequest", "Failed to add discovery request");
    }
  }

  /**
   * Update discovery request status
   *
   * @param id - Request ID
   * @param status - New status value
   * @returns Promise<DiscoveryRequest> Updated request
   * @throws Error if id is invalid
   * @throws ValidationError if status is invalid
   * @throws OperationError if update fails
   */
  async updateRequestStatus(
    id: string,
    status: string
  ): Promise<DiscoveryRequest> {
    validateId(id, "updateRequestStatus");

    if (!status || status.trim() === "") {
      throw new ValidationError(
        "[DiscoveryRequestService.updateRequestStatus] Invalid status parameter"
      );
    }

    try {
      return (await discoveryApi.discoveryRequests.updateStatus(
        id,
        status as
          | "draft"
          | "served"
          | "responded"
          | "pending_response"
          | "overdue"
          | "withdrawn"
      )) as unknown as DiscoveryRequest;
    } catch (error) {
      console.error(
        "[DiscoveryRequestService.updateRequestStatus] Error:",
        error
      );
      throw new OperationError(
        "updateRequestStatus",
        "Failed to update discovery request status"
      );
    }
  }
}

export const discoveryRequestService = new DiscoveryRequestService();
