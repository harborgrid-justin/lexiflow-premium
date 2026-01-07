/**
 * @module components/enterprise/CRM/BusinessDevelopment/useBusinessDevelopment
 * @description Headless hook for Business Development state management
 */

import { useTheme } from "@/contexts/theme/ThemeContext";
import { ChartColorService } from "@/services/theme/chartColorService";
import { getChartTheme } from "@/utils/chartConfig";
import { useState } from "react";
import {
  ANALYTICS_DATA,
  MOCK_LEADS,
  MOCK_PITCHES,
  MOCK_RFPS,
  MOCK_WIN_LOSS_DATA,
} from "./constants";
import type { TabType } from "./types";
import {
  calculateActiveLeads,
  calculateAverageSalesCycle,
  calculatePipelineValue,
  calculateWinRate,
  calculateWonValue,
} from "./utils";

export function useBusinessDevelopment() {
  const { theme, mode } = useTheme();
  const chartColors = ChartColorService.getPalette(mode as "light" | "dark");
  const chartTheme = getChartTheme(mode as "light" | "dark");
  const [activeTab, setActiveTab] = useState<TabType>("leads");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  // Mock data
  const leads = MOCK_LEADS;
  const pitches = MOCK_PITCHES;
  const rfps = MOCK_RFPS;
  const winLossData = MOCK_WIN_LOSS_DATA;

  // Calculated metrics
  const metrics = {
    activeLeads: calculateActiveLeads(leads),
    pipelineValue: calculatePipelineValue(leads),
    wonValue: calculateWonValue(leads),
    winRate: calculateWinRate(leads),
    avgSalesCycle: calculateAverageSalesCycle(winLossData),
  };

  return {
    // State
    activeTab,
    setActiveTab,
    selectedLead,
    setSelectedLead,

    // Data
    leads,
    pitches,
    rfps,
    winLossData,
    analyticsData: ANALYTICS_DATA,

    // Metrics
    metrics,

    // Theme
    theme,
    mode,
    chartColors,
    chartTheme,
  };
}
