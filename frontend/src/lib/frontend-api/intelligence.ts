/**
 * Intelligence Frontend API
 * AI predictions and legal research operations
 */

import {
  normalizePrediction,
  normalizePredictions,
} from "../normalization/intelligence";
import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getPredictions(caseId?: string): Promise<Result<any[]>> {
  const params = caseId ? { caseId } : {};
  const result = await client.get<unknown>("/intelligence/predictions", {
    params,
  });

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizePredictions(items));
}

export async function requestPrediction(input: {
  type: string;
  caseId: string;
  parameters?: Record<string, unknown>;
}): Promise<Result<any>> {
  if (!input.type || !input.caseId) {
    return failure(
      new ValidationError("Prediction type and case ID are required")
    );
  }

  const result = await client.post<unknown>("/intelligence/predictions", input);

  if (!result.ok) {
    return result;
  }

  return success(normalizePrediction(result.data));
}

export async function getLegalResearch(query: string): Promise<Result<any>> {
  if (!query || query.trim() === "") {
    return failure(new ValidationError("Search query is required"));
  }

  const result = await client.post<unknown>("/intelligence/research", {
    query,
  });

  if (!result.ok) {
    return result;
  }

  return success(result.data);
}

export const intelligenceApi = {
  getPredictions,
  requestPrediction,
  getLegalResearch,
};
