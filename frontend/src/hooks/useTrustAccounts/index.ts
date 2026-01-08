/**
 * Trust Accounts Hook - Main Composition
 * @module hooks/useTrustAccounts
 */

import { trustAccountsApi } from "@/api/billing/trust-accounts-api";
import type {
  CreateTrustAccountDto,
  DepositDto,
  ThreeWayReconciliationDto,
  TrustAccount,
  TrustAccountFilters,
  TrustTransactionEntity,
  WithdrawalDto,
} from "@/types";
import { useCallback, useMemo, useState } from "react";
import { queryClient, useMutation, useQuery } from "../useQueryHooks";
import { CACHE_CONFIG, trustKeys } from "./constants";
import type {
  TrustAccountError,
  UseCreateTrustAccountResult,
  UseDepositFundsResult,
  UseReconcileAccountResult,
  UseTrustAccountDetailResult,
  UseTrustAccountsResult,
  UseWithdrawFundsResult,
} from "./types";
import {
  calculateTotalBalance,
  calculateTotalDeposits,
  calculateTotalWithdrawals,
  filterActiveAccounts,
  filterIoltaAccounts,
  filterPendingTransactions,
  findAccountsNeedingReconciliation,
  findLastReconciliationDate,
  identifyComplianceIssues,
  transformQueryError,
} from "./utils";
import {
  validateAccountTitle,
  validatePaymentMethod,
  validatePromptDeposit,
  validateZeroBalance,
} from "./validation";

export * from "./constants";
export * from "./types";

/**
 * Main hook for trust account management
 */
export function useTrustAccounts(
  filters?: TrustAccountFilters
): UseTrustAccountsResult {
  const {
    data: accounts = [],
    isLoading,
    isError,
    error: queryError,
    refetch: originalRefetch,
  } = useQuery<TrustAccount[]>(
    trustKeys.list(filters),
    () => trustAccountsApi.getAll(filters),
    {
      staleTime: CACHE_CONFIG.STALE_TIME,
      cacheTime: CACHE_CONFIG.CACHE_TIME,
      refetchOnWindowFocus: true,
    }
  );

  const refetch = useCallback(async () => {
    await originalRefetch();
  }, [originalRefetch]);

  const error: TrustAccountError | null = useMemo(
    () => transformQueryError(queryError),
    [queryError]
  );

  const totalBalance = useMemo(
    () => calculateTotalBalance(accounts),
    [accounts]
  );
  const ioltaAccounts = useMemo(
    () => filterIoltaAccounts(accounts),
    [accounts]
  );
  const activeAccounts = useMemo(
    () => filterActiveAccounts(accounts),
    [accounts]
  );
  const accountsNeedingReconciliation = useMemo(
    () => findAccountsNeedingReconciliation(accounts),
    [accounts]
  );
  const complianceIssues = useMemo(
    () => identifyComplianceIssues(accounts),
    [accounts]
  );

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
 */
export function useTrustAccountDetail(
  accountId: string
): UseTrustAccountDetailResult {
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
      staleTime: CACHE_CONFIG.STALE_TIME,
    }
  );

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
      staleTime: CACHE_CONFIG.STALE_TIME,
    }
  );

  const isLoading = accountLoading || transactionsLoading;
  const isError = accountError || transactionsError;

  const error: TrustAccountError | null = useMemo(
    () => transformQueryError(accountQueryError || transactionsQueryError),
    [accountQueryError, transactionsQueryError]
  );

  const refetch = useCallback(async () => {
    await Promise.all([refetchAccount(), refetchTransactions()]);
  }, [refetchAccount, refetchTransactions]);

  const totalDeposits = useMemo(
    () => calculateTotalDeposits(transactions),
    [transactions]
  );
  const totalWithdrawals = useMemo(
    () => calculateTotalWithdrawals(transactions),
    [transactions]
  );
  const pendingTransactions = useMemo(
    () => filterPendingTransactions(transactions),
    [transactions]
  );
  const lastReconciliationDate = useMemo(
    () => findLastReconciliationDate(transactions),
    [transactions]
  );

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
 * Mutation hook for creating trust accounts
 */
export function useCreateTrustAccount(): UseCreateTrustAccountResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<TrustAccount, CreateTrustAccountDto>(
    (data: CreateTrustAccountDto) => trustAccountsApi.create(data),
    {
      onSuccess: () => {
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
    createAccount: ((data: Record<string, unknown>) =>
      mutation.mutateAsync(data as CreateTrustAccountDto)) as (
      data: Record<string, unknown>
    ) => Promise<TrustAccount>,
    isCreating: mutation.isLoading,
    error,
  };
}

/**
 * Mutation hook for depositing funds
 */
export function useDepositFunds(): UseDepositFundsResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<
    TrustTransactionEntity,
    { accountId: string; data: DepositDto }
  >(({ accountId, data }) => trustAccountsApi.deposit(accountId, data), {
    onSuccess: (_, variables) => {
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
  });

  const deposit = useCallback(
    async (accountId: string, data: DepositDto) => {
      return mutation.mutateAsync({ accountId, data });
    },
    [mutation]
  );

  return {
    deposit: ((accountId: string, data: Record<string, unknown>) =>
      mutation.mutateAsync({ accountId, data: data as DepositDto })) as (
      accountId: string,
      data: Record<string, unknown>
    ) => Promise<TrustTransactionEntity>,
    isDepositing: mutation.isLoading,
    error,
  };
}

/**
 * Mutation hook for withdrawing funds
 */
export function useWithdrawFunds(): UseWithdrawFundsResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<
    TrustTransactionEntity,
    { accountId: string; data: WithdrawalDto }
  >(({ accountId, data }) => trustAccountsApi.withdraw(accountId, data), {
    onSuccess: (_, variables) => {
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
  });

  const withdraw = useCallback(
    async (accountId: string, data: WithdrawalDto) => {
      return mutation.mutateAsync({ accountId, data });
    },
    [mutation]
  );

  return {
    withdraw: ((accountId: string, data: Record<string, unknown>) =>
      mutation.mutateAsync({ accountId, data: data as WithdrawalDto })) as (
      accountId: string,
      data: Record<string, unknown>
    ) => Promise<TrustTransactionEntity>,
    isWithdrawing: mutation.isLoading,
    error,
  };
}

/**
 * Mutation hook for reconciling accounts
 */
export function useReconcileAccount(): UseReconcileAccountResult {
  const [error, setError] = useState<TrustAccountError | null>(null);

  const mutation = useMutation<
    void,
    { accountId: string; data: ThreeWayReconciliationDto }
  >(({ accountId, data }) => trustAccountsApi.reconcile(accountId, data), {
    onSuccess: (_, variables) => {
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
  });

  const reconcile = useCallback(
    async (accountId: string, data: ThreeWayReconciliationDto) => {
      return mutation.mutateAsync({ accountId, data });
    },
    [mutation]
  );

  return {
    reconcile: ((accountId: string, data: Record<string, unknown>) =>
      mutation.mutateAsync({
        accountId,
        data: data as ThreeWayReconciliationDto,
      })) as (
      accountId: string,
      data: Record<string, unknown>
    ) => Promise<void>,
    isReconciling: mutation.isLoading,
    error,
  };
}

/**
 * Client-side validation hook
 */
export function useTrustAccountValidation() {
  return {
    validateAccountTitle: useCallback(validateAccountTitle, []),
    validatePaymentMethod: useCallback(validatePaymentMethod, []),
    validatePromptDeposit: useCallback(validatePromptDeposit, []),
    validateZeroBalance: useCallback(validateZeroBalance, []),
  };
}
