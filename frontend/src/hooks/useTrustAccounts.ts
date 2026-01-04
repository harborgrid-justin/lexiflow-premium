/**
 * useTrustAccounts Hook
 *
 * ARCHITECTURAL PHILOSOPHY:
 * - **Type Safety**: Every return type is explicitly defined. No implicit any.
 * - **Separation of Concerns**: Business logic isolated from UI components.
 * - **Render Optimization**: useMemo/useCallback prevent unnecessary re-renders.
 * - **Error Handling**: Explicit error states with typed error objects.
 * - **Cache Management**: Strategic invalidation via React Query.
 *
 * WHY THIS DESIGN:
 * 1. Custom hook pattern centralizes data fetching logic
 * 2. React Query handles caching, deduplication, background updates
 * 3. Typed mutations ensure compile-time safety for CUD operations
 * 4. Compliance validation logic lives in hook, not in UI
 */

import { trustAccountsApi } from "@/api/billing/trust-accounts-api";
import type {
  CreateTrustAccountDto,
  DepositDto,
  ThreeWayReconciliationDto,
  TrustAccount,
  TrustAccountFilters,
  TrustAccountValidationResult,
  TrustTransactionEntity,
  WithdrawalDto,
} from "@/types";
import { PaymentMethod, TrustAccountStatus } from "@/types";
import { useCallback, useMemo, useState } from "react";
import { queryClient, useMutation, useQuery } from "./useQueryHooks";

/**
 * Query key factory pattern for cache management
 * WHY: Centralized key management prevents cache inconsistencies
 */
const trustKeys = {
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
 * Typed error wrapper for trust account operations
 * WHY: Structured error handling allows UI to display specific error messages
 */
interface TrustAccountError {
  code: "VALIDATION_ERROR" | "API_ERROR" | "COMPLIANCE_ERROR" | "NETWORK_ERROR";
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Hook return type for useTrustAccounts
 * WHY: Explicit interface ensures consumers know exactly what they're getting
 */
interface UseTrustAccountsResult {
  accounts: TrustAccount[];
  isLoading: boolean;
  isError: boolean;
  error: TrustAccountError | null;
  refetch: () => Promise<void>;

  // Computed values (memoized for performance)
  totalBalance: number;
  ioltaAccounts: TrustAccount[];
  activeAccounts: TrustAccount[];
  accountsNeedingReconciliation: TrustAccount[];
  complianceIssues: Array<{
    accountId: string;
    issue: string;
    severity: "warning" | "error";
  }>;
}

/**
 * Main hook for trust account management
 * @param filters - Optional filters for account list
 * @returns Typed result with accounts and computed values
 */
export function useTrustAccounts(
  filters?: TrustAccountFilters
): UseTrustAccountsResult {
  // Primary data fetching with React Query
  const {
    data: accounts = [],
    isLoading,
    isError,
    error: queryError,
    refetch: originalRefetch,
  } = useQuery<TrustAccount[]>(
    [...trustKeys.list(filters)] as const,
    () => trustAccountsApi.getAll(filters),
    {
      staleTime: 30000, // 30 seconds - balance data should be relatively fresh
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: true, // Refetch when user returns to app (compliance data must be current)
    }
  );

  // Wrapped refetch with proper typing
  const refetch = useCallback(async () => {
    await originalRefetch();
  }, [originalRefetch]);

  // Transform React Query error to structured error
  const error: TrustAccountError | null = useMemo(() => {
    if (!queryError) return null;

    const err = queryError as Error;
    return {
      code: "API_ERROR",
      message: err.message || "Failed to load trust accounts",
      details: { originalError: err },
    };
  }, [queryError]);

  /**
   * COMPUTED VALUES: Memoized to prevent unnecessary recalculations
   * WHY: These are derived from accounts array, so only recalculate when accounts change
   */

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (sum: number, account: TrustAccount) => sum + account.balance,
      0
    );
  }, [accounts]);

  const ioltaAccounts = useMemo(() => {
    return accounts.filter((acc: TrustAccount) => acc.accountType === "iolta");
  }, [accounts]);

  const activeAccounts = useMemo(() => {
    return accounts.filter(
      (acc: TrustAccount) => acc.status === TrustAccountStatus.ACTIVE
    );
  }, [accounts]);

  const accountsNeedingReconciliation = useMemo(() => {
    const now = new Date();
    return accounts.filter((acc: TrustAccount) => {
      if (!acc.nextReconciliationDue) return false;
      const dueDate = new Date(acc.nextReconciliationDue);
      return dueDate <= now;
    });
  }, [accounts]);

  /**
   * COMPLIANCE VALIDATION: Identify accounts with compliance issues
   * WHY: Proactive compliance monitoring - surface issues before audits
   */
  const complianceIssues = useMemo(() => {
    const issues: Array<{
      accountId: string;
      issue: string;
      severity: "warning" | "error";
    }> = [];

    accounts.forEach((account: TrustAccount) => {
      // Negative balance check (zero balance principle violation)
      if (account.balance < 0) {
        issues.push({
          accountId: account.id,
          issue: "Negative balance detected - violates zero balance principle",
          severity: "error",
        });
      }

      // Account title compliance
      if (!account.accountTitleCompliant) {
        issues.push({
          accountId: account.id,
          issue:
            'Account title must include "Trust Account" or "Escrow Account"',
          severity: "error",
        });
      }

      // Reconciliation overdue
      if (account.nextReconciliationDue) {
        const dueDate = new Date(account.nextReconciliationDue);
        const now = new Date();
        const daysOverdue = Math.floor(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysOverdue > 0) {
          issues.push({
            accountId: account.id,
            issue: `Reconciliation overdue by ${daysOverdue} day(s)`,
            severity: daysOverdue > 7 ? "error" : "warning",
          });
        }
      }

      // State bar approval check
      if (!account.stateBarApproved) {
        issues.push({
          accountId: account.id,
          issue: "Bank is not approved by state bar for overdraft reporting",
          severity: "warning",
        });
      }

      // Missing authorized signatories
      if (
        !account.authorizedSignatories ||
        account.authorizedSignatories.length === 0
      ) {
        issues.push({
          accountId: account.id,
          issue: "No authorized signatories defined",
          severity: "error",
        });
      }
    });

    return issues;
  }, [accounts]);

  return {
    accounts,
    isLoading,
    isError,
    error,
    refetch,
    totalBalance,
    ioltaAccounts,
    activeAccounts,
    accountsNeedingReconciliation,
    complianceIssues,
  };
}

