/**
 * Evidence data fetching sub-hook
 * @module hooks/useEvidenceManager/useEvidenceData
 */

import { DataService } from "@/services/data/dataService";
import type { EvidenceItem } from "@/types";
import { queryKeys } from "@/utils/queryKeys";
import { useMemo } from "react";
import { useQuery } from "../useQueryHooks";
import { filterByCaseId, normalizeEvidenceResponse } from "./utils";

/**
 * Hook for fetching and managing evidence data
 */
export function useEvidenceData(caseId?: string) {
  const { data, isLoading } = useQuery<EvidenceItem[]>(
    caseId ? queryKeys.evidence.byCaseId(caseId) : queryKeys.evidence.all(),
    () => DataService.evidence.getAll(caseId)
  );

  const allEvidenceItems = useMemo(
    () => normalizeEvidenceResponse(data),
    [data]
  );

  const evidenceItems = useMemo(
    () => filterByCaseId(allEvidenceItems, caseId),
    [allEvidenceItems, caseId]
  );

  return {
    allEvidenceItems,
    evidenceItems,
    isLoading,
  };
}
