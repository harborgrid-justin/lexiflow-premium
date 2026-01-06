import { useTheme } from "@/contexts/theme/ThemeContext";
import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";
import { Client, Invoice, WIPStat } from "@/types";

interface RealizationStat {
  name: string;
  value: number;
  color: string;
}

interface OverviewStats {
  realization: number;
  totalBilled: number;
  month: string;
}

export const useBillingOverviewData = () => {
  const { mode } = useTheme();

  // 1. Fetch WIP Stats
  const { data: rawWipData = [], isLoading: isLoadingWip } = useQuery<
    WIPStat[]
  >(["billing", "wipStats"], () =>
    DataService.billing
      ? DataService.billing.getWIPStats()
      : Promise.resolve([])
  );

  // 2. Fetch Realization Stats (Chart Data)
  const { data: rawRealizationData = [], isLoading: isLoadingRealization } =
    useQuery<RealizationStat[]>(["billing", "realization"], () =>
      DataService.billing
        ? (DataService.billing.getRealizationStats(mode) as Promise<
            RealizationStat[]
          >)
        : Promise.resolve([])
    );

  // 3. Fetch Top Accounts
  const { data: rawTopClients = [], isLoading: isLoadingClients } = useQuery<
    Client[]
  >(["billing", "topAccounts"], () =>
    DataService.billing
      ? DataService.billing.getTopAccounts()
      : Promise.resolve([])
  );

  // 4. Fetch Overview Stats (Quick Metrics)
  const { data: overviewStats } = useQuery<OverviewStats | null>(
    ["billing", "overviewStats"],
    () =>
      DataService.billing
        ? (DataService.billing.getOverviewStats() as unknown as Promise<OverviewStats>)
        : Promise.resolve(null)
  );

  // 5. Fetch Invoices for Outstanding Calculation
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery<
    Invoice[]
  >(["billing", "invoices"], () =>
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
    (acc, curr) => acc + (typeof curr.wip === "number" ? curr.wip : 0),
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

  return {
    wipData,
    realizationData,
    topClients,
    totalWip,
    realizationRate,
    outstandingAmount,
    overdueCount,
    isLoading,
  };
};
