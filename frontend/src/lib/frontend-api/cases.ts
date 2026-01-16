/**
 * Cases Frontend API
 * Domain-level contract for case management operations
 *
 * @module lib/frontend-api/cases
 * @description Enterprise frontend API for cases per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * RESPONSIBILITIES:
 * ✓ Transport (via client)
 * ✓ Validation (via schemas)
 * ✓ Error typing (domain errors)
 * ✓ Normalization (UI-ready shapes)
 * ✓ Caching semantics (explicit)
 * ✓ Version adaptation (backend drift)
 * ✓ Retry / backoff (in client)
 *
 * FORBIDDEN:
 * ✗ React imports
 * ✗ Context access
 * ✗ UI state mutation
 * ✗ Optimistic updates
 * ✗ Throwing exceptions
 *
 * @example Loader usage
 * ```typescript
 * export async function casesLoader() {
 *   const result = await cases.getAll();
 *   if (!result.ok) throw result.error.toResponse();
 *   return result.data;
 * }
 * ```
 */

import type { Case } from "@/types";
import {
  denormalizeCase,
  normalizeCase,
  normalizeCases,
} from "../normalization/case";
import { client } from "./client";
import { NotFoundError, ValidationError } from "./errors";
import { validate, validators } from "./schemas";
import { type PaginatedResult, type Result, success } from "./types";

/**
 * Query parameters for case listing
 */
export interface CaseFilters {
  status?: Case["status"];
  matterType?: Case["matterType"];
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title" | "filingDate";
  sortOrder?: "asc" | "desc";
}

/**
 * Case creation input
 */
export interface CreateCaseInput {
  title: string;
  caseNumber?: string;
  description?: string;
  matterType?: Case["matterType"];
  status?: Case["status"];
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: Date;
  clientId?: string;
  leadAttorneyId?: string;
  estimatedValue?: number;
  tags?: string[];
}

/**
 * Case update input (partial)
 */
export interface UpdateCaseInput {
  title?: string;
  description?: string;
  status?: Case["status"];
  matterType?: Case["matterType"];
  jurisdiction?: string;
  court?: string;
  judge?: string;
  closeDate?: Date;
  estimatedValue?: number;
  tags?: string[];
}

/**
 * Case statistics
 */
export interface CaseStats {
  totalActive: number;
  intakePipeline: number;
  upcomingDeadlines: number;
  atRisk: number;
  totalValue: number;
  utilizationRate: number;
  averageAge: number;
  conversionRate: number;
  byStatus?: Record<string, number>;
}

/**
 * Get all cases with optional filtering
 */
export async function getAll(
  filters?: CaseFilters
): Promise<Result<PaginatedResult<Case>>> {
  // Build query params
  const params: Record<string, string | number> = {};

  if (filters?.status) params.status = filters.status;
  if (filters?.matterType) params.type = filters.matterType;
  if (filters?.clientId) params.clientId = filters.clientId;
  if (filters?.search) params.search = filters.search;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.order = filters.sortOrder;

  const result = await client.get<unknown>("/cases", { params });

  if (!result.ok) {
    return result;
  }

  // Normalize response
  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: normalizeCases(items),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

/**
 * Get single case by ID
 */
export async function getById(id: string): Promise<Result<Case>> {
  // Validate ID
  const validation = validate(
    { id },
    {
      id: {
        type: "string",
        required: true,
        validator: (v) => typeof v === "string" && v.length > 0,
        message: "Valid case ID is required",
      },
    }
  );

  if (!validation.ok) {
    return validation as Result<Case>;
  }

  const result = await client.get<unknown>(`/cases/${id}`);

  if (!result.ok) {
    return result;
  }

  // Check if case exists
  if (!result.data) {
    return { ok: false, error: new NotFoundError(`Case ${id} not found`) };
  }

  return success(normalizeCase(result.data));
}

/**
 * Create new case
 */
export async function create(input: CreateCaseInput): Promise<Result<Case>> {
  // Validate input
  const validation = validate(input, {
    title: {
      type: "string",
      required: true,
      min: 1,
      max: 500,
      message: "Case title is required (max 500 characters)",
    },
    caseNumber: {
      type: "string",
      max: 100,
    },
    description: {
      type: "string",
      max: 5000,
    },
    clientId: {
      type: "string",
      validator: (v) => !v || validators.uuid(v),
      message: "Invalid client ID format",
    },
    estimatedValue: {
      type: "number",
      min: 0,
      message: "Estimated value must be positive",
    },
  });

  if (!validation.ok) {
    return validation as Result<Case>;
  }

  // Denormalize for backend
  const backendPayload = denormalizeCase(input as Partial<Case>);

  const result = await client.post<unknown>("/cases", backendPayload);

  if (!result.ok) {
    return result;
  }

  return success(normalizeCase(result.data));
}

/**
 * Update existing case
 */
export async function update(
  id: string,
  input: UpdateCaseInput
): Promise<Result<Case>> {
  // Validate ID
  if (!id || typeof id !== "string" || id.trim() === "") {
    return {
      ok: false,
      error: new ValidationError("Valid case ID is required"),
    };
  }

  // Validate input (at least one field required)
  if (Object.keys(input).length === 0) {
    return {
      ok: false,
      error: new ValidationError("At least one field must be updated"),
    };
  }

  // Denormalize for backend
  const backendPayload = denormalizeCase(input as Partial<Case>);

  const result = await client.patch<unknown>(`/cases/${id}`, backendPayload);

  if (!result.ok) {
    return result;
  }

  return success(normalizeCase(result.data));
}

/**
 * Delete case
 */
export async function remove(id: string): Promise<Result<void>> {
  // Validate ID
  if (!id || typeof id !== "string" || id.trim() === "") {
    return {
      ok: false,
      error: new ValidationError("Valid case ID is required"),
    };
  }

  const result = await client.delete<void>(`/cases/${id}`);

  return result;
}

/**
 * Archive case
 */
export async function archive(id: string): Promise<Result<Case>> {
  // Validate ID
  if (!id || typeof id !== "string" || id.trim() === "") {
    return {
      ok: false,
      error: new ValidationError("Valid case ID is required"),
    };
  }

  const result = await client.post<unknown>(`/cases/${id}/archive`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeCase(result.data));
}

/**
 * Restore archived case
 */
export async function restore(id: string): Promise<Result<Case>> {
  // Validate ID
  if (!id || typeof id !== "string" || id.trim() === "") {
    return {
      ok: false,
      error: new ValidationError("Valid case ID is required"),
    };
  }

  const result = await client.post<unknown>(`/cases/${id}/restore`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeCase(result.data));
}

/**
 * Get case statistics
 */
export async function getStats(): Promise<Result<CaseStats>> {
  const result = await client.get<CaseStats>("/cases/stats");

  if (!result.ok) {
    return result;
  }

  // Return as-is (stats shape is already normalized)
  return success(result.data);
}

/**
 * Search cases by text query
 */
export async function search(
  query: string,
  options?: { limit?: number }
): Promise<Result<Case[]>> {
  // Validate query
  if (!query || typeof query !== "string" || query.trim() === "") {
    return {
      ok: false,
      error: new ValidationError("Search query is required"),
    };
  }

  const params: Record<string, string | number> = { q: query.trim() };
  if (options?.limit) params.limit = options.limit;

  const result = await client.get<unknown>("/cases/search", { params });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeCases(items));
}

/**
 * Cases frontend API module
 */
export const casesApi = {
  getAll,
  getById,
  create,
  update,
  remove,
  archive,
  restore,
  getStats,
  search,
} as const;
