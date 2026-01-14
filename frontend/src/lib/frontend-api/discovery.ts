/**
 * Discovery Frontend API
 * Enterprise-grade API layer for discovery and evidence management
 *
 * @module lib/frontend-api/discovery
 * @description Domain-level contract for discovery operations per architectural standard:
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
 */

import type { EvidenceItem } from "@/types";
import {
  normalizeEvidence,
  normalizeEvidenceArray,
} from "../normalization/discovery";
import {
  client,
  failure,
  type PaginatedResult,
  type Result,
  success,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "./index";

/**
 * Evidence query filters
 */
export interface EvidenceFilters {
  caseId?: string;
  type?: string;
  status?: string;
  custodian?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: keyof EvidenceItem;
  sortOrder?: "asc" | "desc";
}

/**
 * Evidence creation input
 */
export interface CreateEvidenceInput {
  caseId: string;
  title: string;
  description?: string;
  type: string;
  status?: string;
  custodian?: string;
  location?: string;
  chainOfCustody?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Evidence update input
 */
export interface UpdateEvidenceInput {
  title?: string;
  description?: string;
  status?: string;
  custodian?: string;
  location?: string;
  chainOfCustody?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Get all evidence items with optional filtering
 */
export async function getAllEvidence(
  filters?: EvidenceFilters
): Promise<Result<PaginatedResult<EvidenceItem>>> {
  const params: Record<string, string | number> = {};

  if (filters?.caseId) params.caseId = filters.caseId;
  if (filters?.type) params.type = filters.type;
  if (filters?.status) params.status = filters.status;
  if (filters?.custodian) params.custodian = filters.custodian;
  if (filters?.search) params.search = filters.search;
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy as string;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/evidence", { params });

  if (!result.ok) return result;

  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: normalizeEvidenceArray(items),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

/**
 * Get evidence by ID
 */
export async function getEvidenceById(id: string): Promise<Result<EvidenceItem>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid evidence ID is required"));
  }

  const result = await client.get<unknown>(`/evidence/${id}`);

  if (!result.ok) {
    return result;
  }

  if (!result.data) {
    return failure(new NotFoundError(`Evidence ${id} not found`));
  }

  return success(normalizeEvidence(result.data));
}

/**
 * Create evidence item
 */
export async function createEvidence(
  input: CreateEvidenceInput
): Promise<Result<EvidenceItem>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Evidence input is required"));
  }

  if (!input.caseId || typeof input.caseId !== "string") {
    return failure(new ValidationError("Case ID is required"));
  }

  if (!input.title || typeof input.title !== "string") {
    return failure(new ValidationError("Evidence title is required"));
  }

  const result = await client.post<unknown>("/evidence", input);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEvidence(result.data));
}

/**
 * Update evidence item
 */
export async function updateEvidence(
  id: string,
  input: UpdateEvidenceInput
): Promise<Result<EvidenceItem>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid evidence ID is required"));
  }

  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    return failure(
      new ValidationError("At least one field must be updated")
    );
  }

  const result = await client.patch<unknown>(`/evidence/${id}`, input);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEvidence(result.data));
}

/**
 * Delete evidence item
 */
export async function removeEvidence(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid evidence ID is required"));
  }

  return client.delete<void>(`/evidence/${id}`);
}

/**
 * Update evidence chain of custody
 */
export async function updateChainOfCustody(
  id: string,
  entry: Record<string, unknown>
): Promise<Result<EvidenceItem>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid evidence ID is required"));
  }

  if (!entry || typeof entry !== "object") {
    return failure(new ValidationError("Chain of custody entry is required"));
  }

  const result = await client.post<unknown>(
    `/evidence/${id}/chain-of-custody`,
    entry
  );

  if (!result.ok) {
    return result;
  }

  return success(normalizeEvidence(result.data));
}

/**
 * Search evidence by text query
 */
export async function searchEvidence(
  query: string,
  caseId?: string,
  options?: { limit?: number }
): Promise<Result<EvidenceItem[]>> {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return failure(new ValidationError("Search query is required"));
  }

  const params: Record<string, string | number> = { q: query.trim() };
  if (caseId) params.caseId = caseId;
  if (options?.limit) params.limit = options.limit;

  const result = await client.get<unknown>("/evidence/search", { params });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeEvidenceArray(items));
}

/**
 * Get evidence by case ID (convenience function)
 */
export async function getEvidenceByCase(
  caseId: string
): Promise<Result<EvidenceItem[]>> {
  if (!caseId || typeof caseId !== "string" || caseId.trim() === "") {
    return failure(new ValidationError("Valid case ID is required"));
  }

  const result = await getAllEvidence({ caseId, limit: 1000 });

  if (!result.ok) {
    return result;
  }

  return success(result.data.data);
}

/**
 * Export evidence items (e.g., to CSV or PDF)
 */
export async function exportEvidence(
  ids: string[],
  format: "csv" | "json" | "pdf"
): Promise<Result<Blob>> {
  if (!Array.isArray(ids) || ids.length === 0) {
    return failure(
      new ValidationError("At least one evidence ID is required")
    );
  }

  if (!["csv", "json", "pdf"].includes(format)) {
    return failure(
      new ValidationError("Format must be one of: csv, json, pdf")
    );
  }

  const result = await client.post<Blob>("/evidence/export", {
    ids,
    format,
  });

  return result;
}

/**
 * Discovery API module
 */
export const discoveryApi = {
  getAllEvidence,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  removeEvidence,
  updateChainOfCustody,
  searchEvidence,
  getEvidenceByCase,
  exportEvidence,
} as const;
