/**
 * Docket Frontend API
 * Domain contract for docket entry management
 */

import {
  denormalizeDocketEntry,
  normalizeDocketEntries,
  normalizeDocketEntry,
} from "../normalization/docket";
import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getAll(caseId?: string): Promise<Result<unknown[]>> {
  const params = caseId ? { caseId } : {};
  const result = await client.get<unknown>("/docket", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeDocketEntries(items));
}

export async function getById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Docket entry ID is required"));

  const result = await client.get<unknown>(`/docket/${id}`);
  if (!result.ok) return result;

  return success(normalizeDocketEntry(result.data));
}

export async function create(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  const payload = denormalizeDocketEntry(input);
  const result = await client.post<unknown>("/docket", payload);

  if (!result.ok) return result;
  return success(normalizeDocketEntry(result.data));
}

export async function update(
  id: string,
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Docket entry ID is required"));

  const payload = denormalizeDocketEntry(input);
  const result = await client.patch<unknown>(`/docket/${id}`, payload);

  if (!result.ok) return result;
  return success(normalizeDocketEntry(result.data));
}

export async function remove(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Docket entry ID is required"));
  return client.delete<void>(`/docket/${id}`);
}

export const docketApi = { getAll, getById, create, update, remove };
