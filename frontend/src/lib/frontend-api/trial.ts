/**
 * Trial Frontend API
 * Enterprise-grade API layer for trial preparation and exhibits
 *
 * @module lib/frontend-api/trial
 * @description Domain-level contract for trial operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 */

import { client } from "./client";
import { ValidationError } from "./errors";
import { failure, type PaginatedResult, type Result, success } from "./types";

/**
 * Exhibit filters
 */
export interface ExhibitFilters {
  caseId?: string;
  status?: "draft" | "filed" | "admitted" | "rejected";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "filedDate";
  sortOrder?: "asc" | "desc";
}

/**
 * Create exhibit input
 */
export interface CreateExhibitInput {
  caseId: string;
  exhibitNumber: string;
  title: string;
  description?: string;
  category: string;
  status: "draft" | "filed" | "admitted" | "rejected";
  documentId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Update exhibit input
 */
export interface UpdateExhibitInput {
  exhibitNumber?: string;
  title?: string;
  description?: string;
  category?: string;
  status?: "draft" | "filed" | "admitted" | "rejected";
  metadata?: Record<string, unknown>;
}

/**
 * Exhibit item
 */
export interface Exhibit {
  id: string;
  caseId: string;
  exhibitNumber: string;
  title: string;
  description?: string;
  category: string;
  status: "draft" | "filed" | "admitted" | "rejected";
  documentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  filedDate?: string;
}

/**
 * Get all exhibits with pagination and filters
 */
export async function getAllExhibits(
  filters?: ExhibitFilters
): Promise<Result<PaginatedResult<Exhibit>>> {
  // Validation
  if (filters?.page !== undefined && filters.page < 1) {
    return failure(new ValidationError("Page must be greater than 0"));
  }
  if (filters?.limit !== undefined && filters.limit < 1) {
    return failure(new ValidationError("Limit must be greater than 0"));
  }

  const params: Record<string, string | number> = {};

  if (
    filters?.caseId &&
    typeof filters.caseId === "string" &&
    filters.caseId.trim()
  ) {
    params.caseId = filters.caseId.trim();
  }
  if (filters?.status) params.status = filters.status;
  if (
    filters?.category &&
    typeof filters.category === "string" &&
    filters.category.trim()
  ) {
    params.category = filters.category.trim();
  }
  if (
    filters?.search &&
    typeof filters.search === "string" &&
    filters.search.trim()
  ) {
    params.search = filters.search.trim();
  }
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/exhibits", { params });

  if (!result.ok) return result;

  const data = result.data as Record<string, unknown>;
  const items = Array.isArray(data.data) ? data.data : [];
  const total = typeof data.total === "number" ? data.total : 0;
  const page = typeof data.page === "number" ? data.page : 1;
  const limit = typeof data.limit === "number" ? data.limit : 50;

  return success({
    data: items as Exhibit[],
    total,
    page,
    pageSize: limit,
    hasMore: page * limit < total,
  });
}

/**
 * Get exhibit by ID
 */
export async function getExhibitById(id: string): Promise<Result<Exhibit>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Exhibit ID is required"));
  }

  const result = await client.get<unknown>(`/exhibits/${id.trim()}`);
  if (!result.ok) return result;

  return success(result.data as Exhibit);
}

/**
 * Create exhibit
 */
export async function createExhibit(
  input: CreateExhibitInput
): Promise<Result<Exhibit>> {
  // Validation
  if (
    !input.caseId ||
    typeof input.caseId !== "string" ||
    input.caseId.trim() === ""
  ) {
    return failure(new ValidationError("Case ID is required"));
  }
  if (
    !input.exhibitNumber ||
    typeof input.exhibitNumber !== "string" ||
    input.exhibitNumber.trim() === ""
  ) {
    return failure(new ValidationError("Exhibit number is required"));
  }
  if (
    !input.title ||
    typeof input.title !== "string" ||
    input.title.trim() === ""
  ) {
    return failure(new ValidationError("Exhibit title is required"));
  }
  if (
    !input.category ||
    typeof input.category !== "string" ||
    input.category.trim() === ""
  ) {
    return failure(new ValidationError("Exhibit category is required"));
  }

  const result = await client.post<unknown>("/exhibits", input);

  if (!result.ok) return result;
  return success(result.data as Exhibit);
}

/**
 * Update exhibit
 */
export async function updateExhibit(
  id: string,
  input: UpdateExhibitInput
): Promise<Result<Exhibit>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Exhibit ID is required"));
  }

  const result = await client.patch<unknown>(`/exhibits/${id.trim()}`, input);

  if (!result.ok) return result;
  return success(result.data as Exhibit);
}

/**
 * Delete exhibit
 */
export async function deleteExhibit(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Exhibit ID is required"));
  }

  const result = await client.delete<void>(`/exhibits/${id.trim()}`);

  return result;
}

/**
 * Get exhibits by case
 */
export async function getExhibitsByCase(
  caseId: string,
  filters?: Omit<ExhibitFilters, "caseId">
): Promise<Result<PaginatedResult<Exhibit>>> {
  if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
    return failure(new ValidationError("Case ID is required"));
  }

  return getAllExhibits({ ...filters, caseId });
}

export const trialApi = {
  getAllExhibits,
  getExhibitById,
  createExhibit,
  updateExhibit,
  deleteExhibit,
  getExhibitsByCase,
};
