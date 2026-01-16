import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { ComplianceMetrics } from "@/types";

// ============================================================================
// Types
// ============================================================================

export type ComplianceRiskStatus = "idle" | "loading" | "error" | "success";

export interface ComplianceRiskState {
  metrics: ComplianceMetrics | null;
  status: ComplianceRiskStatus;
}

export interface ComplianceRiskActions {
  refresh: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useComplianceRisk = (): [
  ComplianceRiskState,
  ComplianceRiskActions,
] => {
  const {
    data: metrics = null,
    isLoading,
    isError,
    refetch,
  } = useQuery<ComplianceMetrics>(
    ["compliance", "riskMetrics"],
    DataService.compliance.getRiskMetrics
  );

  const status: ComplianceRiskStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : "idle";

  return [
    {
      metrics,
      status,
    },
    {
      refresh: refetch,
    },
  ];
};
