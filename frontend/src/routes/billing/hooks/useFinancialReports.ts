import { useMemo, useState } from "react";

import { type FinancialReportTab, type ReportPeriod } from "@/config/billing.config";
import { useNotify } from "@/hooks/useNotify";
import { useQuery } from "@/hooks/useQueryHooks";
import { billingApiService } from "@/lib/frontend-api";

interface UseFinancialReportsProps {
  dateRange?: { start: string; end: string };
}

export const useFinancialReports = ({
  dateRange,
}: UseFinancialReportsProps) => {
  const notify = useNotify();
  const [selectedTab, setSelectedTab] =
    useState<FinancialReportTab>("profitability");
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("monthly");
  const [showFilters, setShowFilters] = useState(false);

  // Use standardized useQuery pattern for data fetching
  const filters = useMemo(
    () =>
      dateRange
        ? { startDate: dateRange.start, endDate: dateRange.end }
        : undefined,
    [dateRange],
  );

  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery(
    ["financial-reports", filters],
    async () => {
      const [
        profitabilityData,
        realizationData,
        wipData,
        forecastData,
        performanceData,
        matterData,
      ] = await Promise.all([
        billingApiService.getProfitabilityMetrics(filters),
        billingApiService.getRealizationMetrics(filters),
        billingApiService.getWIPMetrics(filters),
        billingApiService.getRevenueForecast(filters),
        billingApiService.getTimekeeperPerformance(filters),
        billingApiService.getMatterProfitability(filters),
      ]);

      return {
        profitability: profitabilityData,
        realization: realizationData,
        wipMetrics: wipData,
        revenueForecast: forecastData,
        timekeeperPerformance: performanceData,
        matterProfitability: matterData,
      };
    },
    {
      onError: (err) => {
        console.error("Failed to fetch financial reports:", err);
        notify.error("Failed to load financial data. Please try again.");
      },
    },
  );

  const error = queryError
    ? "Failed to load financial data. Please try again."
    : null;

  return {
    selectedTab,
    setSelectedTab,
    selectedPeriod,
    setSelectedPeriod,
    showFilters,
    setShowFilters,
    isLoading,
    error,
    data: data || {
      profitability: null,
      realization: null,
      wipMetrics: null,
      revenueForecast: [],
      timekeeperPerformance: [],
      matterProfitability: [],
    },
  };
};

export const useFinancialHelpers = () => {
  const getPerformanceColor = (value: number, threshold: number = 90) => {
    if (value >= threshold) return "text-green-600 dark:text-green-400";
    if (value >= threshold - 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return { getPerformanceColor, formatCurrency, formatPercent };
};
