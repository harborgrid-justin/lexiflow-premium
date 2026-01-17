/**
 * Library Hook
 * Production implementation for knowledge management
 */

import { useNotify } from "@/hooks/useNotify";
import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { queryKeys } from "@/utils/queryKeys";

type LibraryDocument = {
  id?: string;
  category?: string;
} & Record<string, unknown>;

export function useLibrary() {
  const notify = useNotify();

  const { data: documents = [], isLoading: documentsLoading } = useQuery<
    LibraryDocument[]
  >(
    queryKeys.documents.byCategory("library"),
    async () => {
      const data = await DataService.documents.getAll();
      return (
        data?.filter((d: LibraryDocument) => d.category === "library") || []
      );
    },
    {
      onError: (error) => {
        console.error("Failed to fetch library documents:", error);
        notify.error("Failed to load library documents");
      },
    },
  );

  const updateDocumentMutation = useMutation(
    async ({ id, data }: { id: string; data: LibraryDocument }) => {
      return await DataService.documents.update(id, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.documents.byCategory("library"));
        notify.success("Document updated successfully");
      },
      onError: (error) => {
        console.error("Failed to update document:", error);
        notify.error("Failed to update document");
      },
    },
  );

  return {
    documents,
    isLoading: documentsLoading,
    updateDocument: updateDocumentMutation.mutateAsync,
  };
}
