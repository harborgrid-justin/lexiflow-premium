/**
 * Enterprise Frontend API
 * Domain contract for enterprise-wide operations
 *
 * @module lib/frontend-api/enterprise
 * @description Handles enterprise-level operations per enterprise API standard
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
 * Get enterprise overview/dashboard
 */
export async function getEnterpriseOverview(): Promise<Result<Record<string, unknown>>> {
  return client.get<Record<string, unknown>>("/enterprise/overview");
}

/**
 * Get enterprise settings
 */
export async function getEnterpriseSettings(): Promise<Result<Record<string, unknown>>> {
  return client.get<Record<string, unknown>>("/enterprise/settings");
}

/**
 * Update enterprise settings
 */
export async function updateEnterpriseSettings(
  input: Record<string, unknown>
): Promise<Result<Record<string, unknown>>> {
  if (!input)
    return failure(new ValidationError("Enterprise settings input is required"));
  return client.patch<Record<string, unknown>>("/enterprise/settings", input);
}

/**
 * Get enterprise organizations
 */
export async function getEnterpriseOrganizations(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/enterprise/organizations");
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Get enterprise users
 */
export async function getEnterpriseUsers(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/enterprise/users");
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Get enterprise licenses
 */
export async function getEnterpriseLicenses(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/enterprise/licenses");
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Get enterprise usage statistics
 */
export async function getEnterpriseUsageStats(): Promise<Result<Record<string, unknown>>> {
  return client.get<Record<string, unknown>>("/enterprise/usage");
}

/**
 * Get enterprise audit logs
 */
export async function getEnterpriseAuditLogs(
  filters?: Record<string, unknown>
): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/enterprise/audit-logs", {
    params: filters,
  });
  if (!result.ok) return result;
  return success(result.data || []);
}

/**
 * Get enterprise security report
 */
export async function getEnterpriseSecurityReport(): Promise<Result<Record<string, unknown>>> {
  return client.get<Record<string, unknown>>("/enterprise/security/report");
}

/**
 * Get enterprise integrations
 */
export async function getEnterpriseIntegrations(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown[]>("/enterprise/integrations");
  if (!result.ok) return result;
  return success(result.data || []);
}

export const enterpriseApi = {
  getEnterpriseOverview,
  getEnterpriseSettings,
  updateEnterpriseSettings,
  getEnterpriseOrganizations,
  getEnterpriseUsers,
  getEnterpriseLicenses,
  getEnterpriseUsageStats,
  getEnterpriseAuditLogs,
  getEnterpriseSecurityReport,
  getEnterpriseIntegrations,
};
