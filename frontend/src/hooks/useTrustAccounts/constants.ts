/**
 * Constants for useTrustAccounts hooks
 * @module hooks/useTrustAccounts/constants
 */

import type { TrustAccountFilters } from "@/types";

/**
 * Query key factory pattern for cache management
 */
export const trustKeys = {
  all: () => ["trust-accounts"] as const,
  lists: () => [...trustKeys.all(), "list"] as const,
  list: (filters?: TrustAccountFilters) =>
    [...trustKeys.lists(), filters] as const,
  details: () => [...trustKeys.all(), "detail"] as const,
  detail: (id: string) => [...trustKeys.details(), id] as const,
  transactions: (accountId: string) =>
    [...trustKeys.detail(accountId), "transactions"] as const,
  compliance: (accountId: string) =>
    [...trustKeys.detail(accountId), "compliance"] as const,
} as const;

/**
 * Cache timing configuration
 */
export const CACHE_CONFIG = {
  STALE_TIME: 30000, // 30 seconds
  CACHE_TIME: 300000, // 5 minutes
} as const;

/**
 * Compliance thresholds
 */
export const COMPLIANCE_THRESHOLDS = {
  RECONCILIATION_WARNING_DAYS: 7,
  PROMPT_DEPOSIT_HOURS: 48,
} as const;