/**
 * Hook for single trust account details with transactions
 * WHY: Dedicated hook for detail view optimizes loading and cache management
 */
interface UseTrustAccountDetailResult {
  account: TrustAccount | null;
  transactions: TrustTransactionEntity[];
  isLoading: boolean;
  isError: boolean;
  error: TrustAccountError | null;
  refetch: () => Promise<void>;

  // Computed transaction summaries
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: TrustTransactionEntity[];
  lastReconciliationDate: string | null;
}

export function useTrustAccountDetail(
  accountId: string
): UseTrustAccountDetailResult {
  // Account details query
  const {
    data: account = null,
    isLoading: accountLoading,
    isError: accountError,
    error: accountQueryError,
    refetch: refetchAccount,
  } = useQuery<TrustAccount>(
    trustKeys.detail(accountId),
    () => trustAccountsApi.getById(accountId),
    {
      enabled: !!accountId,
      staleTime: 30000,
    }
  );

  // Transactions query
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isError: transactionsError,
    error: transactionsQueryError,
    refetch: refetchTransactions,
  } = useQuery<TrustTransactionEntity[]>(
    trustKeys.transactions(accountId),
    () => trustAccountsApi.getTransactions(accountId),
    {
      enabled: !!accountId,
      staleTime: 30000,
    }
  );

  const isLoading = accountLoading || transactionsLoading;
  const isError = accountError || transactionsError;

  const error: TrustAccountError | null = useMemo(() => {
    const err = accountQueryError || transactionsQueryError;
    if (!err) return null;

    return {
      code: "API_ERROR",
      message: (err as Error).message || "Failed to load account details",
    };
  }, [accountQueryError, transactionsQueryError]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchAccount(), refetchTransactions()]);
  }, [refetchAccount, refetchTransactions]);

  // Computed transaction summaries
  const totalDeposits = useMemo(() => {
    return transactions
      .filter((tx: TrustTransactionEntity) => tx.transactionType === "deposit")
      .reduce((sum: number, tx: TrustTransactionEntity) => sum + tx.amount, 0);
  }, [transactions]);

  const totalWithdrawals = useMemo(() => {
    return transactions
      .filter(
        (tx: TrustTransactionEntity) => tx.transactionType === "withdrawal"
      )
      .reduce((sum: number, tx: TrustTransactionEntity) => sum + tx.amount, 0);
  }, [transactions]);

  const pendingTransactions = useMemo(() => {
    return transactions.filter(
      (tx: TrustTransactionEntity) => tx.status === "pending"
    );
  }, [transactions]);

  const lastReconciliationDate = useMemo(() => {
    const reconciledTransactions = transactions.filter(
      (tx: TrustTransactionEntity) => tx.reconciled
    );
    if (reconciledTransactions.length === 0) return null;

    return reconciledTransactions.reduce(
      (latest: string | null, tx: TrustTransactionEntity) => {
        if (!tx.reconciledDate) return latest;
        return !latest || new Date(tx.reconciledDate) > new Date(latest)
          ? tx.reconciledDate
          : latest;
      },
      null as string | null
    );
  }, [transactions]);

  return {
    account,
    transactions,
    isLoading,
    isError,
    error,
    refetch,
    totalDeposits,
    totalWithdrawals,
    pendingTransactions,
    lastReconciliationDate,
  };
}

