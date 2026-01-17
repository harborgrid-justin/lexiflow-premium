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
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.MATTERS_OVERVIEW]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.MATTERS_CALENDAR]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.MATTERS_ANALYTICS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.MATTERS_INTAKE]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.MATTERS_OPERATIONS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.MATTERS_INSIGHTS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.MATTERS_FINANCIALS]: {
    key: queryKeys.cases.matters.all(),
    fn: async () => {
      try {
        return await casesApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.DOCKET]: {
    key: queryKeys.docket.all(),
    fn: async () => {
      try {
        return await docketApi.getAll(); // No parameters - caseId is optional
      } catch {
        return [];
      }
    },
  },
  [PATHS.DOCUMENTS]: {
    key: queryKeys.documents.all(),
    fn: async () => {
      try {
        return await documentsApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.WORKFLOWS]: {
    key: queryKeys.tasks.all(),
    fn: async () => {
      try {
        return await workflowApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.BILLING]: {
    key: queryKeys.billing.timeEntries(),
    fn: async () => {
      try {
        return await billingApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.EVIDENCE]: {
    key: queryKeys.evidence.all(),
    fn: async () => {
      try {
        return await discoveryApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
  [PATHS.CRM]: {
    key: queryKeys.clients.all(),
    fn: async () => {
      try {
        return await communicationsApi.getAll({ page: 1, limit: 50 });
      } catch {
        return [];
      }
    },
  },
};
