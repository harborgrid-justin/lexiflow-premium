/**
 * Domains Frontend API
 * Domain contract for document domains (drafting, contracts, etc)
 *
 * @module lib/frontend-api/domains
 * @description Handles document domain operations per enterprise API standard
 *
 * Result Type Guarantee:
 * All functions return Promise<Result<T>> - never throw
 */

import {
  client,
  failure,
  type Result,
  success,
  ValidationError,
} from "./index";

/**
 * Get all document domains
 */
export async function getAllDomains(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/domains");
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Get domain by ID
 */
export async function getDomainById(id: string): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Domain ID is required"));
  return client.get<unknown>(`/domains/${id}`);
}

/**
 * Create new domain
 */
export async function createDomain(
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!input) return failure(new ValidationError("Domain input is required"));
  return client.post<unknown>("/domains", input);
}

/**
 * Update domain
 */
export async function updateDomain(
  id: string,
  input: Record<string, unknown>
): Promise<Result<unknown>> {
  if (!id) return failure(new ValidationError("Domain ID is required"));
  if (!input) return failure(new ValidationError("Domain input is required"));
  return client.patch<unknown>(`/domains/${id}`, input);
}

/**
 * Delete domain
 */
export async function deleteDomain(id: string): Promise<Result<void>> {
  if (!id) return failure(new ValidationError("Domain ID is required"));
  return client.delete<void>(`/domains/${id}`);
}

/**
 * Get drafting templates for domain
 */
export async function getDraftingTemplates(
  domainId: string
): Promise<Result<unknown[]>> {
  if (!domainId) return failure(new ValidationError("Domain ID is required"));
  const result = await client.get<unknown[]>(`/domains/${domainId}/templates`);
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Get domain clauses
 */
export async function getDomainClauses(
  domainId: string
): Promise<Result<unknown[]>> {
  if (!domainId) return failure(new ValidationError("Domain ID is required"));
  const result = await client.get<unknown[]>(`/domains/${domainId}/clauses`);
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Get domain rules and regulations
 */
export async function getDomainRules(
  domainId: string
): Promise<Result<unknown[]>> {
  if (!domainId) return failure(new ValidationError("Domain ID is required"));
  const result = await client.get<unknown[]>(`/domains/${domainId}/rules`);
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Validate document against domain rules
 */
export async function validateDocument(
  domainId: string,
  documentId: string
): Promise<Result<Record<string, unknown>>> {
  if (!domainId) return failure(new ValidationError("Domain ID is required"));
  if (!documentId)
    return failure(new ValidationError("Document ID is required"));
  return client.post<Record<string, unknown>>(
    `/domains/${domainId}/validate/${documentId}`,
    {}
  );
}

export const domainsApi = {
  getAllDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
  getDraftingTemplates,
  getDomainClauses,
  getDomainRules,
  validateDocument,
};