/**
 * Mutation hooks for CUD operations
 * WHY: Separate hooks for each operation allow fine-grained loading states and error handling
 */

interface UseCreateTrustAccountResult {
  createAccount: (data: CreateTrustAccountDto) => Promise<TrustAccount>;
  isCreating: boolean;
  error: TrustAccountError | null;
}

export function useCreateTrustAccount(): UseCreateTrustAccountResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<TrustAccount, CreateTrustAccountDto>(
    (data: CreateTrustAccountDto) => trustAccountsApi.create(data),
    {
      onSuccess: () => {
        // Invalidate all account lists to trigger refetch
        queryClient.invalidate(trustKeys.lists());
        setError(null);
      },
      onError: (err: Error) => {
        setError({
          code: "API_ERROR",
          message: err.message || "Failed to create trust account",
        });
      },
    }
  );

  return {
    createAccount: mutation.mutateAsync,
    isCreating: mutation.isLoading,
    error,
  };
}

interface UseDepositFundsResult {
  deposit: (
    accountId: string,
    data: DepositDto
  ) => Promise<TrustTransactionEntity>;
  isDepositing: boolean;
  error: TrustAccountError | null;
}

export function useDepositFunds(): UseDepositFundsResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<
    TrustTransactionEntity,
    { accountId: string; data: DepositDto }
  >(
    ({ accountId, data }: { accountId: string; data: DepositDto }) =>
      trustAccountsApi.deposit(accountId, data),
    {
      onSuccess: (
        _: TrustTransactionEntity,
        variables: { accountId: string; data: DepositDto }
      ) => {
        // Invalidate account detail and transactions
        queryClient.invalidate(trustKeys.detail(variables.accountId));
        queryClient.invalidate(trustKeys.transactions(variables.accountId));
        queryClient.invalidate(trustKeys.lists());
        setError(null);
      },
      onError: (err: Error) => {
        setError({
          code: "COMPLIANCE_ERROR",
          message: err.message || "Failed to deposit funds",
        });
      },
    }
  );

  const deposit = useCallback(
    async (accountId: string, data: DepositDto) => {
      return mutation.mutateAsync({ accountId, data });
    },
    [mutation]
  );

  return {
    deposit,
    isDepositing: mutation.isLoading,
    error,
  };
}

interface UseWithdrawFundsResult {
  withdraw: (
    accountId: string,
    data: WithdrawalDto
  ) => Promise<TrustTransactionEntity>;
  isWithdrawing: boolean;
  error: TrustAccountError | null;
}

export function useWithdrawFunds(): UseWithdrawFundsResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<
    TrustTransactionEntity,
    { accountId: string; data: WithdrawalDto }
  >(
    ({ accountId, data }: { accountId: string; data: WithdrawalDto }) =>
      trustAccountsApi.withdraw(accountId, data),
    {
      onSuccess: (
        _: TrustTransactionEntity,
        variables: { accountId: string; data: WithdrawalDto }
      ) => {
        queryClient.invalidate(trustKeys.detail(variables.accountId));
        queryClient.invalidate(trustKeys.transactions(variables.accountId));
        queryClient.invalidate(trustKeys.lists());
        setError(null);
      },
      onError: (err: Error) => {
        setError({
          code: "COMPLIANCE_ERROR",
          message: err.message || "Failed to withdraw funds",
        });
      },
    }
  );

  const withdraw = useCallback(
    async (accountId: string, data: WithdrawalDto) => {
      return mutation.mutateAsync({ accountId, data });
    },
    [mutation]
  );

  return {
    withdraw,
    isWithdrawing: mutation.isLoading,
    error,
  };
}

