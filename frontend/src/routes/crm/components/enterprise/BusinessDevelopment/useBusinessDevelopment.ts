/**
 * @module components/enterprise/CRM/BusinessDevelopment/useBusinessDevelopment
 * @description Headless hook for Business Development state management
 */

import { ChartColorService } from "@/unknown_fix_me/ChartColorService";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/data-service.service";
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
  const { data: leads = [] } = useQuery<unknown[]>(
    ["crm", "leads"],
    () => DataService.crm.getLeads()
  );
  const { data: pitches = [] } = useQuery<unknown[]>(
    ["crm", "pitches"],
    () => DataService.crm.getPitches()
  );
  const { data: rfps = [] } = useQuery<unknown[]>(
    ["crm", "rfps"],
    () => DataService.crm.getRFPs()
  );
  const { data: winLossData = [] } = useQuery<unknown[]>(
    ["crm", "win-loss"],
    () => DataService.crm.getWinLossAnalysis()
  );
  const { data: analyticsData = {} } = useQuery<Record<string, unknown>>(
    ["crm", "business-metrics"],
    () => DataService.crm.getBusinessDevelopmentMetrics()
  );

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
