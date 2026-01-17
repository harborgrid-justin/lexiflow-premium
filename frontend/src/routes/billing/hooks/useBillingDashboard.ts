import { useCallback, useState, useTransition } from "react";

import { type BillingView } from "@/config/tabs.config";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNotify } from "@/hooks/useNotify";
import { useMutation } from "@/hooks/useQueryHooks";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { DataService } from "@/services/data/data-service.service";

// ============================================================================
// Types
// ============================================================================

export type BillingDashboardStatus =
  | "idle"
  | "syncing"
  | "exporting"
  | "success"
  | "error";

export interface BillingDashboardState {
  activeTab: BillingView;
  period: string;
  status: BillingDashboardStatus;
  isPending: boolean; // UI Transition state
}

export interface BillingDashboardActions {
  setActiveTab: (tab: string) => void;
  setPeriod: (period: string) => void;
  syncFinancials: () => void;
  exportReport: (format: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useBillingDashboard = (
  initialTab: string = "overview",
  _navigateTo?: (view: string) => void
): [BillingDashboardState, BillingDashboardActions] => {
  const notify = useNotify();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useSessionStorage<string>(
    "billing_active_tab",
    initialTab
  );
  const [period, setPeriodState] = useState("30d");

  // Local status for non-query async actions
  // Note: isSyncing comes from mutation, but wrapping it in a unified status is cleaner for the view if possible.
  // However, since we have multiple independent async actions, splitting them or having a composite status is needed.
  // For this rule refactor, we'll keep it simple but explicit.

  const setActiveTab = useCallback(
    (tab: string) => {
      startTransition(() => {
        setActiveTabState(tab);
      });
    },
    [setActiveTabState]
  );

  const setPeriod = useCallback((p: string) => {
    setPeriodState(p);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "mod+w": () => setActiveTab("wip"),
    "mod+i": () => setActiveTab("invoices"),
    "mod+e": () => setActiveTab("expenses"),
    "mod+l": () => setActiveTab("ledger"),
    "mod+t": () => setActiveTab("trust"),
  });

  const { mutate: syncFinancialsMutation, isLoading: isSyncing } = useMutation(
    async () => {
      // Retry logic: 3 attempts with exponential backoff
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          return await DataService.billing.sync();
        } catch (error) {
          lastError = error;
          if (attempt < 3) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
      throw lastError;
    },
    {
      onSuccess: () => notify.success("Financial data synced."),
      onError: () =>
        notify.error("Sync failed after 3 attempts. Please try again later."),
    }
  );

  const { mutate: exportReportMutation, isLoading: isExporting } = useMutation(
    (format: string) => DataService.billing.export(format),
    {
      onSuccess: (_result, format) =>
        notify.success(`Report exported (${format.toUpperCase()}).`),
    }
  );

  const status: BillingDashboardStatus = isSyncing
    ? "syncing"
    : isExporting
      ? "exporting"
      : "idle";

  const syncFinancials = useCallback(
    () => syncFinancialsMutation(),
    [syncFinancialsMutation]
  );
  const exportReport = useCallback(
    (format: string) => exportReportMutation(format),
    [exportReportMutation]
  );

  return [
    {
      activeTab: activeTab as BillingView,
      period,
      status,
      isPending,
    },
    {
      setActiveTab,
      setPeriod,
      syncFinancials,
      exportReport,
    },
  ];
};