interface UseReconcileAccountResult {
  reconcile: (
    accountId: string,
    data: ThreeWayReconciliationDto
  ) => Promise<void>;
  isReconciling: boolean;
  error: TrustAccountError | null;
}

export function useReconcileAccount(): UseReconcileAccountResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<
    void,
    { accountId: string; data: ThreeWayReconciliationDto }
  >(
    ({
      accountId,
      data,
    }: {
      accountId: string;
      data: ThreeWayReconciliationDto;
    }) => trustAccountsApi.reconcile(accountId, data),
    {
      onSuccess: (
        _: void,
        variables: { accountId: string; data: ThreeWayReconciliationDto }
      ) => {
        queryClient.invalidate(trustKeys.detail(variables.accountId));
        queryClient.invalidate(trustKeys.transactions(variables.accountId));
        queryClient.invalidate(trustKeys.lists());
        setError(null);
      },
      onError: (err: Error) => {
        setError({
          code: "COMPLIANCE_ERROR",
          message: err.message || "Reconciliation failed",
        });
      },
    }
  );

  const reconcile = useCallback(
    async (accountId: string, data: ThreeWayReconciliationDto) => {
      return mutation.mutateAsync({ accountId, data });
    },
    [mutation]
  );

  return {
    reconcile,
    isReconciling: mutation.isLoading,
    error,
  };
}

/**
 * Client-side validation hook
 * WHY: Pre-validate before API call to provide instant feedback
 */
export function useTrustAccountValidation() {
  /**
   * Validate account title compliance
   * Per state bar rules: Account name must include "Trust Account" or "Escrow Account"
   */
  const validateAccountTitle = useCallback((accountName: string): boolean => {
    const normalizedName = accountName.toLowerCase();
    return (
      normalizedName.includes("trust account") ||
      normalizedName.includes("escrow account")
    );
  }, []);

  /**
   * Validate payment method for withdrawals
   * Per state bar rules: CASH and ATM withdrawals are PROHIBITED
   */
  const validatePaymentMethod = useCallback(
    (
      paymentMethod: PaymentMethod,
      isWithdrawal: boolean
    ): TrustAccountValidationResult => {
      if (!isWithdrawal) {
        return { valid: true, errors: [] };
      }

      const prohibitedMethods = [PaymentMethod.CASH, PaymentMethod.ATM];
      if (prohibitedMethods.includes(paymentMethod)) {
        return {
          valid: false,
          errors: [
            `${paymentMethod.toUpperCase()} withdrawals are prohibited by state bar rules`,
          ],
          warnings: [],
        };
      }

      return { valid: true, errors: [] };
    },
    []
  );

  /**
   * Validate prompt deposit compliance
   * Per state bar rules: Client funds must be deposited within 24-48 hours of receipt
   */
  const validatePromptDeposit = useCallback(
    (fundsReceivedDate: Date, depositDate: Date): boolean => {
      const hoursDifference =
        (depositDate.getTime() - fundsReceivedDate.getTime()) /
        (1000 * 60 * 60);
      return hoursDifference <= 48;
    },
    []
  );

  /**
   * Validate zero balance principle
   * Per state bar rules: Account balance must never be negative
   */
  const validateZeroBalance = useCallback(
    (
      currentBalance: number,
      withdrawalAmount: number
    ): TrustAccountValidationResult => {
      const newBalance = currentBalance - withdrawalAmount;

      if (newBalance < 0) {
        return {
          valid: false,
          errors: [
            `Insufficient funds. Current balance: $${currentBalance.toFixed(2)}, Withdrawal: $${withdrawalAmount.toFixed(2)}, Shortfall: $${Math.abs(newBalance).toFixed(2)}`,
          ],
          warnings: [],
        };
      }

      return { valid: true, errors: [] };
    },
    []
  );

  return {
    validateAccountTitle,
    validatePaymentMethod,
    validatePromptDeposit,
    validateZeroBalance,
  };
}
