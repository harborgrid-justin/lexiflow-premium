/**
 * BillingDomain Type Definitions
 * Re-exports from central types and billing-specific types
 */

// Re-export types from @/types
export type {
  Client,
  FinancialPerformanceData,
  Invoice,
  OperatingSummary,
  PaginationParams,
  RateTable,
  TimeEntry,
  TrustTransaction,
  WIPStat,
} from "@/types";

// Re-export error types
export { ComplianceError, OperationError } from "@/services/core/errors";
