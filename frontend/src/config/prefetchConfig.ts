// config/prefetchConfig.ts
/**
 * Prefetch configuration for router loaders
 * Maps route paths to query keys and data fetching functions
 *
 * Enterprise API Pattern:
 * - Uses new @/lib/frontend-api layer
 * - Handles Result<T> return types
 * - Gracefully handles errors
 * - Returns empty arrays on error (fallback)
 */

import {
  billingApi,
  casesApi,
  crmApi,
  discoveryApi,
  docketApi,
  documentsApi,
  workflowApi,
} from "@/lib/frontend-api";
import { queryKeys } from "../utils/query-keys.service";
import { PATHS } from "./paths.config";

export const PREFETCH_MAP: Record<
  string,
  { key: unknown; fn: () => Promise<unknown> }
> = {
  [PATHS.CASES]: {
    key: queryKeys.cases.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.MATTERS_OVERVIEW]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.MATTERS_CALENDAR]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.MATTERS_ANALYTICS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.MATTERS_INTAKE]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.MATTERS_OPERATIONS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.MATTERS_INSIGHTS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.MATTERS_FINANCIALS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      const result = await casesApi.getAllCases({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.DOCKET]: {
    key: queryKeys.docket.all(),
    fn: async () => {
      const result = await docketApi.getAllDocketEntries({
        page: 1,
        limit: 50,
      });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.DOCUMENTS]: {
    key: queryKeys.documents.all(),
    fn: async () => {
      const result = await documentsApi.getAllDocuments({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.WORKFLOWS]: {
    key: queryKeys.tasks.all(),
    fn: async () => {
      const result = await workflowApi.getAllTasks({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.BILLING]: {
    key: queryKeys.billing.timeEntries(),
    fn: async () => {
      const result = await billingApi.getAllTimeEntries({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.EVIDENCE]: {
    key: queryKeys.evidence.all(),
    fn: async () => {
      const result = await discoveryApi.getAllEvidence({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
  [PATHS.CRM]: {
    key: queryKeys.clients.all(),
    fn: async () => {
      const result = await crmApi.getAllClients({ page: 1, limit: 50 });
      return result.ok ? result.data.data : [];
    },
  },
};
