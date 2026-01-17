/**
 * Enterprise Frontend API
 * Enterprise-grade API layer for enterprise-wide operations
 *
 * @module lib/frontend-api/enterprise
 * @description Handles enterprise-level operations per architectural standard:
 * - Stable contract between UI and backend
 * - Returns Result<T>, never throws
 * - Domain errors only
 * - Input validation
 * - Data normalization
 * - No React/UI dependencies
 * - Pure and deterministic
 *
 * RESPONSIBILITIES:
 * ✓ Enterprise settings management
 * ✓ Organization and user management
 * ✓ Licensing and usage tracking
 * ✓ Security and audit capabilities
 * ✓ System health monitoring
 * ✓ No state mutations
 * ✓ No UI dependencies
 *
 * FORBIDDEN:
 * ✗ React imports
 * ✗ Context access
 * ✗ UI state mutation
 * ✗ Throwing exceptions
 */

import { toArray, toRecord } from "./guards";

import {
  client,
  failure,
  type PaginatedResult,
  type Result,
  success,
  ValidationError,
} from "./index";

/**
 * Enterprise settings input
 */
export interface EnterpriseSettingsInput {
  name?: string;
  description?: string;
  logo?: string;
  theme?: Record<string, unknown>;
  notifications?: Record<string, unknown>;
  integrations?: Record<string, unknown>;
  security?: Record<string, unknown>;
}

/**
 * Enterprise filters
 */
export interface EnterpriseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

/**
 * Enterprise overview
 */
export interface EnterpriseOverview {
  totalUsers: number;
  activeUsers: number;
  totalOrganizations: number;
  totalCases: number;
  totalDocuments: number;
  storageUsed: number;
  storageLimit: number;
  lastUpdated: string;
}

/**
 * Enterprise settings
 */
export interface EnterpriseSettings {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  theme: Record<string, unknown>;
  notifications: Record<string, unknown>;
  integrations: Record<string, unknown>;
  security: Record<string, unknown>;
  updatedAt: string;
}

/**
 * Organization item
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "suspended";
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * User item
 */
export interface EnterpriseUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * License item
 */
export interface License {
  id: string;
  type: string;
  status: "active" | "expired" | "suspended";
  expiresAt: string;
  users: number;
  features: string[];
  createdAt: string;
}

/**
 * Get enterprise overview/dashboard
 */
export async function getEnterpriseOverview(): Promise<
  Result<EnterpriseOverview>
> {
  const result = await client.get<unknown>("/enterprise/overview");
  if (!result.ok) return result;

  const data = toRecord(result.data);
  return success({
    totalUsers: typeof data.totalUsers === "number" ? data.totalUsers : 0,
    activeUsers: typeof data.activeUsers === "number" ? data.activeUsers : 0,
    totalOrganizations:
      typeof data.totalOrganizations === "number" ? data.totalOrganizations : 0,
    totalCases: typeof data.totalCases === "number" ? data.totalCases : 0,
    totalDocuments:
      typeof data.totalDocuments === "number" ? data.totalDocuments : 0,
    storageUsed: typeof data.storageUsed === "number" ? data.storageUsed : 0,
    storageLimit: typeof data.storageLimit === "number" ? data.storageLimit : 0,
    lastUpdated: data.lastUpdated as string,
  });
}

/**
 * Get enterprise settings
 */
export async function getEnterpriseSettings(): Promise<
  Result<EnterpriseSettings>
> {
  const result = await client.get<unknown>("/enterprise/settings");
  if (!result.ok) return result;

  const data = toRecord(result.data);
  return success({
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    logo: data.logo as string | undefined,
    theme: toRecord(data.theme),
    notifications: toRecord(data.notifications),
    integrations: toRecord(data.integrations),
    security: toRecord(data.security),
    updatedAt: data.updatedAt as string,
  });
}

/**
 * Update enterprise settings
 */
export async function updateEnterpriseSettings(
  input: EnterpriseSettingsInput
): Promise<Result<EnterpriseSettings>> {
  if (!input) {
    return failure(
      new ValidationError("Enterprise settings input is required")
    );
  }

  const result = await client.patch<unknown>("/enterprise/settings", input);
  if (!result.ok) return result;

  const data = toRecord(result.data);
  return success({
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    logo: data.logo as string | undefined,
    theme: toRecord(data.theme),
    notifications: toRecord(data.notifications),
    integrations: toRecord(data.integrations),
    security: toRecord(data.security),
    updatedAt: data.updatedAt as string,
  });
}

