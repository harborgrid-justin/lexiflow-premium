/**
 * Documents Management Hook
 * Production implementation using actual DataService repositories
 */

import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import type { Document } from "@/types";

export function useDocuments() {
  // Fetch all documents from repository
  const { data: documents = [], isLoading: documentsLoading } = useQuery(
    ["documents"],
    async () => {
      const data = await DataService.documents.getAll();
      return data || [];
    },
  );

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery(
    ["templates"],
    async () => {
      const data = await DataService.templates.getAll();
      return data || [];
    },
  );

  // Upload document
  const uploadDocumentMutation = useMutation(
    async (formData: FormData) => {
      // Use actual document upload API
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["documents"]);
      },
    },
  );

  // Update document
  const updateDocumentMutation = useMutation(
    async ({ id, data }: { id: string; data: Partial<Document> }) => {
      return await DataService.documents.update(id, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["documents"]);
      },
    },
  );

  // Delete document
  const deleteDocumentMutation = useMutation(
    async (id: string) => {
      return await DataService.documents.delete(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["documents"]);
      },
    },
  );

  return {
    documents,
    templates,
    isLoading: documentsLoading || templatesLoading,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    updateDocument: updateDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
  };
}

/**
 * Hook for single document operations
 */
export function useDocument(documentId?: string) {
  const { data: document, isLoading } = useQuery(
    ["documents", documentId],
    async () => {
      if (!documentId) return null;
      return await DataService.documents.getById(documentId);
    },
    {
      enabled: !!documentId,
    },
  );

  return {
    document,
    isLoading,
  };
}
