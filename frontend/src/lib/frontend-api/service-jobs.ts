/**
 * Service Jobs Frontend API
 * Enterprise-grade API layer for service of process jobs
 */

import type { ServiceJob } from "@/types";
import { client } from "./client";
import { ValidationError } from "./errors";
import { failure, type PaginatedResult, type Result, success } from "./types";

export interface ServiceJobFilters {
  caseId?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export async function getServiceJobs(
  filters?: ServiceJobFilters
): Promise<Result<PaginatedResult<ServiceJob>>> {
  const params: Record<string, string | number> = {};

  if (filters?.caseId) params.caseId = filters.caseId;
  if (filters?.status) params.status = filters.status;
  if (filters?.type) params.type = filters.type;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;

  const result = await client.get<unknown>("/service-jobs", { params });

  if (!result.ok) return result;

  const response = result.data as Record<string, unknown>;
  const items = Array.isArray(response.data) ? response.data : [];
  const total =
    typeof response.total === "number" ? response.total : items.length;
  const page = typeof response.page === "number" ? response.page : 1;
  const pageSize =
    typeof response.pageSize === "number" ? response.pageSize : items.length;

  return success({
    data: items as ServiceJob[],
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

export async function createServiceJob(
  input: Partial<ServiceJob>
): Promise<Result<ServiceJob>> {
  if (!input || typeof input !== "object") {
    return failure(new ValidationError("Service job input is required"));
  }

  const result = await client.post<ServiceJob>("/service-jobs", input);
  if (!result.ok) return result;
  return success(result.data);
}

export async function updateServiceJob(
  id: string,
  input: Partial<ServiceJob>
): Promise<Result<ServiceJob>> {
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid service job ID is required"));
  }

  if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
    return failure(new ValidationError("At least one field must be updated"));
  }

  const result = await client.put<ServiceJob>(`/service-jobs/${id}`, input);
  if (!result.ok) return result;
  return success(result.data);
}

export const serviceJobsApi = {
  getServiceJobs,
  createServiceJob,
  updateServiceJob,
};
