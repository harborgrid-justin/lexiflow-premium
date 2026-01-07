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
import {
  MOCK_LTV_DATA,
  MOCK_PROFITABILITY_DATA,
  MOCK_REVENUE_TREND,
  MOCK_RISK_DATA,
  MOCK_SATISFACTION_DATA,
  MOCK_SEGMENT_DATA,
} from "./constants";
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

  // Mock data
  const profitabilityData = MOCK_PROFITABILITY_DATA;
  const ltvData = MOCK_LTV_DATA;
  const riskData = MOCK_RISK_DATA;
  const satisfactionData = MOCK_SATISFACTION_DATA;
  const segmentData = MOCK_SEGMENT_DATA;
  const revenueTrendData = MOCK_REVENUE_TREND;

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
