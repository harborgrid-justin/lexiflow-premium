/**
 * @module components/enterprise/CRM/ClientAnalytics/useClientAnalytics
 * @description Headless hook for Client Analytics state management
 */

import { useTheme } from "@/contexts/theme/ThemeContext";
import { useQuery } from "@/hooks/backend";
import { DataService } from "@/services/dataService";
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

export function useClientAnalytics() {
  const { theme, mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as "light" | "dark");
  const chartTheme = getChartTheme(mode as "light" | "dark");
  const [activeTab, setActiveTab] = useState<TabType>("profitability");

  // Data queries
  useQuery(QUERY_KEYS.CLIENTS.ALL, () => DataService.clients.getAll());

  const { data: analyticsData = {} } = useQuery(
    ["crm", "client-analytics"],
    () => DataService.crm.getClientAnalytics()
  );

  // Extract from combined analytics object
  const profitabilityData = analyticsData.profitability || [];
  const ltvData = analyticsData.ltv || [];
  const riskData = analyticsData.risk || [];
  const satisfactionData = analyticsData.satisfaction || [];
  const segmentData = analyticsData.segments || [];
  const revenueTrendData = analyticsData.revenueTrend || [];

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
