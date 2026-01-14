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

import {
  adminApi,
  analyticsApi,
  authApi,
  billingApi,
  casesApi,
  communicationsApi,
  complianceApi,
  discoveryApi,
  docketApi,
  documentsApi,
  hrApi,
  integrationsApi,
  intelligenceApi,
  trialApi,
  workflowApi,
} from "@/lib/frontend-api";

/**
 * Consolidated API object containing all domain APIs
 */
export const api = {
  admin: adminApi,
  analytics: analyticsApi,
  auth: authApi,
  billing: billingApi,
  cases: casesApi,
  communications: communicationsApi,
  compliance: complianceApi,
  discovery: discoveryApi,
  docket: docketApi,
  documents: documentsApi,
  hr: hrApi,
  integrations: integrationsApi,
  intelligence: intelligenceApi,
  trial: trialApi,
  workflow: workflowApi,
};

// Re-export everything from frontend-api for convenience
export * from "@/lib/frontend-api";
