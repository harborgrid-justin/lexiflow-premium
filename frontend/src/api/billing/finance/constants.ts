/**
 * Billing Query Keys Constants
 * For React Query cache invalidation and refetching
 */
export const BILLING_QUERY_KEYS = {
  timeEntries: {
    all: () => ["billing", "time-entries"] as const,
    byId: (id: string) => ["billing", "time-entries", id] as const,
    byCase: (caseId: string) =>
      ["billing", "time-entries", "case", caseId] as const,
    byUser: (userId: string) =>
      ["billing", "time-entries", "user", userId] as const,
    unbilled: (caseId: string) =>
      ["billing", "time-entries", "case", caseId, "unbilled"] as const,
    totals: (caseId: string) =>
      ["billing", "time-entries", "case", caseId, "totals"] as const,
  },
  invoices: {
    all: () => ["billing", "invoices"] as const,
    byId: (id: string) => ["billing", "invoices", id] as const,
    byCase: (caseId: string) =>
      ["billing", "invoices", "case", caseId] as const,
    byClient: (clientId: string) =>
      ["billing", "invoices", "client", clientId] as const,
  },
  trustAccounts: {
    all: () => ["billing", "trust-accounts"] as const,
    byClient: (clientId: string) =>
      ["billing", "trust-accounts", "client", clientId] as const,
  },
  stats: {
    wip: () => ["billing", "stats", "wip"] as const,
    realization: () => ["billing", "stats", "realization"] as const,
    overview: () => ["billing", "stats", "overview"] as const,
  },
  rates: {
    byTimekeeper: (timekeeperId: string) =>
      ["billing", "rates", "timekeeper", timekeeperId] as const,
  },
} as const;
