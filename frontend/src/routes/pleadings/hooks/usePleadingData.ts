/**
 * Pleading Data Management Hook
 *
 * Centralized data fetching and mutations for all pleading components.
 * Production implementation using real backend API endpoints.
 */

import { queryClient, useMutation, useQuery } from "@/hooks/backend";
import { DataService } from "@/services/data/data-service.service";
import type { Pleading } from "@/types";

export function usePleadingData() {
  // Fetch all pleadings using DataService repository
  const {
    data: pleadings = [],
    isLoading: pleadingsLoading,
    refetch: refetchPleadings,
  } = useQuery(["pleadings"], async () => {
    const data = await DataService.pleadings.getAll();
    return data || [];
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery(
    ["pleadings", "templates"],
    async () => {
      const data = await DataService.templates.getAll();
      return data?.filter((t: any) => t.type === "pleading") || [];
    },
  );

  // Fetch citations repository
  const { data: citations = [], isLoading: citationsLoading } = useQuery(
    ["citations"],
    async () => {
      const data = await DataService.citations.getAll();
      return data || [];
    },
  );

  // Fetch evidence repository
  const { data: evidence = [], isLoading: evidenceLoading } = useQuery(
    ["evidence"],
    async () => {
      const data = await DataService.evidence.getAll();
      return data || [];
    },
  );

  // Create/Update pleading
  const savePleadingMutation = useMutation(
    async (pleading: Partial<Pleading> & { id?: string }) => {
      if (pleading.id) {
        return await DataService.pleadings.update(pleading.id, pleading);
      } else {
        return await DataService.pleadings.add(pleading);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["pleadings"]);
      },
    },
  );

  // Delete pleading
  const deletePleadingMutation = useMutation(
    async (id: string) => {
      return await DataService.pleadings.delete(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["pleadings"]);
      },
    },
  );

  // Add citation
  const addCitationMutation = useMutation(
    async (citation: any) => {
      return await DataService.citations.add(citation);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["citations"]);
      },
    },
  );

  return {
    // Data
    pleadings,
    templates,
    citations,
    evidence,

    // Loading state
    isLoading:
      pleadingsLoading ||
      templatesLoading ||
      citationsLoading ||
      evidenceLoading,

    // Mutations
    savePleading: savePleadingMutation.mutateAsync,
    deletePleading: deletePleadingMutation.mutateAsync,
    addCitation: addCitationMutation.mutateAsync,

    // Refetch
    refetchPleadings,
  };
}

/**
 * Hook for pleading editor specific operations
 */
export function usePleadingEditor(pleadingId?: string) {
  // Fetch single pleading for editing
  const { data: pleading, isLoading } = useQuery(
    ["pleadings", pleadingId],
    async () => {
      if (!pleadingId) return null;
      return await DataService.pleadings.getById(pleadingId);
    },
    {
      enabled: !!pleadingId,
    },
  );

  // Auto-save mutation
  const autoSaveMutation = useMutation(async (updates: Partial<Pleading>) => {
    if (!pleadingId) throw new Error("Pleading ID required");
    return await DataService.pleadings.update(pleadingId, updates);
  });

  return {
    pleading,
    isLoading,
    autoSave: autoSaveMutation.mutateAsync,
  };
}
