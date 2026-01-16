/**
 * @module services/api
 * @description Consolidated API object for all domain APIs
 *
 * This provides a single `api` object that contains all domain APIs as properties.
 * This is a compatibility layer for code that uses `api.workflow.*` pattern.
 *
 * Usage:
 * ```typescript
 * import { api } from '@/services/api';
 *
 * const templates = await api.workflow.getTemplates();
 * const cases = await api.cases.getAll();
 * ```
 *
 * Prefer importing domain APIs directly from '@/lib/frontend-api':
 * ```typescript
 * import { workflowApi, casesApi } from '@/lib/frontend-api';
 *
 * const templates = await workflowApi.getTemplates();
 * const cases = await casesApi.getAll();
 * ```
 */

import { api as domainApi } from "@/api";

/**
 * Consolidated API object containing all domain APIs
 */
export const api = domainApi;

// Re-export domain APIs for convenience
export * from "@/api";
