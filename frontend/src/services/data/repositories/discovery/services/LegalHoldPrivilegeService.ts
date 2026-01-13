/**
 * Legal Hold & Privilege Service
 * Handles legal hold and privilege log operations for discovery management
 *
 * @module LegalHoldPrivilegeService
 * @description Manages legal holds and privilege log entries
 */

import { discoveryApi } from "@/api/domains/discovery.api";
import type { LegalHold, PrivilegeLogEntry } from "@/types";
import type {
  LegalHoldEnhanced,
  PrivilegeLogEntryEnhanced,
} from "@/types/discovery-enhanced";

/**
 * Legal Hold & Privilege Service Class
 * Manages legal hold and privilege log data operations
 */
export class LegalHoldPrivilegeService {
  /**
   * Get all legal holds
   *
   * @returns Promise<LegalHold[]> Array of legal holds
   *
   * @example
   * const holds = await legalHoldPrivilegeService.getLegalHolds();
   */
  async getLegalHolds(): Promise<LegalHold[]> {
    try {
      return (await discoveryApi.legalHolds.getAll()) as unknown as LegalHold[];
    } catch (error) {
      console.error("[LegalHoldPrivilegeService.getLegalHolds] Error:", error);
      return [];
    }
  }

  /**
   * Get enhanced legal holds with additional metadata
   *
   * @returns Promise<LegalHoldEnhanced[]> Array of enhanced legal holds
   *
   * @example
   * const enhancedHolds = await legalHoldPrivilegeService.getLegalHoldsEnhanced();
   */
  async getLegalHoldsEnhanced(): Promise<LegalHoldEnhanced[]> {
    try {
      return await discoveryApi.legalHolds.getEnhanced();
    } catch (error) {
      console.error(
        "[LegalHoldPrivilegeService.getLegalHoldsEnhanced] Error:",
        error
      );
      return [];
    }
  }

  /**
   * Get privilege log entries
   *
   * @returns Promise<PrivilegeLogEntry[]> Array of privilege log entries
   *
   * @example
   * const logEntries = await legalHoldPrivilegeService.getPrivilegeLog();
   */
  async getPrivilegeLog(): Promise<PrivilegeLogEntry[]> {
    try {
      return (await discoveryApi.privilegeLog.getAll()) as unknown as PrivilegeLogEntry[];
    } catch (error) {
      console.error("[LegalHoldPrivilegeService.getPrivilegeLog] Error:", error);
      return [];
    }
  }

  /**
   * Get enhanced privilege log entries with additional metadata
   *
   * @returns Promise<PrivilegeLogEntryEnhanced[]> Array of enhanced privilege log entries
   *
   * @example
   * const enhancedLog = await legalHoldPrivilegeService.getPrivilegeLogEnhanced();
   */
  async getPrivilegeLogEnhanced(): Promise<PrivilegeLogEntryEnhanced[]> {
    try {
      return await discoveryApi.privilegeLog.getEnhanced();
    } catch (error) {
      console.error(
        "[LegalHoldPrivilegeService.getPrivilegeLogEnhanced] Error:",
        error
      );
      return [];
    }
  }

  /**
   * Create a new legal hold
   *
   * @param data - Legal hold data
   * @returns Promise<LegalHold> Created legal hold
   */
  async createLegalHold(data: Partial<LegalHold>): Promise<LegalHold> {
    try {
      return (await discoveryApi.legalHolds.create(data)) as unknown as LegalHold;
    } catch (error) {
      console.error("[LegalHoldPrivilegeService.createLegalHold] Error:", error);
      throw error;
    }
  }

  /**
   * Send reminder to custodians
   * 
   * @param holdId - ID of the legal hold
   */
  async sendReminder(holdId: string): Promise<void> {
      // Mock implementation for now as API doesn't have specific endpoint exposed in snippets
      console.log(`[LegalHoldPrivilegeService] Sending reminder for hold ${holdId}`);
      return Promise.resolve();
  }
}

export const legalHoldPrivilegeService = new LegalHoldPrivilegeService();
