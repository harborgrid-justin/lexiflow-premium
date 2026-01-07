/**
 * Document filtering logic sub-hook
 * @module hooks/useDocumentManager/useDocumentFilters
 */

import type { LegalDocument } from "@/types";
import { useMemo } from "react";
import { useWorkerSearch } from "../useWorkerSearch";
import { SEARCH_FIELDS } from "./constants";
import {
  applyContextFilters,
  computeDocumentStats,
  extractAllTags,
} from "./utils";

interface UseDocumentFiltersParams {
  documents: LegalDocument[];
  currentFolder: string;
  activeModuleFilter: string;
  searchTerm: string;
}

/**
 * Hook for document filtering operations
 */
export function useDocumentFilters({
  documents,
  currentFolder,
  activeModuleFilter,
  searchTerm,
}: UseDocumentFiltersParams) {
  const contextFilteredDocs = useMemo(
    () =>
      applyContextFilters(
        documents,
        currentFolder,
        activeModuleFilter,
        searchTerm
      ),
    [documents, currentFolder, activeModuleFilter, searchTerm]
  );

  const { filteredItems: filtered, isSearching } = useWorkerSearch({
    items: contextFilteredDocs,
    query: searchTerm,
    fields: SEARCH_FIELDS as unknown as (keyof LegalDocument)[],
  });

  const stats = useMemo(() => computeDocumentStats(documents), [documents]);

  const allTags = useMemo(() => extractAllTags(documents), [documents]);

  return {
    filtered,
    isSearching,
    stats,
    allTags,
  };
}
