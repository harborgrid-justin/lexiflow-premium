/**
 * BillingDomain - Repository Base
 * Base class and validation methods for BillingRepository
 */

import { BillingApiService } from "@/api/billing/finance";
import { Repository } from "@/services/core/Repository";

import type { TimeEntry } from "./types";

/**
 * Billing Repository Class
 * Implements backend-first pattern with IndexedDB fallback
 *
 * **Backend-First Architecture:**
 * - Uses BillingApiService (PostgreSQL + NestJS) for all operations
 * - Legacy IndexedDB logic removed (Zero Tolerance for Local Storage)
 * - Pure Backend Implementation via apiClient
 *
 * @class BillingRepository
 * @extends Repository<TimeEntry>
 */
export class BillingRepositoryBase extends Repository<TimeEntry> {
  protected readonly billingApi: BillingApiService;

  constructor() {
    super("billing");
    this.billingApi = new BillingApiService();
  }

  /**
   * Validate and sanitize ID parameter
   * @protected
   * @throws Error if ID is invalid
   */
  protected validateId(id: string, methodName: string): void {
    if (!id || id.trim() === "") {
      throw new Error(`[BillingRepository.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize case ID parameter
   * @protected
   * @throws Error if case ID is invalid
   */
  protected validateCaseId(caseId: string, methodName: string): void {
    if (!caseId || caseId.trim() === "") {
      throw new Error(
        `[BillingRepository.${methodName}] Invalid caseId parameter`
      );
    }
  }

  /**
   * Validate timekeeper ID parameter
   * @protected
   * @throws Error if timekeeper ID is invalid
   */
  protected validateTimekeeperId(timekeeperId: string, methodName: string): void {
    if (!timekeeperId || timekeeperId.trim() === "") {
      throw new Error(
        `[BillingRepository.${methodName}] Invalid timekeeperId parameter`
      );
    }
  }
}
