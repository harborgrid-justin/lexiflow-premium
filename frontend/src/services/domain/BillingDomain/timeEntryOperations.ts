/**
 * BillingDomain - Time Entry Operations
 * CRUD and query operations for time entries
 */

import { apiClient } from "@/services/infrastructure/apiClient";
import type { PaginationParams, TimeEntry } from "./types";
import { OperationError } from "./types";

/**
 * Retrieves all time entries
 * Routes to backend API if enabled
 *
 * @returns Promise<TimeEntry[]>
 * @complexity O(1) API call or O(n) IndexedDB scan
 */
export async function getAllTimeEntries(billingApi: {
  getTimeEntries: (filters?: unknown) => Promise<TimeEntry[]>;
}): Promise<TimeEntry[]> {
  return billingApi.getTimeEntries();
}

/**
 * Retrieves a single time entry by ID
 */
export async function getTimeEntryById(id: string): Promise<TimeEntry | undefined> {
  if (!id || id.trim() === "") {
    throw new Error("[BillingRepository.getById] Invalid id parameter");
  }

  try {
    return await apiClient.get<TimeEntry>(`/billing/time-entries/${id}`);
  } catch (error) {
    console.error("[BillingRepository.getById] Backend error:", error);
    return undefined;
  }
}

/**
 * Adds a new time entry
 */
export async function addTimeEntry(
  entry: Omit<TimeEntry, "id" | "createdAt" | "updatedAt">
): Promise<TimeEntry> {
  return apiClient.post<TimeEntry>("/billing/time-entries", entry);
}

/**
 * Updates an existing time entry
 */
export async function updateTimeEntry(
  id: string,
  updates: Partial<TimeEntry>
): Promise<TimeEntry> {
  if (!id || id.trim() === "") {
    throw new Error("[BillingRepository.update] Invalid id parameter");
  }

  return apiClient.patch<TimeEntry>(`/billing/time-entries/${id}`, updates);
}

/**
 * Deletes a time entry
 */
export async function deleteTimeEntry(id: string): Promise<void> {
  if (!id || id.trim() === "") {
    throw new Error("[BillingRepository.delete] Invalid id parameter");
  }

  await apiClient.delete(`/billing/time-entries/${id}`);
}

/**
 * Get time entries, optionally filtered by case
 */
export async function getTimeEntries(
  billingApi: {
    getTimeEntries: (filters?: { caseId?: string }) => Promise<TimeEntry[]>;
  },
  caseId?: string
): Promise<TimeEntry[]> {
  try {
    if (caseId && caseId.trim() === "") {
      throw new Error("[BillingRepository.getTimeEntries] Invalid caseId parameter");
    }

    return billingApi.getTimeEntries(caseId ? { caseId } : undefined);
  } catch (error) {
    console.error("[BillingRepository.getTimeEntries] Error:", error);
    throw new OperationError("Failed to fetch time entries");
  }
}

/**
 * Get paginated time entries (Issue #8)
 */
export async function getPaginatedTimeEntries(
  caseId: string,
  params?: PaginationParams
): Promise<{
  data: TimeEntry[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 50;

  try {
    const query = `page=${page}&pageSize=${pageSize}&caseId=${caseId}`;
    return await apiClient.get<{
      data: TimeEntry[];
      total: number;
      page: number;
      pageSize: number;
    }>(`/billing/time-entries?${query}`);
  } catch (error) {
    console.error("Paginated fetch failed:", error);
    throw new OperationError("Failed to fetch paginated time entries");
  }
}

/**
 * Add a new time entry with validation
 */
export async function addTimeEntryWithValidation(entry: TimeEntry): Promise<TimeEntry> {
  if (!entry || typeof entry !== "object") {
    throw new Error("[BillingRepository.addTimeEntry] Invalid time entry data");
  }

  // Validate required fields
  if (!entry.caseId) {
    throw new Error("[BillingRepository.addTimeEntry] Time entry must have a caseId");
  }

  if (entry.duration !== undefined && entry.duration <= 0) {
    throw new Error("[BillingRepository.addTimeEntry] Invalid duration value");
  }

  try {
    return await apiClient.post<TimeEntry>("/billing/time-entries", entry);
  } catch (error) {
    console.error("[BillingRepository.addTimeEntry] Error:", error);
    throw new OperationError("Failed to add time entry");
  }
}
