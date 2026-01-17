import { useMemo, useState } from "react";

import { useNotify } from "@/hooks/useNotify";
import { useMutation, useQueryClient } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { type CreateTrustAccountDto, type TrustAccount } from "@/types/trust-accounts";
import { queryKeys } from "@/utils/query-keys.service";

import { useTrustAccounts } from "@/hooks/useTrustAccounts";

// ============================================================================
// Types
// ============================================================================

export type TrustDashboardView = "all" | "iolta" | "client";
export type TrustDashboardStatus = "idle" | "loading" | "success" | "error";

export interface TrustDashboardStats {
  totalBalance: number;
  totalAccounts: number;
  activeAccounts: number;
  ioltaBalance: number;
  needsReconciliation: number;
  errorCount: number;
  warningCount: number;
}

export interface TrustDashboardState {
  accounts: TrustAccount[];
  filteredAccounts: TrustAccount[];
  selectedView: TrustDashboardView;
  stats: TrustDashboardStats;
  complianceIssues: Array<{
    accountId: string;
    issue: string;
    severity: "warning" | "error";
  }>;
  accountsNeedingReconciliation: TrustAccount[];
  ioltaAccounts: TrustAccount[]; // Exposed if needed by UI
  status: TrustDashboardStatus;
  error: Error | null;
}

export interface TrustDashboardActions {
  setSelectedView: (view: TrustDashboardView) => void;
  createAccount: (data: CreateTrustAccountDto) => Promise<unknown>;
  reconcileAccount: (accountId: string) => Promise<unknown>;
  refresh: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useTrustDashboard = (): [
  TrustDashboardState,
  TrustDashboardActions,
] => {
  const [selectedView, setSelectedView] = useState<TrustDashboardView>("all");
  const notify = useNotify();
  const queryClient = useQueryClient();

  const {
    accounts,
    isLoading,
    isError,
    error,
    totalBalance,
    ioltaAccounts,
    activeAccounts,
    accountsNeedingReconciliation,
    complianceIssues,
    refetch,
  } = useTrustAccounts();

  // Computed Values
  const stats = useMemo<TrustDashboardStats>(() => {
    const errorCount = complianceIssues.filter(
      (i) => i.severity === "error"
    ).length;
    const warningCount = complianceIssues.filter(
      (i) => i.severity === "warning"
    ).length;
    const ioltaBalance = ioltaAccounts.reduce(
      (sum, acc) => sum + acc.balance,
      0
    );

    return {
      totalBalance,
      totalAccounts: accounts.length,
      activeAccounts: activeAccounts.length,
      ioltaBalance,
      needsReconciliation: accountsNeedingReconciliation.length,
      errorCount,
      warningCount,
    };
  }, [
    accounts,
    activeAccounts,
    ioltaAccounts,
    totalBalance,
    accountsNeedingReconciliation,
    complianceIssues,
  ]);

  const filteredAccounts = useMemo(() => {
    switch (selectedView) {
      case "iolta":
        return accounts.filter((acc) => acc.accountType === "iolta");
      case "client":
        return accounts.filter((acc) => acc.accountType === "client_trust");
      default:
        return accounts;
    }
  }, [accounts, selectedView]);

  // Mutations
  const { mutateAsync: createAccount } = useMutation(
    (data: CreateTrustAccountDto) =>
      DataService.billing.trustAccounts.create(data),
    {
      onSuccess: () => {
        notify.success("Trust account created successfully");
        queryClient.invalidate(queryKeys.billing.trustAccounts());
      },
      onError: (error: Error) => {
        notify.error(error?.message || "Failed to create trust account");
      },
    }
  );

  const { mutateAsync: reconcileAccount } = useMutation(
    (accountId: string) =>
      DataService.billing.trustAccounts.reconcile(accountId),
    {
      onSuccess: () => {
        notify.success("Reconciliation initiated successfully");
        queryClient.invalidate(queryKeys.billing.trustAccounts());
        refetch();
      },
      onError: (error: Error) => {
        notify.error(error?.message || "Failed to initiate reconciliation");
      },
    }
  );

  const status: TrustDashboardStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : "success";

  return [
    {
      accounts,
      filteredAccounts,
      selectedView,
      stats,
      complianceIssues,
      accountsNeedingReconciliation,
      ioltaAccounts,
      status,
      error,
    },
    {
      setSelectedView,
      createAccount,
      reconcileAccount,
      refresh: refetch,
    },
  ];
};