/**
 * Get enterprise organizations with pagination
 */
export async function getEnterpriseOrganizations(
  filters?: EnterpriseFilters
): Promise<Result<PaginatedResult<Organization>>> {
  // Validation
  if (filters?.page !== undefined && filters.page < 1) {
    return failure(new ValidationError("Page must be greater than 0"));
  }
  if (filters?.limit !== undefined && filters.limit < 1) {
    return failure(new ValidationError("Limit must be greater than 0"));
  }

  const params: Record<string, string | number> = {};

  if (
    filters?.search &&
    typeof filters.search === "string" &&
    filters.search.trim()
  ) {
    params.search = filters.search.trim();
  }
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/enterprise/organizations", {
    params,
  });
  if (!result.ok) return result;

  const data = toRecord(result.data);
  const items = Array.isArray(data.data) ? data.data : [];
  const total = typeof data.total === "number" ? data.total : 0;
  const page = typeof data.page === "number" ? data.page : 1;
  const limit = typeof data.limit === "number" ? data.limit : 50;

  return success({
    data: items as Organization[],
    total,
    page,
    pageSize: limit,
    hasMore: page * limit < total,
  });
}

/**
 * Get enterprise users with pagination
 */
export async function getEnterpriseUsers(
  filters?: EnterpriseFilters
): Promise<Result<PaginatedResult<EnterpriseUser>>> {
  // Validation
  if (filters?.page !== undefined && filters.page < 1) {
    return failure(new ValidationError("Page must be greater than 0"));
  }
  if (filters?.limit !== undefined && filters.limit < 1) {
    return failure(new ValidationError("Limit must be greater than 0"));
  }

  const params: Record<string, string | number> = {};

  if (
    filters?.search &&
    typeof filters.search === "string" &&
    filters.search.trim()
  ) {
    params.search = filters.search.trim();
  }
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.sortBy) params.sortBy = filters.sortBy;
  if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

  const result = await client.get<unknown>("/enterprise/users", { params });
  if (!result.ok) return result;

  const data = toRecord(result.data);
  const items = Array.isArray(data.data) ? data.data : [];
  const total = typeof data.total === "number" ? data.total : 0;
  const page = typeof data.page === "number" ? data.page : 1;
  const limit = typeof data.limit === "number" ? data.limit : 50;

  return success({
    data: items as EnterpriseUser[],
    total,
    page,
    pageSize: limit,
    hasMore: page * limit < total,
  });
}

/**
 * Get enterprise licenses
 */
export async function getEnterpriseLicenses(): Promise<Result<License[]>> {
  const result = await client.get<unknown>("/enterprise/licenses");
  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(items as License[]);
}

/**
 * Get enterprise usage statistics
 */
export async function getEnterpriseUsageStats(): Promise<
  Result<Record<string, unknown>>
> {
  const result = await client.get<unknown>("/enterprise/usage");
  if (!result.ok) return result;

  return success(toRecord(result.data));
}

/**
 * Get enterprise audit logs
 */
export async function getEnterpriseAuditLogs(
  filters?: Record<string, unknown>
): Promise<Result<unknown[]>> {
  const result = await client.get<unknown>("/enterprise/audit-logs", {
    params: filters,
  });
  if (!result.ok) return result;
  return success(
    toArray(toRecord(result.data).data)
  );
}

/**
 * Get enterprise security report
 */
export async function getEnterpriseSecurityReport(): Promise<
  Result<Record<string, unknown>>
> {
  const result = await client.get<unknown>("/enterprise/security/report");
  if (!result.ok) return result;

  return success(toRecord(result.data));
}

/**
 * Get enterprise integrations
 */
export async function getEnterpriseIntegrations(): Promise<Result<unknown[]>> {
  const result = await client.get<unknown>("/enterprise/integrations");
  if (!result.ok) return result;
  return success((result.data as unknown[]) || []);
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
