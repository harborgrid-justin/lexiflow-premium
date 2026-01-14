/**
 * Discovery Frontend API
 * Domain contract for evidence and discovery management
 */

import {
  normalizeEvidence,
  normalizeEvidenceArray,
} from "../normalization/discovery";
import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getAllEvidence(
  caseId?: string
): Promise<Result<unknown[]>> {
  const params = caseId ? { caseId } : {};
  const result = await client.get<unknown>("/evidence", { params });

  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeEvidenceArray(items));
}

export async function getEvidenceById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Evidence ID is required"));

  const result = await client.get<unknown>(`/evidence/${id}`);
  if (!result.ok) return result;

  return success(normalizeEvidence(result.data));
}

export async function createEvidence(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  const result = await client.post<unknown>("/evidence", input);

  if (!result.ok) return result;
  return success(normalizeEvidence(result.data));
}

export async function updateEvidence(
  id: string,
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Evidence ID is required"));

  const result = await client.patch<unknown>(`/evidence/${id}`, input);

  if (!result.ok) return result;
  return success(normalizeEvidence(result.data));
}

export async function removeEvidence(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Evidence ID is required"));
  return client.delete<void>(`/evidence/${id}`);
}

export const discoveryApi = {
  getAllEvidence,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  removeEvidence,
};
