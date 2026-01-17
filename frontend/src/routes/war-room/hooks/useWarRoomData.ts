/**
 * useWarRoomData Hook
 *
 * Centralized data fetching for war room components
 * Handles all DataService/api interactions for the war-room domain
 *
 * @module routes/war-room/hooks/useWarRoomData
 */

import { useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { queryKeys } from "@/utils/queryKeys";

import type { Advisor, Case, Expert, WarRoom, WarRoomData } from "@/types";

/**
 * Hook to fetch war room details by room ID (case ID)
 */
export function useWarRoomDetail(roomId: string) {
  const {
    data: caseData,
    isLoading: caseLoading,
    error: caseError,
  } = useQuery<Case>(queryKeys.cases.detail(roomId), () =>
    DataService.cases.getById(roomId),
  );

  const { data: advisors = [], isLoading: advisorsLoading } = useQuery<
    Advisor[]
  >(
    queryKeys.warRoom.advisors(roomId),
    () => DataService.warRoom.getAdvisors({ caseId: roomId }),
    { enabled: !!roomId },
  );

  const { data: experts = [], isLoading: expertsLoading } = useQuery<Expert[]>(
    queryKeys.warRoom.experts(roomId),
    () => DataService.warRoom.getExperts({ caseId: roomId }),
    { enabled: !!roomId },
  );

  return {
    caseData,
    advisors,
    experts,
    isLoading: caseLoading || advisorsLoading || expertsLoading,
    error: caseError,
  };
}

/**
 * Hook to fetch all advisors (optionally filtered by case)
 */
export function useAdvisors(caseId?: string) {
  return useQuery<Advisor[]>(queryKeys.warRoom.advisors(caseId || ""), () =>
    DataService.warRoom.getAdvisors(caseId ? { caseId } : undefined),
  );
}

/**
 * Hook to fetch opposition data for a case
 */
export function useOpposition(caseId: string) {
  return useQuery(
    queryKeys.warRoom.opposition(caseId),
    () => DataService.warRoom.getOpposition(caseId),
    { enabled: !!caseId },
  );
}

/**
 * Hook to fetch opposition case history
 */
export function useOppositionHistory(entityId: string) {
  const warRoomService = DataService.warRoom as {
    getOppositionCaseHistory?: (id: string) => Promise<unknown>;
  };
  return useQuery(
    ["opposition-history", entityId],
    async () =>
      warRoomService.getOppositionCaseHistory
        ? warRoomService.getOppositionCaseHistory(entityId)
        : [],
    { enabled: !!entityId },
  );
}

/**
 * Hook to fetch discovery sanctions for a case
 */
export function useDiscoverySanctions(caseId: string) {
  return useQuery(
    queryKeys.sanctions.byCase(caseId),
    () => DataService.discovery.getSanctions(caseId),
    { enabled: !!caseId },
  );
}

/**
 * Hook to fetch all cases for war room manager
 */
export function useAllCases() {
  return useQuery<Case[]>(queryKeys.cases.all(), () =>
    DataService.cases.getAll(),
  );
}

/**
 * Hook to fetch war room data for a specific case
 */
export function useWarRoomData(caseId: string) {
  return useQuery<WarRoomData>(
    ["war-room-data", caseId],
    () => {
      const warRoomService = DataService.warRoom as {
        getData: (caseId: string) => Promise<WarRoomData>;
      };
      return warRoomService.getData(caseId);
    },
    { enabled: !!caseId },
  );
}

/**
 * Hook for war room mutations (update, delete)
 */
export function useWarRoomMutations(roomId: string) {
  const updateMutation = useMutation((updates: Partial<WarRoom>) =>
    DataService.warRoom.update(roomId, updates),
  );

  const deleteMutation = useMutation(() => DataService.warRoom.delete(roomId));

  return {
    updateWarRoom: updateMutation.mutate,
    deleteWarRoom: deleteMutation.mutate,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}
