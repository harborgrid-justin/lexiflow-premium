/**
 * Document mutation operations sub-hook
 * @module hooks/useDocumentManager/useDocumentMutations
 */

import { DataService } from "@/services/data/dataService";
import type { LegalDocument } from "@/types";
import { queryKeys } from "@/utils/queryKeys";
import { useCallback } from "react";
import { queryClient, useMutation } from "../useQueryHooks";

/**
 * Hook for document mutation operations
 */
export function useDocumentMutations() {
  const { mutate: performUpdate } = useMutation(
    async (payload: { id: string; updates: Partial<LegalDocument> }) => {
      try {
        return await DataService.documents.update(payload.id, payload.updates);
      } catch (error) {
        console.error("[useDocumentManager] Update mutation error:", error);
        throw error;
      }
    },
    {
      invalidateKeys: [queryKeys.documents.all()],
    }
  );

  const setDocuments = useCallback(
    (
      newDocs: LegalDocument[] | ((prev: LegalDocument[]) => LegalDocument[])
    ) => {
      try {
        queryClient.setQueryData(
          queryKeys.documents.all(),
          (old: LegalDocument[] | undefined) => {
            if (typeof newDocs === "function") {
              return newDocs(old || []);
            }
            return newDocs;
          }
        );
      } catch (error) {
        console.error("[useDocumentManager.setDocuments] Error:", error);
      }
    },
    []
  );

  return { performUpdate, setDocuments };
}
