import { useCallback, useTransition } from "react";

import { useSessionStorage } from "@/hooks/useSessionStorage";

// ============================================================================
// Types
// ============================================================================

export type ComplianceView = "overview" | "conflicts" | "walls" | "policies";
export type ComplianceDashboardStatus = "idle" | "pending";

export interface ComplianceDashboardState {
  activeTab: ComplianceView;
  status: ComplianceDashboardStatus;
}

export interface ComplianceDashboardActions {
  setActiveTab: (tab: ComplianceView) => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useComplianceDashboard = (
  initialTab: ComplianceView = "overview"
): [ComplianceDashboardState, ComplianceDashboardActions] => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTabState] = useSessionStorage<ComplianceView>(
    "compliance_active_tab",
    initialTab
  );

  const setActiveTab = useCallback(
    (tab: ComplianceView) => {
      startTransition(() => {
        setActiveTabState(tab);
      });
    },
    [setActiveTabState]
  );

  const status: ComplianceDashboardStatus = isPending ? "pending" : "idle";

  return [
    {
      activeTab,
      status,
    },
    {
      setActiveTab,
    },
  ];
};
