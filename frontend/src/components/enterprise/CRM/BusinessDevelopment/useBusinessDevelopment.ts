/**
 * @module components/enterprise/CRM/BusinessDevelopment/useBusinessDevelopment
 * @description Headless hook for Business Development state management
 */

import { useTheme } from "@/contexts/theme/ThemeContext";
import { useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/dataService";
import { ChartColorService } from "@/services/theme/chartColorService";
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
  const { data: leads = [] } = useQuery<any[]>(["crm", "leads"], () =>
    DataService.crm.getLeads()
  );
  const { data: pitches = [] } = useQuery<any[]>(["crm", "pitches"], () =>
    DataService.crm.getPitches()
  );
  const { data: rfps = [] } = useQuery<any[]>(["crm", "rfps"], () =>
    DataService.crm.getRFPs()
  );
  const { data: winLossData = [] } = useQuery<any[]>(["crm", "win-loss"], () =>
    DataService.crm.getWinLossAnalysis()
  );
  const { data: analyticsData = {} } = useQuery<any>(
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
