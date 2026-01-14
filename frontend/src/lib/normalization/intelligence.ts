/**
 * Intelligence Domain Normalizers
 * Transform backend AI/intelligence data to frontend format
 */

import {
  normalizeArray,
  normalizeDate,
  normalizeId,
  normalizeNumber,
  normalizeString,
  type Normalizer,
} from "./core";

interface BackendPrediction {
  id: string | number;
  model_name?: string;
  prediction_type?: string;
  confidence?: number;
  result?: unknown;
  created_at?: string;
}

export const normalizePrediction: Normalizer<BackendPrediction, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    modelName: normalizeString(backend.model_name),
    predictionType: normalizeString(backend.prediction_type),
    confidence: normalizeNumber(backend.confidence),
    result: backend.result,
    createdAt: normalizeDate(backend.created_at) || new Date(),
  };
};

export function normalizePredictions(backendPredictions: unknown): unknown[] {
  return normalizeArray(backendPredictions, normalizePrediction);
}
