import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { EthicalWall } from "@/types";
import { queryKeys } from "@/utils/query-keys.service";
import { useCallback, useTransition } from "react";

// ============================================================================
// Types
// ============================================================================

export type ComplianceWallsStatus = "idle" | "loading" | "error";

export interface ComplianceWallsState {
  walls: EthicalWall[];
  status: ComplianceWallsStatus;
}

export interface ComplianceWallsActions {
  createWall: () => void;
  manageWall: (wallId: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useComplianceWalls = (): [
  ComplianceWallsState,
  ComplianceWallsActions,
] => {
  const [_isPending, _startTransition] = useTransition(); // Reserved for actions

  const {
    data: walls = [],
    isLoading,
    isError,
  } = useQuery<EthicalWall[]>(queryKeys.compliance.ethicalWalls(), () =>
    DataService.compliance.getEthicalWalls()
  );

  const createWall = useCallback(() => {
    console.log("Create Wall");
  }, []);

  const manageWall = useCallback((wallId: string) => {
    console.log("Manage Wall", wallId);
  }, []);

  const status: ComplianceWallsStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : "idle";

  return [
    {
      walls,
      status,
    },
    {
      createWall,
      manageWall,
    },
  ];
};
