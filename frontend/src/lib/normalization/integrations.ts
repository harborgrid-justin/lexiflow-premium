/**
 * Integrations Domain Normalizers
 * Transform backend integration data to frontend format
 */

import {
  normalizeArray,
  normalizeBoolean,
  normalizeDate,
  normalizeId,
  normalizeString,
  type Normalizer,
} from "./core";

interface BackendIntegration {
  id: string | number;
  name?: string;
  type?: string;
  status?: string;
  is_enabled?: boolean;
  config?: Record<string, unknown>;
  last_sync?: string;
  created_at?: string;
}

export const normalizeIntegration: Normalizer<BackendIntegration, unknown> = (
  backend
) => {
  return {
    id: normalizeId(backend.id),
    name: normalizeString(backend.name),
    type: normalizeString(backend.type),
    status: normalizeString(backend.status),
    isEnabled: normalizeBoolean(backend.is_enabled),
    config: backend.config || {},
    lastSync: normalizeDate(backend.last_sync),
    createdAt: normalizeDate(backend.created_at) || new Date(),
  };
};

export function normalizeIntegrations(backendIntegrations: unknown): unknown[] {
  return normalizeArray(backendIntegrations, normalizeIntegration);
}
