/**
 * Interview Service
 * Handles custodian interview operations for discovery management
 *
 * @module InterviewService
 * @description Manages custodian interviews and related records
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import { OperationError, ValidationError } from "@/services/core/errors";

import { validateCaseId } from "../shared/validation";

import type { CustodianInterview } from "@/types";

/**
 * Interview Service Class
 * Manages custodian interview data operations
 */
export class InterviewService {
  /**
   * Get all custodian interviews, optionally filtered by case
   *
   * @param caseId - Optional case ID filter
   * @returns Promise<CustodianInterview[]> Array of interviews
   * @throws Error if caseId is invalid
   *
   * @example
   * const interviews = await interviewService.getInterviews('case-123');
   */
  async getInterviews(caseId?: string): Promise<CustodianInterview[]> {
    validateCaseId(caseId, "getInterviews");

    try {
      return (await discoveryApi.custodianInterviews.getAll(
        caseId ? { caseId } : undefined
      )) as unknown as CustodianInterview[];
    } catch (error) {
      console.error("[InterviewService.getInterviews] Error:", error);
      return [];
    }
  }

  /**
   * Create a new custodian interview
   *
   * @param interview - Interview data
   * @returns Promise<CustodianInterview> Created interview
   * @throws ValidationError if interview data is invalid
   * @throws OperationError if create fails
   *
   * @example
   * const interview = await interviewService.createInterview({
   *   custodianId: 'cust-123',
   *   scheduledDate: '2024-01-15',
   *   interviewer: 'Jane Smith'
   * });
   */
  async createInterview(
    interview: CustodianInterview
  ): Promise<CustodianInterview> {
    if (!interview || typeof interview !== "object") {
      throw new ValidationError(
        "[InterviewService.createInterview] Invalid interview data"
      );
    }

    try {
      return (await discoveryApi.custodianInterviews.create(
        interview as unknown as Record<string, unknown>
      )) as unknown as CustodianInterview;
    } catch (error) {
      console.error("[InterviewService.createInterview] Error:", error);
      throw new OperationError(
        "createInterview",
        "Failed to create custodian interview"
      );
    }
  }
}

export const interviewService = new InterviewService();
