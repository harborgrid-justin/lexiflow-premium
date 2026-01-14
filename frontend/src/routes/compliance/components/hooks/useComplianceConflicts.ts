import { useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/dataService";
import { ConflictCheck } from "@/types";
import { queryKeys } from "@/utils/query-keys.service";
import { useCallback, useMemo, useState, useTransition } from "react";

// ============================================================================
// Types
// ============================================================================

export type ComplianceConflictsStatus =
  | "idle"
  | "loading"
  | "filtering"
  | "error";

export interface ComplianceConflictsState {
  conflicts: ConflictCheck[];
  filteredConflicts: ConflictCheck[];
  searchTerm: string;
  status: ComplianceConflictsStatus;
}

export interface ComplianceConflictsActions {
  setSearchTerm: (term: string) => void;
  runNewCheck: () => void;
  exportReport: () => void;
  viewReport: (id: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export const useComplianceConflicts = (): [
  ComplianceConflictsState,
  ComplianceConflictsActions,
] => {
  const [searchTerm, setSearchTermState] = useState("");
  const [isFiltering, startTransition] = useTransition();

  // Data Fetching
  const {
    data: conflicts = [],
    isLoading,
    isError,
  } = useQuery<ConflictCheck[]>(queryKeys.compliance.conflicts(), () =>
    DataService.compliance.getConflicts()
  );

  // Filtering Logic
  const filteredConflicts = useMemo(
    () =>
      conflicts.filter(
        (c) =>
          c.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.checkedBy.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [conflicts, searchTerm]
  );

  // Actions
  const setSearchTerm = useCallback((term: string) => {
    startTransition(() => {
      setSearchTermState(term);
    });
  }, []);

  const runNewCheck = useCallback(() => {
    // Placeholder for navigation or modal triggering
    console.log("Run New Check clicked");
  }, []);

  const exportReport = useCallback(() => {
    console.log("Export clicked");
  }, []);

  const viewReport = useCallback((id: string) => {
    console.log("View PDF for", id);
  }, []);

  // Status Machine
  const status: ComplianceConflictsStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : isFiltering
        ? "filtering"
        : "idle";

  return [
    {
      conflicts,
      filteredConflicts,
      searchTerm,
      status,
    },
    {
      setSearchTerm,
      runNewCheck,
      exportReport,
      viewReport,
    },
  ];
};
