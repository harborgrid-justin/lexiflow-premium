/**
 * Integrations Frontend API
 * External integrations and webhooks management
 */

import {
  normalizeIntegration,
  normalizeIntegrations,
} from "../normalization/integrations";
import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

export async function getAllIntegrations(): Promise<Result<any[]>> {
  const result = await client.get<unknown>("/integrations");

  if (!result.ok) {
    return result;
  }

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeIntegrations(items));
}

export async function getIntegrationById(id: string): Promise<Result<any>> {
  if (!id) {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.get<unknown>(`/integrations/${id}`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeIntegration(result.data));
}

export async function enableIntegration(id: string): Promise<Result<any>> {
  if (!id) {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.post<unknown>(`/integrations/${id}/enable`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeIntegration(result.data));
}

export async function disableIntegration(id: string): Promise<Result<any>> {
  if (!id) {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.post<unknown>(`/integrations/${id}/disable`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeIntegration(result.data));
}

export async function syncIntegration(id: string): Promise<Result<any>> {
  if (!id) {
    return failure(new ValidationError("Integration ID is required"));
  }

  const result = await client.post<unknown>(`/integrations/${id}/sync`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeIntegration(result.data));
}

export const integrationsApi = {
  getAllIntegrations,
  getIntegrationById,
  enableIntegration,
  disableIntegration,
  syncIntegration,
};
