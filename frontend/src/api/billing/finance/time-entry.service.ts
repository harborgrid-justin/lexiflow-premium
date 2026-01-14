/**
 * Time Entry Service
 * Handles all time entry-related API operations
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/api-client.service";
import type { TimeEntry } from "./types";
import {
  transformTimeEntryForCreate,
  validateArray,
  validateId,
  validateObject,
} from "./utils";

export class TimeEntryService {
  /**
   * Get time entries with optional filters
   */
  async getTimeEntries(filters?: {
    caseId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<TimeEntry[]> {
    try {
      if (filters?.caseId) {
        const response = await apiClient.get<PaginatedResponse<TimeEntry>>(
          `/billing/time-entries/case/${filters.caseId}`
        );
        return Array.isArray(response) ? response : response.data || [];
      }
      const response = await apiClient.get<PaginatedResponse<TimeEntry>>(
        "/billing/time-entries"
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error("[TimeEntryService.getTimeEntries] Error:", error);
      throw new Error("Failed to fetch time entries");
    }
  }

  /**
   * Get time entry by ID
   */
  async getTimeEntryById(id: string): Promise<TimeEntry> {
    validateId(id, "getTimeEntryById");
    try {
      return await apiClient.get<TimeEntry>(`/billing/time-entries/${id}`);
    } catch (error) {
      console.error("[TimeEntryService.getTimeEntryById] Error:", error);
      throw new Error(`Failed to fetch time entry with id: ${id}`);
    }
  }

  /**
   * Add a new time entry
   */
  async addTimeEntry(
    entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<TimeEntry> {
    validateObject(entry, "entry", "addTimeEntry");

    if (!entry.caseId) {
      throw new Error("[TimeEntryService.addTimeEntry] caseId is required");
    }
    if (!entry.date) {
      throw new Error("[TimeEntryService.addTimeEntry] date is required");
    }
    if (!entry.duration) {
      throw new Error("[TimeEntryService.addTimeEntry] duration is required");
    }

    try {
      const createDto = transformTimeEntryForCreate(
        entry as Record<string, unknown>
      );
      return await apiClient.post<TimeEntry>(
        "/billing/time-entries",
        createDto
      );
    } catch (error) {
      console.error("[TimeEntryService.addTimeEntry] Error:", error);
      throw new Error("Failed to create time entry");
    }
  }

  /**
   * Add multiple time entries in bulk
   */
  async addBulkTimeEntries(
    entries: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">[]
  ): Promise<TimeEntry[]> {
    validateArray(entries, "entries", "addBulkTimeEntries");

    try {
      return await apiClient.post<TimeEntry[]>("/billing/time-entries/bulk", {
        entries,
      });
    } catch (error) {
      console.error("[TimeEntryService.addBulkTimeEntries] Error:", error);
      throw new Error("Failed to create bulk time entries");
    }
  }

  /**
   * Update an existing time entry
   */
  async updateTimeEntry(
    id: string,
    entry: Partial<TimeEntry>
  ): Promise<TimeEntry> {
    validateId(id, "updateTimeEntry");
    validateObject(entry, "entry", "updateTimeEntry");

    try {
      return await apiClient.put<TimeEntry>(
        `/billing/time-entries/${id}`,
        entry
      );
    } catch (error) {
      console.error("[TimeEntryService.updateTimeEntry] Error:", error);
      throw new Error(`Failed to update time entry with id: ${id}`);
    }
  }

  /**
   * Approve a time entry
   */
  async approveTimeEntry(id: string): Promise<TimeEntry> {
    validateId(id, "approveTimeEntry");

    try {
      return await apiClient.put<TimeEntry>(
        `/billing/time-entries/${id}/approve`,
        {}
      );
    } catch (error) {
      console.error("[TimeEntryService.approveTimeEntry] Error:", error);
      throw new Error(`Failed to approve time entry with id: ${id}`);
    }
  }

  /**
   * Bill a time entry to an invoice
   */
  async billTimeEntry(id: string, invoiceId: string): Promise<TimeEntry> {
    validateId(id, "billTimeEntry");
    validateId(invoiceId, "billTimeEntry");

    try {
      return await apiClient.put<TimeEntry>(
        `/billing/time-entries/${id}/bill`,
        { invoiceId }
      );
    } catch (error) {
      console.error("[TimeEntryService.billTimeEntry] Error:", error);
      throw new Error(`Failed to bill time entry with id: ${id}`);
    }
  }

  /**
   * Get unbilled time entries for a case
   */
  async getUnbilledTimeEntries(caseId: string): Promise<TimeEntry[]> {
    validateId(caseId, "getUnbilledTimeEntries");

    try {
      const response = await apiClient.get<PaginatedResponse<TimeEntry>>(
        `/billing/time-entries/case/${caseId}/unbilled`
      );
      return response.data;
    } catch (error) {
      console.error("[TimeEntryService.getUnbilledTimeEntries] Error:", error);
      throw new Error(
        `Failed to fetch unbilled time entries for case: ${caseId}`
      );
    }
  }

  /**
   * Get time entry totals for a case
   */
  async getTimeEntryTotals(
    caseId: string
  ): Promise<{ total: number; billable: number; unbilled: number }> {
    validateId(caseId, "getTimeEntryTotals");

    try {
      return await apiClient.get<{
        total: number;
        billable: number;
        unbilled: number;
      }>(`/billing/time-entries/case/${caseId}/totals`);
    } catch (error) {
      console.error("[TimeEntryService.getTimeEntryTotals] Error:", error);
      throw new Error(`Failed to fetch time entry totals for case: ${caseId}`);
    }
  }

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(id: string): Promise<void> {
    validateId(id, "deleteTimeEntry");

    try {
      await apiClient.delete(`/billing/time-entries/${id}`);
    } catch (error) {
      console.error("[TimeEntryService.deleteTimeEntry] Error:", error);
      throw new Error(`Failed to delete time entry with id: ${id}`);
    }
  }
}

export const timeEntryService = new TimeEntryService();
