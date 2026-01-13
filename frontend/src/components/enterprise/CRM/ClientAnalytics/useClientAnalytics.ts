/**
 * @module components/enterprise/CRM/ClientAnalytics/useClientAnalytics
 * @description Headless hook for Client Analytics state management
 */

import { ChartColorService, useTheme } from "@/features/theme";
import { useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/dataService";
import { QUERY_KEYS } from "@/services/data/queryKeys";
import { getChartTheme } from "@/utils/chartConfig";
import { useState } from "react";
import type { TabType } from "./types";
import {
  calculateAvgNPS,
  calculateAvgProfitMargin,
  calculateTotalLTV,
  calculateTotalProfit,
  countHighRiskClients,
} from "./utils";

import { CRMAnalytics } from "@/types/crm";

export function useClientAnalytics() {
  const { theme, mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as "light" | "dark");
  const chartTheme = getChartTheme(mode as "light" | "dark");
  const [activeTab, setActiveTab] = useState<TabType>("profitability");

  // Data queries
  useQuery(QUERY_KEYS.CLIENTS.ALL, () => DataService.clients.getAll());

  const { data: analyticsData = {} } = useQuery<CRMAnalytics>(
    ["crm", "client-analytics"],
    () => DataService.crm.getClientAnalytics()
  );

  // Extract from combined analytics object
  const anyData = analyticsData as Record<string, unknown[]>;
  const profitabilityData = anyData.profitability || [];
  const ltvData = anyData.ltv || [];
  const riskData = anyData.risk || [];
  const satisfactionData = anyData.satisfaction || [];
  const segmentData = anyData.segments || [];
  const revenueTrendData = anyData.revenueTrend || [];

  // Calculated metrics
  const metrics = {
    totalProfit: calculateTotalProfit(profitabilityData as Record<string, unknown>),
    avgProfitMargin: calculateAvgProfitMargin(profitabilityData as Record<string, unknown>),
    totalLTV: calculateTotalLTV(ltvData as Record<string, unknown>),
    avgNPS: calculateAvgNPS(satisfactionData as Record<string, unknown>),
    highRiskClients: countHighRiskClients(riskData as Record<string, unknown>),
  };

  return {
    // State
    activeTab,
    setActiveTab,

    // Data
    profitabilityData,
    ltvData,
    riskData,
    satisfactionData,
    segmentData,
    revenueTrendData,

    // Metrics
    metrics,

    // Theme
    theme,
    mode,
    chartColors,
    chartTheme,
  };
}
