/**
 * Evidence data fetching sub-hook
 * @module hooks/useEvidenceManager/useEvidenceData
 */

import { useMemo } from "react";

import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { queryKeys } from "@/utils/query-keys.service";

import { filterByCaseId, normalizeEvidenceResponse } from "./utils";

import type { EvidenceItem } from "@/types";

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
