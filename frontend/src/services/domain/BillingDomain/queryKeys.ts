/**
 * BillingDomain Query Keys
 * React Query cache keys for billing operations
 *
 * @example
 * queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.timeEntries(caseId) });
 * queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoices() });
 */
export const BILLING_QUERY_KEYS = {
  all: () => ["billing"] as const,
  timeEntries: (caseId?: string) =>
    caseId
      ? (["billing", "time-entries", caseId] as const)
      : (["billing", "time-entries"] as const),
  invoices: () => ["billing", "invoices"] as const,
  invoice: (id: string) => ["billing", "invoice", id] as const,
  rates: (timekeeperId: string) => ["billing", "rates", timekeeperId] as const,
  wipStats: () => ["billing", "wip-stats"] as const,
  realizationStats: () => ["billing", "realization-stats"] as const,
  trustTransactions: (accountId: string) =>
    ["billing", "trust", accountId] as const,
  trustAccounts: () => ["billing", "trust-accounts"] as const,
  topAccounts: () => ["billing", "top-accounts"] as const,
  overviewStats: () => ["billing", "overview"] as const,
  operatingSummary: () => ["billing", "operating-summary"] as const,
  financialPerformance: () => ["billing", "financial-performance"] as const,
} as const;
