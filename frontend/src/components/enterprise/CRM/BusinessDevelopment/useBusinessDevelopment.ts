/**
 * @module components/enterprise/CRM/BusinessDevelopment/useBusinessDevelopment
 * @description Headless hook for Business Development state management
 */

import { ChartColorService, useTheme } from "@/features/theme";
import { useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/dataService";
import { getChartTheme } from "@/utils/chartConfig";
import { useState } from "react";
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

  // Queries
  const { data: leads = [] } = useQuery(
    ["crm", "leads"],
    () => DataService.crm.getLeads()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as { data: any[] };
  const { data: pitches = [] } = useQuery(
    ["crm", "pitches"],
    () => DataService.crm.getPitches()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as { data: any[] };
  const { data: rfps = [] } = useQuery(
    ["crm", "rfps"],
    () => DataService.crm.getRFPs()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as { data: any[] };
  const { data: winLossData = [] } = useQuery(
    ["crm", "win-loss"],
    () => DataService.crm.getWinLossAnalysis()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as { data: any[] };
  const { data: analyticsData = {} } = useQuery(
    ["crm", "business-metrics"],
    () => DataService.crm.getBusinessDevelopmentMetrics()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as { data: any };

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
    analyticsData,

    // Metrics
    metrics,

    // Theme
    theme,
    mode,
    chartColors,
    chartTheme,
  };
}
