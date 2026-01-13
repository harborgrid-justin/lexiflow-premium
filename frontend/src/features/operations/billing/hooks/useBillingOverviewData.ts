import { useTheme } from "@/features/theme";
import { useQuery, useQueryClient } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";
import { Client, Invoice, WIPStat } from "@/types";
import { useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

export interface RealizationStat {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface OverviewStats {
  realization: number;
  totalBilled: number;
  month: string;
}

export type BillingOverviewStatus = "idle" | "loading" | "success" | "error";

export interface BillingOverviewState {
  wipData: WIPStat[];
  realizationData: RealizationStat[];
  topClients: Client[];
  totalWip: number;
  realizationRate: number;
  outstandingAmount: number;
  overdueCount: number;
  status: BillingOverviewStatus;
  isLoading: boolean; // Keep for backward compat/convenience
}

export interface BillingOverviewActions {
  refresh: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useBillingOverviewData = (): [
  BillingOverviewState,
  BillingOverviewActions,
] => {
  const { mode } = useTheme();
  const queryClient = useQueryClient();

  // 1. Fetch WIP Stats
  const {
    data: rawWipData = [],
    isLoading: isLoadingWip,
    isError: isErrorWip,
  } = useQuery<WIPStat[]>(["billing", "wipStats"], () =>
    DataService.billing
      ? DataService.billing.getWIPStats()
      : Promise.resolve([])
  );

  // 2. Fetch Realization Stats (Chart Data)
  const {
    data: rawRealizationData = [],
    isLoading: isLoadingRealization,
    isError: isErrorRealization,
  } = useQuery<RealizationStat[]>(["billing", "realization"], () =>
    DataService.billing
      ? (DataService.billing.getRealizationStats(mode) as Promise<
          RealizationStat[]
        >)
      : Promise.resolve([])
  );

  // 3. Fetch Top Accounts
  const {
    data: rawTopClients = [],
    isLoading: isLoadingClients,
    isError: isErrorClients,
  } = useQuery<Client[]>(["billing", "topAccounts"], () =>
    DataService.billing
      ? DataService.billing.getTopAccounts()
      : Promise.resolve([])
  );

  // 4. Fetch Overview Stats (Quick Metrics)
  const { data: overviewStats, isError: isErrorStats } =
    useQuery<OverviewStats | null>(["billing", "overviewStats"], () =>
      DataService.billing
        ? (DataService.billing.getOverviewStats() as unknown as Promise<OverviewStats>)
        : Promise.resolve(null)
    );

  // 5. Fetch Invoices for Outstanding Calculation
  const {
    data: invoices = [],
    isLoading: isLoadingInvoices,
    isError: isErrorInvoices,
  } = useQuery<Invoice[]>(["billing", "invoices"], () =>
    DataService.billing
      ? DataService.billing.getInvoices()
      : Promise.resolve([])
  );

  // --- Derived Calculations ---

  const wipData = Array.isArray(rawWipData) ? rawWipData : [];
  const realizationData = Array.isArray(rawRealizationData)
    ? rawRealizationData
    : [];
  const topClients = Array.isArray(rawTopClients) ? rawTopClients : [];

  const totalWip = wipData.reduce(
    (acc, curr) =>
      acc + (typeof curr.totalFees === "number" ? curr.totalFees : 0),
    0
  );

  // Realization Rate
  let realizationRate = 0;
  if (overviewStats?.realization) {
    realizationRate = overviewStats.realization;
  } else if (Array.isArray(realizationData)) {
    const billedItem = realizationData.find((item) => item.name === "Billed");
    if (billedItem) realizationRate = billedItem.value;
  }

  // Outstanding (60+ Days)
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const overdueInvoices = Array.isArray(invoices)
    ? invoices.filter((inv) => {
        if (inv.status === "Paid" || inv.status === "Draft") return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate < now; // Overdue
      })
    : [];

  const outstanding60Plus = Array.isArray(invoices)
    ? invoices.filter((inv) => {
        if (inv.status === "Paid" || inv.status === "Draft") return false;
        // Using invoiceDate for age calculation
        const invoiceDate = new Date(inv.invoiceDate);
        return invoiceDate < sixtyDaysAgo;
      })
    : [];

  const outstandingAmount = outstanding60Plus.reduce(
    (sum, inv) => sum + (inv.balanceDue || inv.totalAmount || 0),
    0
  );
  const overdueCount = overdueInvoices.length;

  const isLoading =
    isLoadingWip ||
    isLoadingRealization ||
    isLoadingClients ||
    isLoadingInvoices;
  const isError =
    isErrorWip ||
    isErrorRealization ||
    isErrorClients ||
    isErrorStats ||
    isErrorInvoices;

  const status: BillingOverviewStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : "success";

  const refresh = useCallback(() => {
    queryClient.invalidateQueries(["billing"]);
  }, [queryClient]);

  return [
    {
      wipData,
      realizationData,
      topClients,
      totalWip,
      realizationRate,
      outstandingAmount,
      overdueCount,
      status,
      isLoading,
    },
    {
      refresh,
    },
  ];
};
