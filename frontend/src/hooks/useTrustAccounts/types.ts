/**
 * Type definitions for useTrustAccounts hooks
 * @module hooks/useTrustAccounts/types
 */

import type { TrustAccount, TrustTransactionEntity } from "@/types";

/**
 * Typed error wrapper for trust account operations
 */
export interface TrustAccountError {
  code: "VALIDATION_ERROR" | "API_ERROR" | "COMPLIANCE_ERROR" | "NETWORK_ERROR";
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Compliance issue definition
 */
export interface ComplianceIssue {
  accountId: string;
  issue: string;
  severity: "warning" | "error";
}

/**
 * Hook return type for useTrustAccounts
 */
export interface UseTrustAccountsResult {
  accounts: TrustAccount[];
  isLoading: boolean;
  isError: boolean;
  error: TrustAccountError | null;
  refetch: () => Promise<void>;
  totalBalance: number;
  ioltaAccounts: TrustAccount[];
  activeAccounts: TrustAccount[];
  accountsNeedingReconciliation: TrustAccount[];
  complianceIssues: ComplianceIssue[];
}

/**
 * Hook return type for useTrustAccountDetail
 */
export interface UseTrustAccountDetailResult {
  account: TrustAccount | null;
  transactions: TrustTransactionEntity[];
  isLoading: boolean;
  isError: boolean;
  error: TrustAccountError | null;
  refetch: () => Promise<void>;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: TrustTransactionEntity[];
  lastReconciliationDate: string | null;
}

/**
 * Hook return type for useCreateTrustAccount
 */
export interface UseCreateTrustAccountResult {
  createAccount: (data: any) => Promise<TrustAccount>;
  isCreating: boolean;
  error: TrustAccountError | null;
}

/**
 * Hook return type for useDepositFunds
 */
export interface UseDepositFundsResult {
  deposit: (accountId: string, data: any) => Promise<TrustTransactionEntity>;
  isDepositing: boolean;
  error: TrustAccountError | null;
}

/**
 * Hook return type for useWithdrawFunds
 */
export interface UseWithdrawFundsResult {
  withdraw: (accountId: string, data: any) => Promise<TrustTransactionEntity>;
  isWithdrawing: boolean;
  error: TrustAccountError | null;
}

/**
 * Hook return type for useReconcileAccount
 */
export interface UseReconcileAccountResult {
  reconcile: (accountId: string, data: any) => Promise<void>;
  isReconciling: boolean;
  error: TrustAccountError | null;
}
