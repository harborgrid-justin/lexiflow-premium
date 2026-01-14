/**
 * Trial Frontend API
 * Domain contract for trial preparation and exhibits
 */

import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getAllExhibits(
  caseId?: string
): Promise<Result<unknown[]>> {
  const params = caseId ? { caseId } : {};
  const result = await client.get<unknown>("/exhibits", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items);
}

export async function getExhibitById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Exhibit ID is required"));

  const result = await client.get<unknown>(`/exhibits/${id}`);
  if (!result.ok) return result;

  return success(result.data);
}

export async function createExhibit(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/exhibits", input);

  if (!result.ok) return result;
  return success(result.data);
}

export async function updateExhibit(
  id: string,
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Exhibit ID is required"));

  const result = await client.patch<unknown>(`/exhibits/${id}`, input);

  if (!result.ok) return result;
  return success(result.data);
}

export const trialApi = {
  getAllExhibits,
  getExhibitById,
  createExhibit,
  updateExhibit,
};
