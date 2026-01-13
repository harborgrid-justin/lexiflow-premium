import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";

// ============================================================================
// Types
// ============================================================================

export interface PolicyItem {
  id: string;
  title: string;
  version: string;
  date: string;
  status: string;
}

export type CompliancePoliciesStatus = "idle" | "loading" | "error" | "success";

export interface CompliancePoliciesState {
  policies: PolicyItem[];
  status: CompliancePoliciesStatus;
}

export interface CompliancePoliciesActions {
  refresh: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useCompliancePolicies = (): [
  CompliancePoliciesState,
  CompliancePoliciesActions,
] => {
  const {
    data: policies = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<PolicyItem[]>(
    ["compliance", "policies"],
    () =>
      DataService.compliance.getPolicies() as unknown as Promise<PolicyItem[]>
  );

  const status: CompliancePoliciesStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : "idle";

  return [
    {
      policies,
      status,
    },
    {
      refresh: refetch,
    },
  ];
};
