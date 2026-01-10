/**
 * @module components/enterprise/CRM/ClientAnalytics/useClientAnalytics
 * @description Headless hook for Client Analytics state management
 */

import { useTheme } from "@/contexts/theme/ThemeContext";
import { useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/dataService";
import { QUERY_KEYS } from "@/services/data/queryKeys";
import { ChartColorService } from "@/services/theme/chartColorService";
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
  const anyData = analyticsData as Record<string, any[]>;
  const profitabilityData = anyData.profitability || [];
  const ltvData = anyData.ltv || [];
  const riskData = anyData.risk || [];
  const satisfactionData = anyData.satisfaction || [];
  const segmentData = anyData.segments || [];
  const revenueTrendData = anyData.revenueTrend || [];

  // Calculated metrics
  const metrics = {
    totalProfit: calculateTotalProfit(profitabilityData),
    avgProfitMargin: calculateAvgProfitMargin(profitabilityData),
    totalLTV: calculateTotalLTV(ltvData),
    avgNPS: calculateAvgNPS(satisfactionData),
    highRiskClients: countHighRiskClients(riskData),
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
