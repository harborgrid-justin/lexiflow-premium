/**
 * Integrations Frontend API
 * Enterprise-grade API layer for external integrations and webhooks
 *
 * @module lib/frontend-api/integrations
 * @description Domain-level contract for integrations operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 */

import {
  normalizeIntegration,
  normalizeIntegrations,
} from "../normalization/integrations";
import { client } from "./client";
import { ValidationError } from "./errors";
import { failure, type PaginatedResult, type Result, success } from "./types";

/**
 * Integration filters
 */
export interface IntegrationFilters {
  status?: "active" | "inactive" | "failed" | "pending";
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

/**
 * Create integration input
 */
export interface CreateIntegrationInput {
  name: string;
  type: string;
  description?: string;
  config: Record<string, unknown>;
  enabled?: boolean;
}

/**
 * Update integration input
 */
export interface UpdateIntegrationInput {
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
  enabled?: boolean;
}

/**
 * Integration item
 */
export interface Integration {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: "active" | "inactive" | "failed" | "pending";
  enabled: boolean;
  config: Record<string, unknown>;
  lastSync?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all integrations with pagination and filters
 */
export async function getAllIntegrations(
  filters?: IntegrationFilters
): Promise<Result<PaginatedResult<Integration>>> {
  // Validation
  if (filters?.page !== undefined && filters.page < 1) {
    return failure(new ValidationError("Page must be greater than 0"));
  }
  if (filters?.limit !== undefined && filters.limit < 1) {
    return failure(new ValidationError("Limit must be greater than 0"));
  }

  const params: Record<string, string | number> = {};

  if (filters?.status) params.status = filters.status;
  if (
    filters?.type &&
    typeof filters.type === "string" &&
    filters.type.trim()
  ) {
    params.type = filters.type.trim();
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

  const result = await client.get<unknown>("/integrations", { params });

  if (!result.ok) {
    return result;
  }

  const data = result.data as Record<string, unknown>;
  const items = Array.isArray(data.data) ? data.data : [];
  const total = typeof data.total === "number" ? data.total : 0;
  const page = typeof data.page === "number" ? data.page : 1;
  const limit = typeof data.limit === "number" ? data.limit : 50;

  const normalized = normalizeIntegrations(items);
  return success({
    data: normalized as Integration[],
    total,
    page,
    pageSize: limit,
    hasMore: page * limit < total,
  });
}

/**
 * Get integration by ID
 */
export async function getIntegrationById(
  id: string
): Promise<Result<Integration>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.get<unknown>(`/integrations/${id.trim()}`);

  if (!result.ok) {
    return result;
  }

  const normalized = normalizeIntegration(result.data);
  return success(normalized as Integration);
}

/**
 * Create new integration
 */
export async function createIntegration(
  input: CreateIntegrationInput
): Promise<Result<Integration>> {
  // Validation
  if (
    !input.name ||
    typeof input.name !== "string" ||
    input.name.trim() === ""
  ) {
    return failure(new ValidationError("Integration name is required"));
  }
  if (
    !input.type ||
    typeof input.type !== "string" ||
    input.type.trim() === ""
  ) {
    return failure(new ValidationError("Integration type is required"));
  }
  if (!input.config || typeof input.config !== "object") {
    return failure(new ValidationError("Integration config is required"));
  }

  const result = await client.post<unknown>("/integrations", input);

  if (!result.ok) {
    return result;
  }

  const normalized = normalizeIntegration(result.data);
  return success(normalized as Integration);
}

/**
 * Update integration
 */
export async function updateIntegration(
  id: string,
  input: UpdateIntegrationInput
): Promise<Result<Integration>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.patch<unknown>(
    `/integrations/${id.trim()}`,
    input
  );

  if (!result.ok) {
    return result;
  }

  const normalized = normalizeIntegration(result.data);
  return success(normalized as Integration);
}

/**
 * Delete integration
 */
export async function deleteIntegration(id: string): Promise<Result<void>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.delete<void>(`/integrations/${id.trim()}`);

  return result;
}

/**
 * Enable integration
 */
export async function enableIntegration(
  id: string
): Promise<Result<Integration>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.post<unknown>(
    `/integrations/${id.trim()}/enable`
  );

  if (!result.ok) {
    return result;
  }

  const normalized = normalizeIntegration(result.data);
  return success(normalized as Integration);
}

/**
 * Disable integration
 */
export async function disableIntegration(
  id: string
): Promise<Result<Integration>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.post<unknown>(
    `/integrations/${id.trim()}/disable`
  );

  if (!result.ok) {
    return result;
  }

  const normalized = normalizeIntegration(result.data);
  return success(normalized as Integration);
}

/**
 * Sync integration
 */
export async function syncIntegration(
  id: string
): Promise<Result<{ syncedAt: string; recordsUpdated: number }>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.post<unknown>(`/integrations/${id.trim()}/sync`);

  if (!result.ok) {
    return result;
  }

  const data = result.data as Record<string, unknown>;
  return success({
    syncedAt: data.syncedAt as string,
    recordsUpdated:
      typeof data.recordsUpdated === "number" ? data.recordsUpdated : 0,
  });
}

export const integrationsApi = {
  getAllIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  enableIntegration,
  disableIntegration,
  syncIntegration,
};
