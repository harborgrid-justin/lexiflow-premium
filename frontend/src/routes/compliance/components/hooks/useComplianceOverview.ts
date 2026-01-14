import { useTheme } from "@/theme";
import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { ComplianceMetrics } from "@/types";

// ============================================================================
// Types
// ============================================================================

export type ComplianceOverviewStatus = "idle" | "loading" | "error" | "success";

export interface RiskChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

export interface ComplianceOverviewState {
  metrics: ComplianceMetrics | null;
  chartData: RiskChartData[];
  status: ComplianceOverviewStatus;
}

export interface ComplianceOverviewActions {
  refresh: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useComplianceOverview = (): [
  ComplianceOverviewState,
  ComplianceOverviewActions,
] => {
  const { mode } = useTheme();

  const {
    data: metrics,
    isLoading: loadingMetrics,
    isError: errorMetrics,
    refetch: refetchMetrics,
  } = useQuery<ComplianceMetrics>(
    ["compliance", "riskMetrics"],
    DataService.compliance.getRiskMetrics
  );

  const {
    data: riskData = [],
    isLoading: loadingRiskData,
    isError: errorRisk,
    refetch: refetchRisk,
  } = useQuery<RiskChartData[]>(
    ["compliance", "riskStats"],
    () =>
      DataService.compliance.getRiskStats(mode) as unknown as Promise<
        RiskChartData[]
      >
  );

  const status: ComplianceOverviewStatus =
    loadingMetrics || loadingRiskData
      ? "loading"
      : errorMetrics || errorRisk
        ? "error"
        : "idle";

  const refresh = () => {
    refetchMetrics();
    refetchRisk();
  };

  return [
    {
      metrics: metrics || null,
      chartData: riskData,
      status,
    },
    {
      refresh,
    },
  ];
};
