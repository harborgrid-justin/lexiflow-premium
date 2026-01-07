/**
 * Document data fetching sub-hook
 * @module hooks/useDocumentManager/useDocumentData
 */

import { DataService } from "@/services/data/dataService";
import type { LegalDocument } from "@/types";
import { queryKeys } from "@/utils/queryKeys";
import { useMemo } from "react";
import { useQuery } from "../useQueryHooks";

/**
 * Hook for fetching and managing document data
 */
export function useDocumentData() {
  const { data: documents = [], isLoading } = useQuery<LegalDocument[]>(
    queryKeys.documents.all(),
    async () => {
      try {
        return await DataService.documents.getAll();
      } catch (error) {
        console.error("[useDocumentManager] Error fetching documents:", error);
        throw error;
      }
    }
  );

  const documentsArray = useMemo(() => {
    return Array.isArray(documents) ? documents : [];
  }, [documents]);

  return { documents: documentsArray, isLoading };
}
