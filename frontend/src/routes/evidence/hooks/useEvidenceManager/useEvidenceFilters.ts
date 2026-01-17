/**
 * Evidence filtering logic sub-hook
 * @module hooks/useEvidenceManager/useEvidenceFilters
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_FILTERS } from "./constants";
import { applyEvidenceFilters } from "./utils";

import type { EvidenceFilters } from "./types";
import type { EvidenceItem } from "@/types";

interface UseEvidenceFiltersParams {
  evidenceItems: EvidenceItem[];
  caseId?: string;
}

/**
 * Hook for evidence filtering operations
 */
export function useEvidenceFilters({
  evidenceItems,
  caseId,
}: UseEvidenceFiltersParams) {
  const [filters, setFilters] = useState<EvidenceFilters>({
    ...DEFAULT_FILTERS,
    caseId: caseId || "",
  });

  // Sync caseId filter when prop changes
  useEffect(() => {
    if (caseId) {
      setFilters((f) => ({ ...f, caseId }));
      console.log(
        `[useEvidenceManager] Filter synchronized with caseId: ${caseId}`
      );
    }
  }, [caseId]);

  const filteredItems = useMemo(
    () => applyEvidenceFilters(evidenceItems, filters),
    [evidenceItems, filters]
  );

  const updateFilter = useCallback(
    <K extends keyof EvidenceFilters>(key: K, value: EvidenceFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      caseId: caseId || "",
    });
  }, [caseId]);

  return {
    filters,
    setFilters,
    filteredItems,
    updateFilter,
    clearFilters,
  };
}
