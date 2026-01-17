/**
 * Document mutation operations sub-hook
 * @module hooks/useDocumentManager/useDocumentMutations
 */

import { useCallback } from "react";

import { DocumentsApiService } from "@/api/admin/documents-api";
import { queryClient, useMutation } from "@/hooks/useQueryHooks";
import { queryKeys } from "@/utils/query-keys.service";

import type { LegalDocument } from "@/types";

const documentsApi = new DocumentsApiService();

/**
 * Hook for document mutation operations
 */
export function useDocumentMutations() {
  const { mutate: performUpdate } = useMutation(
    async (payload: { id: string; updates: Partial<LegalDocument> }) => {
      try {
        return await documentsApi.update(payload.id, payload.updates);
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
